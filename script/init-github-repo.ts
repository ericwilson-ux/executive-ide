// Script to initialize empty GitHub repository with README and push all code
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Files and directories to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.git',
  '.cache',
  '.local',
  '.upm',
  'package-lock.json',
  '.replit',
  'attached_assets',
];

function shouldSkip(filePath: string): boolean {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dirPath: string, basePath: string = ''): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
    
    if (shouldSkip(relativePath)) continue;
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      } catch (err) {
        console.log(`Skipping binary or unreadable file: ${relativePath}`);
      }
    }
  }
  
  return files;
}

async function initAndPush() {
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repo = 'executive-ide';
  
  console.log(`Initializing ${owner}/${repo}...`);
  
  // First, create an initial commit with README to initialize the repo
  const readmeContent = `# Executive IDE

Personal command center web application for managing priorities, projects, notes, people, and action items.

## Features

- IDE-inspired workspace with dark/light theme
- Collapsible sidebar tree for organizing content
- Tab-based navigation with split panes
- Rich text editor with @mentions and #tags
- Action item management with status tracking
- Command palette for quick navigation
- Full-text search across all content

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TipTap, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up PostgreSQL database and configure DATABASE_URL
4. Run migrations: \`npm run db:push\`
5. Start development server: \`npm run dev\`

## License

MIT
`;

  // Create initial file to initialize repository
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Initial commit: Add README',
      content: Buffer.from(readmeContent).toString('base64'),
    });
    console.log('Repository initialized with README');
  } catch (err: any) {
    console.log('README may already exist, continuing...');
  }
  
  // Wait a moment for GitHub to process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get the current commit SHA from main branch
  let mainRef;
  try {
    mainRef = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main',
    });
  } catch {
    // Try master branch
    mainRef = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/master',
    });
  }
  
  const baseCommitSha = mainRef.data.object.sha;
  console.log('Base commit SHA:', baseCommitSha);
  
  // Get base tree
  const { data: baseCommit } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: baseCommitSha,
  });
  
  const baseTreeSha = baseCommit.tree.sha;
  console.log('Base tree SHA:', baseTreeSha);
  
  // Get all files
  const files = getAllFiles('.');
  console.log(`Found ${files.length} files to upload`);
  
  // Create blobs for each file
  const blobs: { path: string; sha: string; mode: '100644'; type: 'blob' }[] = [];
  
  for (const file of files) {
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64'
      });
      blobs.push({
        path: file.path,
        sha: blob.sha,
        mode: '100644',
        type: 'blob'
      });
      console.log(`Uploaded: ${file.path}`);
    } catch (err: any) {
      console.error(`Failed to upload ${file.path}:`, err.message);
    }
  }
  
  if (blobs.length === 0) {
    throw new Error('No files were uploaded');
  }
  
  // Create tree with base tree
  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: blobs
  });
  
  console.log('Created tree:', tree.sha);
  
  // Create commit
  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Add Executive IDE - Personal command center application',
    tree: tree.sha,
    parents: [baseCommitSha]
  });
  
  console.log('Created commit:', commit.sha);
  
  // Update main/master branch reference
  try {
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.sha,
    });
    console.log('Updated main branch');
  } catch {
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/master',
      sha: commit.sha,
    });
    console.log('Updated master branch');
  }
  
  console.log(`\n✅ Success! Repository: https://github.com/${owner}/${repo}`);
}

initAndPush().catch(console.error);
