# Supabase Migration Guide

This document describes the migration from JSON file storage to Supabase database and storage.

## What Changed

### Database Storage
- **Before:** Data stored in `data/users.json` file
- **After:** Data stored in Supabase PostgreSQL database

### File Storage
- **Before:** PDF files stored in `public/certificates/` directory
- **After:** PDF files stored in Supabase Storage bucket

### Authentication
- **Unchanged:** JWT-based authentication continues to work
- Password hashes are compatible between systems (bcrypt)

## Implementation Details

### New Files
1. **`lib/supabase.ts`**: Supabase client configuration and type definitions
   - Database types (DbUser, DbCertificate)
   - Legacy compatibility types (User, Certificate)
   - Helper conversion functions

### Modified Files
1. **`lib/data-kv.ts`**: Now uses Supabase instead of GitHub/JSON
   - `getUsers()` - Queries users table with certificates
   - `getUserById()` - Single user query with certificates
   - `getUserByEmail()` - Email-based user lookup
   - `addUser()` - Insert new user to database
   - `updateUser()` - Update user in database
   - `deleteUser()` - Delete user (cascades to certificates)
   - New: `addCertificate()` - Add certificate to database
   - New: `deleteCertificate()` - Delete certificate from database
   - New: `getCertificateById()` - Get certificate by ID

2. **`lib/file-storage.ts`**: Now uses Supabase Storage
   - `saveCertificateFile()` - Upload to Supabase Storage bucket
   - `getCertificateFile()` - Download from Supabase Storage
   - `deleteCertificateFile()` - Delete from Supabase Storage
   - `getCertificateSignedUrl()` - Generate signed URLs for downloads

3. **`app/actions/admin.ts`**: Updated to use new data layer
   - Uses individual CRUD functions instead of bulk saveUsers()
   - Certificate operations now update database records
   - File operations integrated with storage operations

### Unchanged Files
- **`app/actions/auth.ts`**: Already used data-kv.ts, now automatically uses Supabase
- **`app/api/auth/me/route.ts`**: Already used getUserById, now automatically uses Supabase
- **`app/api/users/route.ts`**: Already used getUsers, now automatically uses Supabase
- **`app/api/download/[filename]/route.ts`**: Already used getCertificateFile, now automatically uses Supabase
- **`lib/auth.ts`**: JWT logic unchanged
- **`lib/types.ts`**: Type definitions unchanged

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  status TEXT NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Certificates Table
```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cert_number TEXT UNIQUE NOT NULL,
  intern_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features
- **Foreign Key Constraint**: `user_id` references `users(id)` with `ON DELETE CASCADE`
  - When a user is deleted, all their certificates are automatically deleted
- **Indexes**: Created on email and user_id for faster queries
- **RLS Policies**: Enabled for security (configured to allow authenticated access)

## Storage Configuration

### Bucket Setup
- **Bucket Name**: `certificates`
- **Access**: Public or with RLS policies
- **File Format**: PDF only
- **Naming**: `{sanitized-name}-{timestamp}-{uuid}.pdf`

### File Operations
- Upload: Uses `supabase.storage.from('certificates').upload()`
- Download: Uses `supabase.storage.from('certificates').download()`
- Delete: Uses `supabase.storage.from('certificates').remove()`
- Signed URLs: Uses `createSignedUrl()` for secure downloads

## Migration Notes

### Data Mapping
JSON format to Database format:

**User Object**
```javascript
// JSON format (legacy)
{
  id: "u1234567890",
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...", // bcrypt hash
  role: "user",
  status: "Aktif",
  certificates: [...]
}

// Database format (new)
{
  id: "uuid-v4",
  name: "John Doe",
  email: "john@example.com",
  password_hash: "$2a$10$...", // same bcrypt hash
  role: "user",
  status: "Aktif",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

**Certificate Object**
```javascript
// JSON format (legacy - nested in user)
{
  id: "cert1234567890",
  title: "Internship Certificate",
  file: "john-doe-1234567890-uuid.pdf",
  issuedAt: "2024-01-01",
  expiryDate: "2024-12-31"
}

// Database format (new - separate table)
{
  id: "uuid-v4",
  user_id: "user-uuid",
  cert_number: "cert1234567890",
  intern_name: "John Doe",
  position: "Internship Certificate",
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  pdf_url: "john-doe-1234567890-uuid.pdf",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

### Compatibility Layer
The `lib/supabase.ts` file includes helper functions to convert between database format and legacy format:
- `dbUserToLegacy()` - Converts DB user to legacy User type
- `dbCertificateToLegacy()` - Converts DB certificate to legacy Certificate type

This ensures backward compatibility with existing code that expects the legacy format.

## Environment Variables

### Required
```env
JWT_SECRET=your-secret-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Removed (No Longer Needed)
- `GITHUB_TOKEN` - No longer using GitHub for storage
- `GITHUB_OWNER` - No longer using GitHub for storage
- `GITHUB_REPO` - No longer using GitHub for storage
- `GITHUB_BRANCH` - No longer using GitHub for storage

## Testing Checklist

After migration, verify the following functionality:

### Admin Tests
- [ ] Login as admin (admin@gmail.com / admin123)
- [ ] View admin dashboard with statistics
- [ ] Create new user
- [ ] Update existing user
- [ ] Upload certificate for user (single file)
- [ ] Upload multiple certificates for user
- [ ] Delete certificate
- [ ] Delete user (verify certificates are cascade deleted)
- [ ] Update admin profile

### User Tests
- [ ] Login as regular user
- [ ] View user dashboard
- [ ] View certificate list
- [ ] Download certificate PDF
- [ ] Verify access control (can't access other users' certificates)

### API Tests
- [ ] GET /api/auth/me returns user data
- [ ] GET /api/users returns all users (admin only)
- [ ] GET /api/download/[filename] downloads correct file
- [ ] Verify unauthorized access is blocked

## Rollback Plan

If migration needs to be rolled back:

1. Revert code changes to previous commit
2. Keep Supabase project (no deletion needed)
3. The old JSON file (`data/users.json`) still exists and can be used
4. Re-deploy with old code

Note: The migration is designed to be additive - old files are not deleted, only replaced in functionality.

## Performance Improvements

### Database
- Indexed queries on email and user_id for faster lookups
- Connection pooling managed by Supabase
- Optimized queries with proper SELECT statements

### Storage
- Supabase CDN for faster file delivery
- Signed URLs for secure, temporary access
- No need to load entire file into memory for listing operations

### Caching
- Can implement Redis/Vercel KV caching layer if needed
- Query results can be cached with proper invalidation

## Security Improvements

### Database
- Row Level Security (RLS) policies enabled
- Parameterized queries (SQL injection protection)
- Foreign key constraints for data integrity

### Storage
- Signed URLs expire after 1 hour
- Access control via API routes
- File type validation (PDF only)
- File size limits (10MB per file)

### Authentication
- Same JWT-based authentication
- HTTP-only cookies prevent XSS
- Bcrypt password hashing (compatible with old hashes)

## Future Enhancements

### Potential Improvements
1. Add full-text search for certificates
2. Implement certificate versioning
3. Add certificate templates
4. Add bulk user import/export
5. Add audit logging for user actions
6. Implement real-time updates with Supabase Realtime
7. Add certificate expiry notifications
8. Implement certificate verification by QR code

### Infrastructure
1. Add Redis caching layer
2. Implement CDN for static assets
3. Add monitoring and alerting
4. Implement automated backups
5. Add load testing

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Check Next.js documentation: https://nextjs.org/docs
3. Review the code comments and type definitions
4. Contact the development team

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
