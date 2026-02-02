// Script to push code to GitHub repository using Octokit
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

async function pushToGitHub() {
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repo = 'executive-ide';
  
  console.log(`Pushing to ${owner}/${repo}...`);
  
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
  
  // Create tree
  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    tree: blobs
  });
  
  console.log('Created tree:', tree.sha);
  
  // Create commit
  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Initial commit: Executive IDE - Personal command center app',
    tree: tree.sha
  });
  
  console.log('Created commit:', commit.sha);
  
  // Update main branch reference
  try {
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.sha,
      force: true
    });
    console.log('Updated main branch');
  } catch (err) {
    // Branch might not exist, create it
    await octokit.git.createRef({
      owner,
      repo,
      ref: 'refs/heads/main',
      sha: commit.sha
    });
    console.log('Created main branch');
  }
  
  console.log(`\nSuccess! Repository: https://github.com/${owner}/${repo}`);
}

pushToGitHub().catch(console.error);
