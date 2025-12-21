import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';
import { User } from './types';
import usersSeed from '@/data/users.json';

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');
const SEED_USERS = usersSeed as unknown as User[];
const KV_KEY = 'users';

const isProduction = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';

export async function getUsers(): Promise<User[]> {
  if (isProduction) {
    try {
      const users = await kv.get<User[]>(KV_KEY);
      if (users && Array.isArray(users)) {
        return users;
      }
      await kv.set(KV_KEY, SEED_USERS);
      return SEED_USERS;
    } catch (error) {
      console.error('Error reading users from KV:', error);
      return SEED_USERS;
    }
  }

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
  if (isProduction) {
    try {
      await kv.set(KV_KEY, users);
      return true;
    } catch (error) {
      console.error('Error saving users to KV:', error);
      return false;
    }
  }

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
