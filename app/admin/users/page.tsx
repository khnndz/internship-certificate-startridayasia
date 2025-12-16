import { getUsers } from '@/lib/data';
import UserListClient from './UserListClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = getUsers();
  
  return <UserListClient initialUsers={users} />;
}
