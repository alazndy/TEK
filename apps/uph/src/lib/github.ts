// GitHub API Service
// Note: For public repos, no token needed. For private repos, use GITHUB_TOKEN

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  updated_at: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: Array<{ name: string; color: string }>;
  assignee: { login: string; avatar_url: string } | null;
}

const GITHUB_API_BASE = 'https://api.github.com';

// Mock data for when GitHub API is not available
const mockRepoInfo: GitHubRepo = {
  id: 1,
  name: 'demo-project',
  full_name: 'user/demo-project',
  description: 'Demo project for testing',
  html_url: 'https://github.com/user/demo-project',
  language: 'TypeScript',
  stargazers_count: 42,
  open_issues_count: 5,
  updated_at: new Date().toISOString()
};

const mockIssues: GitHubIssue[] = [
  {
    id: 1,
    number: 1,
    title: 'Setup project structure',
    body: 'Initialize the project with all necessary configurations',
    state: 'open',
    html_url: 'https://github.com/user/demo-project/issues/1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    labels: [{ name: 'enhancement', color: 'a2eeef' }],
    assignee: null
  },
  {
    id: 2,
    number: 2,
    title: 'Add authentication',
    body: 'Implement user login and registration',
    state: 'open',
    html_url: 'https://github.com/user/demo-project/issues/2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    labels: [{ name: 'feature', color: '0e8a16' }],
    assignee: null
  },
  {
    id: 3,
    number: 3,
    title: 'Fix responsive layout',
    body: 'Mobile view is broken on smaller screens',
    state: 'open',
    html_url: 'https://github.com/user/demo-project/issues/3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    labels: [{ name: 'bug', color: 'd73a4a' }],
    assignee: null
  }
];

export async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepo> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      console.warn(`GitHub API error: ${response.status}, using mock data`);
      return mockRepoInfo;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching repo info:', error);
    return mockRepoInfo;
  }
}

export async function fetchIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=open&per_page=30`, {
      headers,
      next: { revalidate: 60 } // Cache for 1 minute
    });
    
    if (!response.ok) {
      console.warn(`GitHub API error: ${response.status}, using mock data`);
      return mockIssues;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching issues:', error);
    return mockIssues;
  }
}

export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, {
      headers,
      next: { revalidate: 300 }
    });

    if (!response.ok) {
       if (response.status === 404) return null;
       console.warn(`GitHub API error (README): ${response.status}`);
       return null;
    }

    const data = await response.json();
    // GitHub API returns content in Base64
    if (data.content && data.encoding === 'base64') {
        try {
             // Universal base64 decode (works in browser and node)
             const decoded = typeof window === 'undefined' 
                ? Buffer.from(data.content, 'base64').toString('utf-8')
                : atob(data.content.replace(/\s/g, ''));
             return decoded;
        } catch (e) {
            console.error('Error decoding README:', e);
            return null;
        }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching README:', error);
    return null;
  }
}

// Convert GitHub issues to project tasks
export function issuesToTasks(issues: GitHubIssue[]): Array<{
  title: string;
  completed: boolean;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  githubIssueNumber?: number;
  githubIssueUrl?: string;
}> {
  return issues.map(issue => ({
    title: `#${issue.number}: ${issue.title}`,
    completed: issue.state === 'closed',
    status: issue.state === 'closed' ? 'done' : 'todo',
    githubIssueNumber: issue.number,
    githubIssueUrl: issue.html_url
  }));
}

export type { GitHubRepo, GitHubIssue };
