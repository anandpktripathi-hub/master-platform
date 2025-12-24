# Quick Start - Running the RBAC System

## ⚡ 30-Second Quick Start

### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Browser
Navigate to: `http://localhost:5173`

Login with your credentials, then:
- Visit `/app/manage-users` for user management
- Visit `/app/manage-roles` for role management

---

## 📋 Detailed Setup Instructions

### Prerequisites
- Node.js v16+ installed
- MongoDB running locally or via connection string
- Git (optional)

### Backend Setup

#### Step 1: Navigate to Backend
```bash
cd backend
```

#### Step 2: Install Dependencies (if not already done)
```bash
npm install
```

#### Step 3: Verify Environment
Check that `.env` or `main.ts` has correct MongoDB URI:
```
DATABASE_URI=mongodb://localhost:27017/your_database_name
```

#### Step 4: Start Backend Server
```bash
npm run start:dev
```

**Expected Output**:
```
[NestFactory] Starting Nest application...
[InstanceLoader] TenantsModule dependencies initialized
[InstanceLoader] RbacModule dependencies initialized
[Seed] Starting seed...
[Seed] Seeded 90 permissions
[Seed] Seeded 4 default roles
[Seed] Seed completed successfully
[NestApplication] Nest application successfully started on port 3000
```

✅ Backend is running at `http://localhost:3000`

---

### Frontend Setup

#### Step 1: Open New Terminal
Open a second terminal while backend is running

#### Step 2: Navigate to Frontend
```bash
cd frontend
```

#### Step 3: Install Dependencies (if not already done)
```bash
npm install
```

#### Step 4: Verify Environment
Check `frontend/vite.config.ts` has correct API base URL:
```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Or check `.env.local` for environment variables.

#### Step 5: Start Frontend Server
```bash
npm run dev
```

**Expected Output**:
```
  VITE v4.x.x

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Frontend is running at `http://localhost:5173`

---

## 🔐 Accessing the Application

### Step 1: Open Browser
Navigate to: `http://localhost:5173`

### Step 2: Login
Use your test credentials to log in:
- Email: your_email@example.com
- Password: your_password

### Step 3: Navigate to RBAC Pages
After logging in, navigate to:

**Option A - Via URL**:
- Users: `http://localhost:5173/app/manage-users`
- Roles: `http://localhost:5173/app/manage-roles`

**Option B - Via Menu** (if navigation links added):
- Look for "Manage Users" or "Manage Roles" in the navigation menu

---

## 🧪 Verify Installation

### Backend Verification

#### Check Permissions Seeded
```bash
# In MongoDB shell or MongoDB Compass
db.permissions.count()  # Should return 90
```

#### Check Roles Seeded
```bash
db.roles.find({ isSystem: true }).count()  # Should return 4
```

#### Test API Endpoint
```bash
curl -X GET http://localhost:3000/api/v1/rbac/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "x-tenant-id: YOUR_TENANT_ID"
```

Should return array of permissions.

### Frontend Verification

#### Check Page Loads
1. Navigate to `http://localhost:5173/app/manage-users`
2. Should show:
   - "Manage Users" title
   - "+ Add User" button
   - User grid (empty if no users created yet)
   - Pagination controls

#### Check Create User Modal
1. Click "+ Add User"
2. Should show form with fields:
   - Name
   - Email
   - Password
   - User Role (dropdown)
   - Date of Birth
   - Login is Enabled (checkbox)

#### Check Roles Page
1. Navigate to `http://localhost:5173/app/manage-roles`
2. Should show:
   - "Manage Roles" title
   - "+ Create Role" button
   - Role list with at least 4 default roles:
     - Accountant
     - HR
     - Employee
     - Manager

---

## 🛠️ Common Commands

### Backend Commands
```bash
# Start development mode
npm run start:dev

# Start production mode
npm run start:prod

# Build project
npm run build

# Run tests
npm run test

# Run with PM2
npm run start:pm2

# Stop PM2
npm run stop:pm2
```

### Frontend Commands
```bash
# Start development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🔄 Restart Services

### If Backend Crashes
```bash
# Kill process (if needed)
lsof -ti:3000 | xargs kill -9

# Restart
cd backend && npm run start:dev
```

### If Frontend Crashes
```bash
# Kill process (if needed)
lsof -ti:5173 | xargs kill -9

# Restart
cd frontend && npm run dev
```

### If You Need to Reseed Data
```bash
# 1. Stop backend (Ctrl+C)
# 2. Clear MongoDB collections
mongo
use your_db_name
db.permissions.deleteMany({})
db.roles.deleteMany({})

# 3. Restart backend
npm run start:dev
```

---

## 🐛 Troubleshooting Startup

### Issue: "Port already in use"

**Backend (port 3000)**:
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in main.ts
# await app.listen(3001);
```

