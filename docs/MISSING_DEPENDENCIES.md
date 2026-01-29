# Additional Dependencies Required

The following packages need to be installed for full functionality:

## Backend OAuth & Social Login

```bash
cd backend
npm install passport-google-oauth20 passport-github2
npm install --save-dev @types/passport-google-oauth20 @types/passport-github2
```

These are required for:
- Google OAuth strategy (`backend/src/auth/strategies/google.strategy.ts`)
- GitHub OAuth strategy (`backend/src/auth/strategies/github.strategy.ts`)
- OAuth callback endpoints (`/auth/google`, `/auth/github`)

## Cloud Storage (Optional, if using S3 or Cloudinary)

### AWS S3
```bash
cd backend
npm install @aws-sdk/client-s3
```

Required if `STORAGE_PROVIDER=s3` in environment variables.

### Cloudinary
```bash
cd backend
npm install cloudinary
```

Required if `STORAGE_PROVIDER=cloudinary` in environment variables.

## After Installing

1. **Rebuild the backend**:
   ```bash
   cd backend
   npm run build
   ```

2. **Update auth module** to include OAuth strategies:
   ```typescript
   // backend/src/modules/auth/auth.module.ts
   import { GoogleStrategy } from '../../auth/strategies/google.strategy';
   import { GithubStrategy } from '../../auth/strategies/github.strategy';
   
   @Module({
     providers: [
       AuthService,
       GoogleStrategy,
       GithubStrategy,
       // ... other providers
     ],
   })
   ```

3. **Configure OAuth credentials** in `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
   
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
   ```

## Verification

To verify all dependencies are installed correctly:

```bash
# Backend
cd backend
npm ls passport-google-oauth20 passport-github2
npm run build

# If no errors, dependencies are correctly installed
```

## Package Locations

- **OAuth packages**: Used in `backend/src/auth/strategies/`
- **Storage packages**: Used in `backend/src/common/storage/storage.service.ts`
- **Integration packages**: Already included (axios for webhooks/integrations)

## Optional Enhancements

Consider these additional packages for enhanced functionality:

```bash
# Compression middleware
npm install compression @types/compression

# Advanced validation
npm install validator @types/validator

# Rate limiting with Redis
npm install express-rate-limit rate-limit-redis

# Better logging
npm install nest-winston

# API documentation
npm install @nestjs/swagger swagger-ui-express
```

---

**Note**: The platform is fully functional with local storage and without OAuth. These packages are only required if you enable those specific features.
