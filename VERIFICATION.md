# Migration Verification Checklist

## Pre-Deployment Checklist

### Environment Setup
- [ ] Supabase project created
- [ ] Database tables created (users, certificates)
- [ ] Storage bucket created (certificates)
- [ ] RLS policies configured
- [ ] Admin user created in database
- [ ] Environment variables set in `.env.local`
  - [ ] JWT_SECRET
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

### Code Verification
- [x] TypeScript compilation passes with no errors
- [x] No references to old JSON storage in active code
- [x] All imports updated to use Supabase
- [x] Code review completed and feedback addressed
- [x] Security scan completed with no vulnerabilities
- [x] UUID generation works with fallback for older Node.js
- [x] Title parsing handles edge cases properly
- [x] File path extraction validated

### Documentation
- [x] README.md updated with Supabase instructions
- [x] MIGRATION.md created with comprehensive guide
- [x] Database schema documented
- [x] Environment variables documented
- [x] Admin credentials documented

## Post-Deployment Testing

### Admin Tests
- [ ] Login as admin (admin@gmail.com / admin123)
- [ ] View admin dashboard
- [ ] Check dashboard statistics display correctly
- [ ] Create new user
  - [ ] Verify user appears in database
  - [ ] Check email uniqueness validation works
  - [ ] Test password length validation
- [ ] Update existing user
  - [ ] Change name
  - [ ] Change email (verify uniqueness)
  - [ ] Change password
  - [ ] Change status
- [ ] Upload certificate
  - [ ] Single file upload
  - [ ] Multiple files upload
  - [ ] Verify files in Supabase Storage
  - [ ] Verify metadata in database
  - [ ] Check file size validation (10MB limit)
  - [ ] Check file type validation (PDF only)
- [ ] Delete certificate
  - [ ] Verify file removed from storage
  - [ ] Verify record removed from database
- [ ] Delete user
  - [ ] Verify user removed from database
  - [ ] Verify certificates cascade deleted
  - [ ] Verify certificate files removed from storage
- [ ] Update admin profile
  - [ ] Change name
  - [ ] Change password
  - [ ] Verify changes persist after logout/login

### User Tests
- [ ] Login as regular user
  - [ ] Create test user first via admin
  - [ ] Test login with correct credentials
  - [ ] Test login with incorrect credentials
- [ ] View user dashboard
  - [ ] Check profile information displays
  - [ ] Check status displays correctly
- [ ] View certificate list
  - [ ] Verify all certificates display
  - [ ] Check certificate details (title, issue date, expiry)
- [ ] Download certificate
  - [ ] Click download button
  - [ ] Verify PDF downloads correctly
  - [ ] Check file is not corrupted
  - [ ] Verify only own certificates are accessible
- [ ] Logout and login again
  - [ ] Verify session persistence
  - [ ] Check redirect to dashboard after login

### API Tests
- [ ] Test `/api/auth/me`
  - [ ] Returns user data when logged in
  - [ ] Returns 401 when not logged in
  - [ ] Returns correct user information
  - [ ] Includes certificates array
- [ ] Test `/api/users`
  - [ ] Admin can access
  - [ ] Regular user gets 401
  - [ ] Returns all users with certificates
  - [ ] Returns proper user structure
- [ ] Test `/api/download/[filename]`
  - [ ] User can download own certificates
  - [ ] User cannot download others' certificates
  - [ ] Admin can download any certificate
  - [ ] Returns 404 for non-existent files
  - [ ] Returns proper Content-Type header
  - [ ] Returns proper Content-Disposition header

### Security Tests
- [ ] Password security
  - [ ] Passwords are hashed (not visible in database)
  - [ ] Bcrypt hashing works correctly
  - [ ] Old password hashes still work (compatibility)
- [ ] Access control
  - [ ] Users cannot access admin routes
  - [ ] Users cannot access other users' data
  - [ ] Admin can access all user data
  - [ ] Middleware redirects work correctly
- [ ] Session security
  - [ ] Session cookie is HTTP-only
  - [ ] Session cookie is secure in production
  - [ ] Session expires after 24 hours
  - [ ] Session survives page refresh
- [ ] Input validation
  - [ ] Email format validation works
  - [ ] Password length validation works
  - [ ] File type validation works
  - [ ] File size validation works
  - [ ] SQL injection protection (parameterized queries)
  - [ ] XSS protection (no script execution)

### Performance Tests
- [ ] Page load times acceptable (<2s)
- [ ] User list loads quickly (<1s)
- [ ] Certificate list loads quickly (<1s)
- [ ] File uploads work smoothly
- [ ] File downloads are fast
- [ ] Database queries are optimized
- [ ] No N+1 query problems

### Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Database errors are caught and logged
- [ ] Storage errors are handled gracefully
- [ ] Invalid input shows appropriate errors
- [ ] 404 pages work correctly
- [ ] 500 errors don't expose sensitive info

## Production Deployment Checklist

### Vercel Configuration
- [ ] Environment variables set in Vercel dashboard
  - [ ] JWT_SECRET
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Project deployed successfully
- [ ] Build completes without errors
- [ ] No build warnings (or acceptable warnings documented)

### Supabase Configuration
- [ ] Production database configured
- [ ] RLS policies enabled and tested
- [ ] Storage bucket permissions configured
- [ ] Backup strategy in place
- [ ] Monitoring enabled

### Domain and SSL
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] HTTPS enforced
- [ ] Redirects working correctly

### Post-Production Verification
- [ ] Run all tests above on production
- [ ] Verify admin login works
- [ ] Create test user and certificate
- [ ] Delete test data
- [ ] Monitor logs for errors
- [ ] Check database for data integrity
- [ ] Verify file uploads to production storage

## Rollback Plan

If issues are found in production:

1. **Quick Fix Available**
   - [ ] Deploy hotfix
   - [ ] Test on production
   - [ ] Monitor for issues

2. **Major Issues Found**
   - [ ] Revert to previous deployment
   - [ ] Investigate issue in staging
   - [ ] Fix and redeploy when ready

3. **Data Issues**
   - [ ] Stop new writes to database
   - [ ] Restore from Supabase backup
   - [ ] Verify data integrity
   - [ ] Resume operations

## Monitoring

### Ongoing Monitoring
- [ ] Set up Supabase monitoring dashboard
- [ ] Configure error alerts
- [ ] Monitor database query performance
- [ ] Monitor storage usage
- [ ] Track user authentication issues
- [ ] Monitor API response times

### Regular Maintenance
- [ ] Weekly: Review error logs
- [ ] Monthly: Review database performance
- [ ] Monthly: Review storage usage
- [ ] Quarterly: Review security policies
- [ ] Quarterly: Update dependencies

## Success Criteria

The migration is successful when:
- [x] All code changes deployed
- [x] TypeScript compilation passes
- [x] Security scan passes
- [ ] All admin functions work correctly
- [ ] All user functions work correctly
- [ ] All API endpoints respond correctly
- [ ] No data loss
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Error handling works properly
- [ ] Documentation is complete

## Notes

Add any observations or issues here:
- 
- 
- 

## Sign-off

- [ ] Developer: Verified code changes
- [ ] Reviewer: Code review completed
- [ ] QA: Testing completed
- [ ] Product Owner: Features approved
- [ ] DevOps: Production deployment verified

Date: _______________
Signed: _______________