**Frontend (port 5173)**:
```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
# server: { port: 5174 }
```

### Issue: "Cannot find module"

**Backend**:
```bash
cd backend
npm install --legacy-peer-deps
npm run build
npm run start:dev
```

**Frontend**:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Issue: "MongoDB connection refused"

1. Check MongoDB is running:
```bash
# macOS
brew services list

# Linux
systemctl status mongod

# Windows
Get-Service MongoDB
```

2. Start MongoDB if stopped:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

3. Check connection string in `.env`:
```
DATABASE_URI=mongodb://localhost:27017/your_db
```

### Issue: "JWT token invalid"

1. Make sure you're logged in
2. Token should be in localStorage
3. Check token hasn't expired
4. Try logging out and back in

### Issue: "No permissions showing"

1. Check seed ran (look for "Seeded 90 permissions" in backend logs)
2. Check MongoDB has permissions:
```bash
db.permissions.count()  # Should be 90
```
3. If not, reseed:
   - Stop backend
   - Delete permissions: `db.permissions.deleteMany({})`
   - Delete roles: `db.roles.deleteMany({})`
   - Restart backend

---

## 📊 Monitor Services

### View Backend Logs
Logs appear in the terminal where you ran `npm run start:dev`
- Look for errors in red
- Warnings in yellow
- Info in white

### View Frontend Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors in red
4. Network tab to check API calls

### Monitor Database
```bash
# Using MongoDB Compass
# Connect to: mongodb://localhost:27017
# View collections: permissions, roles, usertenants, users, tenants

# Using MongoDB shell
mongo
use your_db_name
db.getCollectionNames()  # See all collections
db.permissions.count()
db.roles.find().pretty()
db.usertenants.find().pretty()
```

---

## 🎯 After Startup - Next Steps

### 1. Create Your First Custom Role
1. Go to `/app/manage-roles`
2. Click "+ Create Role"
3. Enter: Name = "Content Manager"
4. Select permissions (e.g., Product & service - all actions)
5. Click "Create Role"

### 2. Create Your First User
1. Go to `/app/manage-users`
2. Click "+ Add User"
3. Enter:
   - Name: Test User
   - Email: testuser@example.com
   - Password: TestPass123!
   - Role: Select "Accountant"
   - Login is Enabled: Checked
4. Click "Create User"
5. Should appear in grid immediately

### 3. Test User Management
1. Click menu (⋮) on the user card
2. Try:
   - Edit → Change role → Save
   - Reset Password → Enter new password
   - Disable Login → See status change to red
   - Enable Login → See status change to green
   - Delete → Confirm deletion

### 4. Test Role Management
1. Go to `/app/manage-roles`
2. Expand a role to see its permissions
3. Edit the "Content Manager" role you created
4. Click "+ Create Role" to create another one
5. Try to delete your custom role
6. Try to delete "Accountant" (should fail - system role)

---

## 📞 Getting Help

### Consult Documentation
1. **RBAC_IMPLEMENTATION_SUMMARY.md** - Technical details
2. **RBAC_TESTING_GUIDE.md** - Testing procedures
3. **RBAC_CHANGELOG.md** - What changed and why
4. **RBAC_QUICK_REFERENCE.md** - Quick lookup reference
5. **RBAC_FILE_MANIFEST.md** - Complete file listing

### Check Logs
- Backend logs in terminal
- Frontend console (F12 → Console tab)
- MongoDB logs

### Verify Setup
1. Ports open: 3000 (backend), 5173 (frontend)
2. MongoDB running and accessible
3. Environment variables correct
4. Dependencies installed
5. No module errors

---

## ✅ Success Indicators

You'll know everything is working when:

✅ Backend logs show "Nest application successfully started"  
✅ Frontend shows "VITE" startup message  
✅ Can access `http://localhost:5173` in browser  
✅ Login works with your credentials  
✅ Can navigate to `/app/manage-users`  
✅ Can navigate to `/app/manage-roles`  
✅ "Manage Users" shows page title and "Add User" button  
✅ "Manage Roles" shows at least 4 default roles  
✅ Can click "Create Role" and see permission matrix  
✅ Can create a new user successfully  
✅ New user appears in grid immediately  
✅ Can edit user role  
✅ Can reset user password  
✅ Can disable/enable user login  
✅ Can delete users  
✅ Pagination works  
✅ No JavaScript errors in console  

---

## 🚀 You're Ready!

Once you see all success indicators above, your RBAC system is fully operational and ready for use!

For detailed testing scenarios, see **RBAC_TESTING_GUIDE.md**

---

**Happy coding!** 🎉
