// Data module - Uses GitHub API for production, local file for development
// This replaces Vercel KV with free unlimited GitHub storage

import fs from 'fs';
import path from 'path';
import { User } from './types';
import usersSeed from '@/data/users.json';

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');
const SEED_USERS = usersSeed as unknown as User[];

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_FILE_PATH = 'data/users.json';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const isProduction = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
const useGitHub = isProduction && GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO;

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

// Cache untuk mengurangi API calls
let cachedUsers: User[] | null = null;
let cachedSha: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 detik cache

async function getFileFromGitHub(): Promise<{ users: User[]; sha: string }> {
  // Check cache
  if (cachedUsers && cachedSha && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return { users: cachedUsers, sha: cachedSha };
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('GitHub API Error:', response.status, await response.text());
    return { users: SEED_USERS, sha: '' };
  }

  const data: GitHubFileResponse = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  const users = JSON.parse(content) as User[];

  // Update cache
  cachedUsers = users;
  cachedSha = data.sha;
  cacheTimestamp = Date.now();

  return { users, sha: data.sha };
}

async function saveFileToGitHub(users: User[], sha: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
  
  const content = Buffer.from(JSON.stringify(users, null, 2)).toString('base64');
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Update users data - ${new Date().toISOString()}`,
      content: content,
      sha: sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!response.ok) {
    console.error('GitHub API Save Error:', response.status, await response.text());
    return false;
  }

  // Update cache
  const result = await response.json();
  cachedUsers = users;
  cachedSha = result.content.sha;
  cacheTimestamp = Date.now();

  return true;
}

export async function getUsers(): Promise<User[]> {
  if (useGitHub) {
    try {
      const { users } = await getFileFromGitHub();
      return users;
    } catch (error) {
      console.error('Error reading users from GitHub:', error);
      return SEED_USERS;
    }
  }

  // Local development - use file system
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as User[]) : SEED_USERS;
  } catch (error) {
    console.error('Error reading users from file:', error);
    return SEED_USERS;
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(user => user.id === id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

export async function saveUsers(users: User[]): Promise<boolean> {
  if (useGitHub) {
    try {
      const { sha } = await getFileFromGitHub();
      return await saveFileToGitHub(users, sha);
    } catch (error) {
      console.error('Error saving users to GitHub:', error);
      return false;
    }
  }

  // Local development - use file system
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving users to file:', error);
    return false;
  }
}

export async function addUser(user: User): Promise<boolean> {
  const users = await getUsers();
  users.push(user);
  return saveUsers(users);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  const users = await getUsers();
  const index = users.findIndex(user => user.id === id);
  
  if (index === -1) return false;
  
  users[index] = { ...users[index], ...updates };
  return saveUsers(users);
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length === users.length) return false;
  
  return saveUsers(filteredUsers);
}

export function generateUserId(): string {
  return `u${Date.now()}`;
}

export function generateCertificateId(): string {
  return `cert${Date.now()}`;
}

// Invalidate cache (call after external changes)
export function invalidateCache(): void {
  cachedUsers = null;
  cachedSha = null;
  cacheTimestamp = 0;
}
