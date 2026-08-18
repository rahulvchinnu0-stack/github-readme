import { GitHubUser, GitHubUserRepo } from '@/src/types/readme';

/**
 * Extracts a clean GitHub username from a profile URL, handle, or raw string.
 * Supports:
 * - https://github.com/torvalds
 * - https://github.com/torvalds/
 * - github.com/torvalds
 * - @torvalds
 * - torvalds
 */
export function extractGitHubUsername(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();

  // If starts with @
  if (clean.startsWith('@')) {
    return clean.slice(1).trim() || null;
  }

  // If it's a URL
  try {
    const url = clean.startsWith('http://') || clean.startsWith('https://')
      ? new URL(clean)
      : new URL(`https://${clean}`);

    if (url.hostname.includes('github.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 1) {
        return parts[0];
      }
    }
  } catch {
    // Fall through to regex
  }

  // Match github.com/username or plain username
  const match = clean.match(/(?:github\.com\/)?([a-zA-Z0-9_-]+)\/?$/i);
  if (match && match[1]) {
    return match[1];
  }

  return clean || null;
}

/**
 * Fetches authentic GitHub user details from GitHub's REST API.
 */
export async function fetchGitHubUserProfile(
  usernameOrUrl: string,
  token?: string
): Promise<GitHubUser> {
  const username = extractGitHubUsername(usernameOrUrl);
  if (!username) {
    throw new Error('Please enter a valid GitHub profile link or username.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  // 1. Fetch user profile
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers,
  });

  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error(`GitHub user "@${username}" not found. Please verify the profile link.`);
    }
    if (userRes.status === 403) {
      throw new Error('GitHub API rate limit reached for unauthenticated requests. Please wait a moment or enter a Personal Access Token.');
    }
    throw new Error(`Failed to fetch GitHub profile: HTTP ${userRes.status}`);
  }

  const data = await userRes.json();

  // 2. Fetch recent public repos
  let recentRepos: GitHubUserRepo[] = [];
  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`,
      { headers }
    );
    if (reposRes.ok) {
      const rawRepos = await reposRes.json();
      if (Array.isArray(rawRepos)) {
        recentRepos = rawRepos.map((r: any) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          htmlUrl: r.html_url,
          stars: r.stargazers_count || 0,
          forks: r.forks_count || 0,
          language: r.language,
          defaultBranch: r.default_branch || 'main',
          isPrivate: !!r.private,
          updatedAt: r.updated_at,
        }));
      }
    }
  } catch (repoErr) {
    console.warn('Could not fetch user public repos:', repoErr);
  }

  return {
    id: data.id,
    login: data.login,
    name: data.name || data.login,
    avatarUrl: data.avatar_url || `https://github.com/${data.login}.png`,
    htmlUrl: data.html_url || `https://github.com/${data.login}`,
    email: data.email || undefined,
    bio: data.bio || undefined,
    publicRepos: data.public_repos ?? 0,
    followers: data.followers ?? 0,
    location: data.location || undefined,
    company: data.company || undefined,
    accessToken: token?.trim() || undefined,
    recentRepos,
  };
}
