# RBAC System - Quick Reference Card

## 🚀 Quick Start

```bash
# Backend
cd backend && npm run start:dev

# Frontend (new terminal)
cd frontend && npm run dev

# Access application
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:4000/api/v1
```

---

## 📁 Key Files at a Glance

### Backend

| File | Purpose | Lines |
|------|---------|-------|
| `permission.schema.ts` | Define fine-grained permissions | 40 |
| `role.schema.ts` | Define role entity with permissions | 35 |
| `user-tenant.schema.ts` | Link users to tenants with roles | 40 |
| `rbac.service.ts` | Business logic for RBAC operations | 400 |
| `rbac.controller.ts` | API endpoints | 140 |
| `seed.service.ts` | Auto-populate default data | 150 |

### Frontend

| File | Purpose | Lines |
|------|---------|-------|
| `rbacApi.ts` | Type-safe API service | 70 |
| `ManageUsers.tsx` | User management page + modal | 400 |
| `ManageRoles.tsx` | Role management page + matrix | 450 |
| `ManageUser.css` | Styling for users page | 250 |
| `ManageRoles.css` | Styling for roles page | 250 |

---

## 🔌 API Endpoints

### Permissions
```
GET    /api/v1/rbac/permissions              # Get all
GET    /api/v1/rbac/permissions/module/{mod}  # By module
POST   /api/v1/rbac/permissions              # Create
```

### Roles
```
POST   /api/v1/rbac/roles                    # Create
GET    /api/v1/rbac/roles                    # List
GET    /api/v1/rbac/roles/{id}               # Get one
PUT    /api/v1/rbac/roles/{id}               # Update
DELETE /api/v1/rbac/roles/{id}               # Delete
```

### Users
```
POST   /api/v1/rbac/users                           # Create
GET    /api/v1/rbac/users                           # List
PUT    /api/v1/rbac/users/{id}                      # Update
DELETE /api/v1/rbac/users/{id}                      # Delete
POST   /api/v1/rbac/users/{id}/reset-password      # Reset pwd
POST   /api/v1/rbac/users/{id}/toggle-login        # Toggle
```

---

## 📊 Data Model

```
PERMISSIONS (90 total)
├─ 18 Modules: User, Role, Client, Product & service, etc.
└─ 5 Actions: manage, create, edit, delete, show

ROLES
├─ name, description, tenantId
├─ permissions: [Permission._id]
└─ isSystem: boolean

USERS
├─ name, email, password, dateOfBirth
└─ UserTenant (join table)
   ├─ userId, tenantId, roleId
   ├─ isLoginEnabled: boolean
   └─ status: active|inactive|suspended

TENANTS
└─ Has many Users (via UserTenant)
```

---

## 🎯 Default Roles (Auto-Seeded)

| Role | Modules | Permissions |
|------|---------|-------------|
| **Accountant** | Account, Invoice, Expense, Taxes | manage, create, edit, delete, show |
| **HR** | Employee, Department, Designation | manage, create, edit, delete, show |
| **Employee** | Employee, User, Documents | show (read-only) |
| **Manager** | Users, Employees, Accounts, Invoices | manage, create, edit, delete, show |

---

## 🖼️ Frontend Routes

```
/app/manage-users   → User management grid + create modal
/app/manage-roles   → Role list + permission matrix
```

---

## ✨ Key Features

✅ **Multi-Tenancy**: Each tenant has isolated roles and users  
✅ **Fine-Grained Permissions**: 90 module × action combinations  
✅ **Role Management**: Create, edit, delete roles with permissions  
✅ **User Management**: CRUD, password reset, login toggle  
✅ **Permission Matrix**: Visual checkbox grid for permissions  
✅ **System Roles**: Protected default roles  
✅ **Responsive UI**: Mobile-friendly design  
✅ **Auto-Seed**: Default data on startup  
✅ **Type-Safe**: Full TypeScript support  
✅ **Production Ready**: Complete error handling  

---

## 🔐 Security Features

- **JWT Authentication**: All endpoints protected
- **Tenant Isolation**: Operations scoped to tenant
- **Password Hashing**: bcryptjs with 10 rounds
- **Login Control**: Enable/disable per user per tenant
- **System Role Protection**: Cannot modify system roles
- **Validation**: Input validation on all endpoints
- **Error Messages**: Secure without info leaks

---

## 📈 Performance

- **Database Indexes**: Optimized queries
- **Pagination**: 10 users per page (configurable)
- **Lazy Loading**: Permissions loaded on demand
- **Caching Ready**: Structure supports permission caching
- **Scalable**: Designed for 100k+ users

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No permissions showing | Check seed ran (check logs for "Seeded 90 permissions") |
| 401 errors | Verify JWT token in Authorization header |
| User not appearing | Check x-tenant-id header matches context |
| Role not editable | Might be system role - system roles cannot be modified |
| Password field missing | Enable "Login is Enabled" toggle first |

---

## 📝 Documentation Files

- **RBAC_IMPLEMENTATION_SUMMARY.md** - Full technical documentation
- **RBAC_TESTING_GUIDE.md** - Step-by-step testing instructions
- **RBAC_CHANGELOG.md** - Detailed list of all changes

---

## 🎬 Common Operations

### Create Custom Role
1. Go to `/app/manage-roles`
2. Click "+ Create Role"
3. Select permissions in matrix
4. Save

### Create User with Role
1. Go to `/app/manage-users`
2. Click "+ Add User"
3. Select role from dropdown
4. Fill form & save

### Reset User Password
1. Click ⋮ menu on user card
2. Select "Reset Password"
3. Enter new password

### Toggle Login
1. Click ⋮ menu on user card
2. Select "Disable Login" or "Enable Login"

---

## 📞 Support

For issues or questions:
1. Check RBAC_TESTING_GUIDE.md troubleshooting section
2. Review RBAC_IMPLEMENTATION_SUMMARY.md for architecture details
3. Verify database state using provided MongoDB queries
4. Check browser console and server logs

---

**Implementation Complete & Production Ready** ✅
