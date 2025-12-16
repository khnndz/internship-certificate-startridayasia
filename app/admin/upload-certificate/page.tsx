import { getUsers } from '@/lib/data';
import UploadFormClient from './UploadFormClient';

export const dynamic = 'force-dynamic';

export default async function UploadCertificatePage() {
  const users = getUsers();
  
  return <UploadFormClient users={users} />;
}
