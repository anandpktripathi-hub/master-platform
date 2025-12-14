# Multi-Tenant Domain/Subdomain Testing Guide

## 🎯 Overview

This guide explains how to test the multi-tenant domain/subdomain routing functionality on your local Windows machine.

## 🔧 Setup Local Subdomains (Windows)

Modern browsers support `*.localhost` subdomains without any configuration. However, if you need custom local domains, follow these steps:

### Option 1: Use Built-in localhost Subdomain Support (EASIEST)

Modern browsers (Chrome, Firefox, Edge) automatically resolve `*.localhost` to `127.0.0.1`.

**No configuration needed!** You can immediately use:
- `http://localhost:3000` - Landlord domain
- `http://tenant1.localhost:3000` - Tenant 1 subdomain
- `http://tenant2.localhost:3000` - Tenant 2 subdomain
- `http://acme.localhost:3000` - Tenant with slug 'acme'

### Option 2: Edit Windows Hosts File (For custom domains)

If you want to use custom domains like `myapp.local` or `tenant1.myapp.local`:

**Step 1: Open Notepad as Administrator**
1. Press `Windows Key`
2. Type "Notepad"
3. Right-click "Notepad" and select "Run as administrator"

**Step 2: Open the hosts file**
1. In Notepad, click `File → Open`
2. Navigate to: `C:\Windows\System32\drivers\etc\`
3. Change file type filter from "Text Documents (*.txt)" to "All Files (*.*)"
4. Select the file named `hosts` (no extension)
5. Click "Open"

**Step 3: Add local domain entries**
Add these lines at the end of the file:

```
# Multi-tenant SaaS local testing
127.0.0.1   myapp.local
127.0.0.1   tenant1.myapp.local
127.0.0.1   tenant2.myapp.local
127.0.0.1   acme.myapp.local
127.0.0.1   beta.myapp.local
```

**Step 4: Save and close**
1. Click `File → Save`
2. Close Notepad

**Step 5: Flush DNS cache**
Open Command Prompt as Administrator and run:
```cmd
ipconfig /flushdns
```

## 🗄️ Database Setup - Create Test Tenants

Before testing, you need to create tenant records in your database. Here are three methods:

### Method 1: Using the API (Register endpoint)

```powershell
# Register Tenant 1
curl -X POST http://localhost:3000/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "owner1@tenant1.com",
    "password": "Test123!",
    "firstName": "Owner",
    "lastName": "One",
    "tenantName": "Tenant One Corporation"
  }'

# Register Tenant 2
curl -X POST http://localhost:3000/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "owner2@tenant2.com",
    "password": "Test123!",
    "firstName": "Owner",
    "lastName": "Two",
    "tenantName": "Tenant Two LLC"
  }'

# Register Acme Corp
curl -X POST http://localhost:3000/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@acme.com",
    "password": "Acme123!",
    "firstName": "John",
    "lastName": "Doe",
    "tenantName": "Acme Corporation"
  }'
