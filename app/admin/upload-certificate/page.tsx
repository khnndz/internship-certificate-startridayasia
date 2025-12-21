import { getUsers } from '@/lib/data-kv';
import UploadFormClient from './UploadFormClient';

export const dynamic = 'force-dynamic';

export default async function UploadCertificatePage() {
  const users = await getUsers();
  
  return <UploadFormClient users={users} />;
}
