// Script to create GitHub repository and push code
import { Octokit } from '@octokit/rest';

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

async function createRepo() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user info
    const { data: user } = await octokit.users.getAuthenticated();
    console.log('Authenticated as:', user.login);
    
    // Try to create repository
    try {
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name: 'executive-ide',
        description: 'Executive IDE - Personal command center for managing priorities, projects, notes, people, and action items',
        private: false,
        auto_init: false
      });
      
      console.log('Repository created:', repo.html_url);
      console.log('Clone URL:', repo.clone_url);
      console.log('SSH URL:', repo.ssh_url);
      console.log('Owner:', user.login);
      return { owner: user.login, repo: 'executive-ide', url: repo.html_url };
    } catch (createError: any) {
      if (createError.status === 422) {
        console.log('Repository already exists, fetching info...');
        const { data: repo } = await octokit.repos.get({
          owner: user.login,
          repo: 'executive-ide'
        });
        console.log('Repository URL:', repo.html_url);
        console.log('Clone URL:', repo.clone_url);
        console.log('Owner:', user.login);
        return { owner: user.login, repo: 'executive-ide', url: repo.html_url };
      }
      throw createError;
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
}

createRepo();
