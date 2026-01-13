import { getUsers } from '@/lib/data-kv';
import UserListClient from './UserListClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getUsers();
  
  return <UserListClient users={users} />;
}
