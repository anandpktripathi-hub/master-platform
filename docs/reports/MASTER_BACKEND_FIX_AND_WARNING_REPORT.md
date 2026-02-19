## MASTER BACKEND FIX & WARNING REPORT

### Date: January 25, 2026

---

#### 1. MongoDB Connection Error
- **Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
- **Cause:** Backend cannot connect to MongoDB at `127.0.0.1:27017`.
- **Fix:**
  - Ensure MongoDB is running locally on port 27017 or start the MongoDB Docker container.
  - Check `.env` or config for correct `DATABASE_URI`/`DATABASE_URL`.

#### 2. Redis Connection Error
- **Error:** `Failed to connect to Redis at redis://localhost:6379. Falling back to no-op client.`
- **Cause:** Redis is not running or not accessible at `localhost:6379`.
- **Fix:**
  - Start Redis locally or via Docker.
  - Verify the Redis connection string in your config.

#### 3. Duplicate Mongoose Index Warning
- **Warning:** `Duplicate schema index on {"code":1}` and `{"userId":1}` found.
- **Cause:** Index defined both with `unique: true` in schema and with `schema.index()`.
- **Fix:**
  - Removed `unique: true` from `@Prop` decorators in affected schemas (Affiliate, Coupon, etc.) to avoid duplicate index definitions.

#### 4. Degraded Mode Warning
- **Warning:** `[AppModule] Failed to connect to MongoDB at ... Running in degraded mode.`
- **Fix:**
  - This is related to the MongoDB connection issue above. Fixing the DB connection will resolve this.

#### 5. Deprecation Notices in Dependencies
- **Warning:** Some packages in `package-lock.json` are deprecated.
- **Fix:**
  - Update deprecated packages in `package.json` and run `npm install`.

#### 6. Quota and Validation Warnings
- **Warning:** Quota breach and validation errors are logged.
- **Fix:**
  - Ensure quota logic and validation logic are correct and not too restrictive.

#### 7. General Exception Handling
- Multiple files throw exceptions like `ForbiddenException`, `NotFoundException`, `HttpException`, and `ValidationException`.
- **Fix:**
  - Review exception handling for clarity and proper error messages.
  - Ensure all thrown exceptions are caught and logged appropriately.

---

### NEXT STEPS
1. Ensure MongoDB and Redis are running locally or via Docker.
2. Update deprecated packages in `package.json` if needed.
3. Review exception handling and logging for clarity.
4. All duplicate index warnings have been fixed in the codebase.

---

**STRICT WARNING:**
- All fixes were applied carefully to avoid the "EMFILE: too many open files" error and any Copilot request failures.
- Only this single master report file was created for all backend fixes and warnings.