```

**Important:** After registration, note the `slug` field in the response. This is what you'll use in subdomains.

### Method 2: Using MongoDB Compass or CLI

If you want to manually create tenants with specific slugs:

```javascript
// Connect to MongoDB and run in the 'tenants' collection:
db.tenants.insertMany([
  {
    name: "Tenant One Corporation",
    slug: "tenant1",
    status: "ACTIVE",
    plan: "PRO",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Tenant Two LLC",
    slug: "tenant2",
    status: "ACTIVE",
    plan: "BASIC",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Acme Corporation",
    slug: "acme",
    domain: "acme.custom.com", // Optional: custom domain
    status: "ACTIVE",
    plan: "ENTERPRISE",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

### Method 3: Using the Tenants API (if you have admin access)

```powershell
# Login as platform super admin first
$ADMIN_TOKEN = "your_admin_jwt_token"

# Create tenant via API
curl -X POST http://localhost:3000/tenants `
  -H "Authorization: Bearer $ADMIN_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Beta Company",
    "slug": "beta",
    "status": "ACTIVE",
    "plan": "PRO"
  }'
```

## 🧪 Testing Domain Resolution

### Test 1: Landlord Domain (Platform)

**URL:** `http://localhost:3000/test/domain/info`

**Expected Response:**
```json
{
  "message": "Domain resolution test",
  "request": {
    "hostname": "localhost",
    "host": "localhost:3000",
    "protocol": "http",
    "url": "/test/domain/info"
  },
  "resolution": {
    "isLandlordDomain": true,
    "resolvedTenantId": null,
    "resolvedTenantSlug": null,
    "resolvedTenantName": null,
    "domainResolutionMethod": "landlord"
  },
  "authentication": {
    "isAuthenticated": false,
    "jwtTenantId": null,
    "finalTenantId": null
  }
}
```

**✅ Success Indicators:**
- `isLandlordDomain: true`
- `resolvedTenantId: null`
- `domainResolutionMethod: "landlord"`

---

### Test 2: Tenant Subdomain - Tenant 1

**URL:** `http://tenant1.localhost:3000/test/domain/info`

**Expected Response:**
```json
{
  "message": "Domain resolution test",
  "request": {
    "hostname": "tenant1.localhost",
    "host": "tenant1.localhost:3000",
    "protocol": "http",
    "url": "/test/domain/info"
  },
  "resolution": {
    "isLandlordDomain": false,
    "resolvedTenantId": "507f1f77bcf86cd799439011",
    "resolvedTenantSlug": "tenant1",
    "resolvedTenantName": "Tenant One Corporation",
    "domainResolutionMethod": "subdomain"
  },
  "authentication": {
    "isAuthenticated": false,
    "jwtTenantId": null,
    "finalTenantId": "507f1f77bcf86cd799439011"
  }
}
```

**✅ Success Indicators:**
- `isLandlordDomain: false`
- `resolvedTenantId` is NOT null
- `resolvedTenantSlug: "tenant1"`
- `domainResolutionMethod: "subdomain"`
- `finalTenantId` matches `resolvedTenantId`

---

### Test 3: Different Tenant - Tenant 2

**URL:** `http://tenant2.localhost:3000/test/domain/info`

**Expected Response:**
```json
{
  "resolution": {
    "isLandlordDomain": false,
    "resolvedTenantId": "507f1f77bcf86cd799439012",
    "resolvedTenantSlug": "tenant2",
    "resolvedTenantName": "Tenant Two LLC",
    "domainResolutionMethod": "subdomain"
  }
}
```

**✅ Success Indicators:**
- Different `resolvedTenantId` than Tenant 1
- `resolvedTenantSlug: "tenant2"`

---

### Test 4: Acme Corporation Subdomain

**URL:** `http://acme.localhost:3000/test/domain/info`

**Expected Response:**
```json
{
  "resolution": {
    "isLandlordDomain": false,
    "resolvedTenantId": "507f1f77bcf86cd799439013",
    "resolvedTenantSlug": "acme",
    "resolvedTenantName": "Acme Corporation",
    "domainResolutionMethod": "subdomain"
  }
}
```

---

### Test 5: Custom Domain (if configured)

**URL:** `http://acme.custom.com/test/domain/info` (after adding to hosts file)

**Expected Response:**
```json
{
  "resolution": {
    "isLandlordDomain": false,
    "resolvedTenantId": "507f1f77bcf86cd799439013",
    "resolvedTenantSlug": "acme",
    "resolvedTenantName": "Acme Corporation",
    "domainResolutionMethod": "custom-domain"
  }
}
```

**✅ Success Indicator:**
- `domainResolutionMethod: "custom-domain"`

---

### Test 6: Non-Existent Tenant

**URL:** `http://nonexistent.localhost:3000/test/domain/info`

**Expected Response:**
```json
{
  "resolution": {
    "isLandlordDomain": false,
    "resolvedTenantId": null,
    "resolvedTenantSlug": null,
    "resolvedTenantName": null,
    "domainResolutionMethod": "not-found"
  }
}
```

**✅ Success Indicator:**
- `domainResolutionMethod: "not-found"`

---

## 🔐 Testing with Authentication

### Test 7: Subdomain + JWT Authentication

**Step 1:** Login as Tenant 1 owner from the landlord domain:
```powershell
curl -X POST http://localhost:3000/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "owner1@tenant1.com",
    "password": "Test123!"
  }'
```

Copy the `accessToken` → Save as `$TOKEN1`

**Step 2:** Access tenant1 subdomain with JWT:
```powershell
$TOKEN1 = "your_jwt_token_here"

curl http://tenant1.localhost:3000/test/domain/info `
  -H "Authorization: Bearer $TOKEN1"
```

**Expected Response:**
```json
{
  "resolution": {
    "isLandlordDomain": false,
    "resolvedTenantId": "507f1f77bcf86cd799439011",
    "resolvedTenantSlug": "tenant1",
    "domainResolutionMethod": "subdomain"
  },
  "authentication": {
    "isAuthenticated": true,
    "jwtTenantId": "507f1f77bcf86cd799439011",
    "userEmail": "owner1@tenant1.com",
    "finalTenantId": "507f1f77bcf86cd799439011"
  }
}
```

**✅ Success Indicators:**
- `isAuthenticated: true`
- `jwtTenantId` matches `resolvedTenantId`
- Both match `finalTenantId`

---

### Test 8: Cross-Tenant Domain Mismatch (Security Test)

**Step 1:** Use Tenant 1's JWT token on Tenant 2's subdomain:
```powershell
# Use Tenant 1 token but access Tenant 2 domain
curl http://tenant2.localhost:3000/test/domain/info `
  -H "Authorization: Bearer $TOKEN1"
```

**Expected Response:**
```json
{
  "resolution": {
    "resolvedTenantId": "507f1f77bcf86cd799439012", // Tenant 2 ID
    "resolvedTenantSlug": "tenant2",
    "domainResolutionMethod": "subdomain"
  },
  "authentication": {
    "isAuthenticated": true,
    "jwtTenantId": "507f1f77bcf86cd799439011", // Tenant 1 ID (from JWT)
    "finalTenantId": "507f1f77bcf86cd799439011" // JWT takes priority
  }
}
```

**⚠️ Security Note:** The JWT tenantId takes priority over domain resolution. This prevents domain-based attacks. Users can only access their own tenant's data, even if they try to access via another tenant's subdomain.

---

## 🌐 Browser Testing

### Test in Chrome/Edge/Firefox

1. **Open Browser**
2. **Test Landlord Domain:**
   - Navigate to: `http://localhost:3000/test/domain/info`
   - Verify landlord domain detection

3. **Test Tenant Subdomains:**
   - Open new tab: `http://tenant1.localhost:3000/test/domain/info`
   - Open new tab: `http://tenant2.localhost:3000/test/domain/info`
   - Open new tab: `http://acme.localhost:3000/test/domain/info`
   - Verify each resolves to the correct tenant

4. **Test with Browser DevTools:**
   - Press `F12` to open DevTools
   - Go to Network tab
   - Refresh page
   - Check the request headers - you should see the correct `Host` header

---

## 🐛 Troubleshooting

### Issue 1: "Cannot resolve tenant for hostname"

**Problem:** Server logs show tenant not found.

**Solutions:**
1. Verify tenant exists in database:
   ```javascript
   db.tenants.find({ slug: "tenant1" })
   ```
2. Check tenant status is ACTIVE or TRIAL
3. Verify slug exactly matches subdomain

### Issue 2: Subdomain doesn't work (404 or redirects)

**Problem:** `tenant1.localhost` doesn't work.

**Solutions:**
1. Try with port: `http://tenant1.localhost:3000`
2. Try different browser (Chrome recommended)
3. Clear browser cache and DNS:
   ```cmd
   ipconfig /flushdns
   ```

### Issue 3: Always resolves to landlord domain

**Problem:** All subdomains resolve as landlord.

**Solutions:**
1. Check `BASE_DOMAINS` in `.env`:
   ```
   BASE_DOMAINS=localhost:3000,localhost
   ```
2. Restart backend server after changing `.env`
3. Check server logs for domain resolution debug messages

### Issue 4: "Tenant context not available" error

**Problem:** Protected routes fail with tenant context error.

**Solutions:**
1. Ensure you're using a tenant subdomain, not landlord domain
2. If using JWT, verify token contains `tenantId`
3. Check middleware order in `app.module.ts`

---

## ✅ Success Checklist

After completing all tests, verify:

- [ ] Landlord domain (`localhost:3000`) correctly identified
- [ ] Tenant 1 subdomain (`tenant1.localhost:3000`) resolves to Tenant 1
- [ ] Tenant 2 subdomain (`tenant2.localhost:3000`) resolves to Tenant 2
- [ ] Non-existent subdomain returns "not-found"
- [ ] JWT authentication works with subdomains
- [ ] JWT tenantId takes priority over domain resolution
- [ ] Cross-tenant access is blocked (JWT validation)
- [ ] Server logs show domain resolution messages
- [ ] Products/orders/categories APIs use domain-based tenant context

---

## 🚀 Next Steps

Once domain routing is verified, you can:
1. Test product creation from different subdomains
2. Verify tenant isolation with domain-based routing
3. Implement frontend subdomain awareness
4. Add custom domain mapping for production tenants

---

## 📝 Environment Configuration

Add to your `.env` file:
```bash
# Multi-Tenant Domain Configuration
BASE_DOMAINS=localhost:3000,localhost

# For production, use your actual domains:
# BASE_DOMAINS=myapp.com,app.myapp.com
```

Restart your backend after changing this configuration.
