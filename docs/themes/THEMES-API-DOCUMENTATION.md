# Theme Management System - API Documentation

## Overview

Complete theme management system for multi-tenant SaaS allowing super admins to create and manage system-wide themes, and tenants to select and customize themes for their organization.

## Architecture

### Schemas

#### 1. Theme Schema
```typescript
{
  _id: ObjectId
  name: string                          // Theme display name (e.g., "Dark Blue")
  key: string                           // Unique identifier (e.g., "dark-blue")
  previewImage?: string                 // URL to theme preview image
  cssVariables: Record<string, string> // Default CSS variables
                                        // e.g., {
                                        //   "color-primary": "#007bff",
                                        //   "color-secondary": "#6c757d",
                                        //   "border-radius": "4px"
                                        // }
  status: 'ACTIVE' | 'INACTIVE'        // Active themes available for selection
  createdAt: Date
  updatedAt: Date
}
```

#### 2. TenantTheme Schema
```typescript
{
  _id: ObjectId
  tenantId: ObjectId                    // Reference to tenant
  themeId: ObjectId                     // Reference to selected theme
  customCssVariables: Record<string, string> // Tenant-specific overrides
                                        // e.g., {
                                        //   "color-primary": "#ff0000"
                                        // }
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### Super Admin - Theme Management

#### Create Theme
```http
POST /admin/themes
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dark Blue",
  "key": "dark-blue",
  "previewImage": "https://example.com/preview.png",
  "cssVariables": {
    "color-primary": "#007bff",
    "color-secondary": "#6c757d",
    "color-danger": "#dc3545",
    "color-success": "#28a745",
    "border-radius": "4px",
    "font-family": "Arial, sans-serif",
    "font-size-base": "14px"
  },
  "status": "ACTIVE"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dark Blue",
  "key": "dark-blue",
  "previewImage": "https://example.com/preview.png",
  "cssVariables": { ... },
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### List All Themes
```http
GET /admin/themes
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dark Blue",
    "key": "dark-blue",
    "previewImage": "https://example.com/preview.png",
    "cssVariables": { ... },
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Light Gray",
    "key": "light-gray",
    "previewImage": "https://example.com/preview2.png",
    "cssVariables": { ... },
    "status": "ACTIVE",
    "createdAt": "2024-01-14T09:00:00Z",
    "updatedAt": "2024-01-14T09:00:00Z"
  }
]
```

#### Get Theme by ID
```http
GET /admin/themes/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dark Blue",
  "key": "dark-blue",
  "previewImage": "https://example.com/preview.png",
  "cssVariables": { ... },
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Update Theme
```http
PATCH /admin/themes/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dark Blue v2",
  "cssVariables": {
    "color-primary": "#0056b3",
    "color-secondary": "#495057"
  }
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dark Blue v2",
  "key": "dark-blue",
  "previewImage": "https://example.com/preview.png",
  "cssVariables": {
    "color-primary": "#0056b3",
    "color-secondary": "#495057"
  },
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:45:00Z"
}
```

#### Activate Theme
```http
PATCH /admin/themes/:id/activate
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dark Blue",
  "key": "dark-blue",
  "previewImage": "https://example.com/preview.png",
  "cssVariables": { ... },
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:45:00Z"
}
```

#### Deactivate Theme
```http
PATCH /admin/themes/:id/deactivate
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dark Blue",
  "key": "dark-blue",
  "previewImage": "https://example.com/preview.png",
  "cssVariables": { ... },
  "status": "INACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:45:00Z"
}
```

#### Delete Theme
```http
DELETE /admin/themes/:id
Authorization: Bearer {token}

Response: 204 No Content

// Error if theme is in use:
// Response: 400 Bad Request
// {
//   "statusCode": 400,
//   "message": "Cannot delete theme. It is being used by 3 tenant(s).",
//   "error": "Bad Request"
// }
```

---

### Tenant - Theme Selection & Customization

#### Get Available Themes
```http
GET /tenant/theme/available
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dark Blue",
    "key": "dark-blue",
    "previewImage": "https://example.com/preview.png",
    "cssVariables": { ... },
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Light Gray",
    "key": "light-gray",
    "previewImage": "https://example.com/preview2.png",
    "cssVariables": { ... },
    "status": "ACTIVE",
    "createdAt": "2024-01-14T09:00:00Z",
    "updatedAt": "2024-01-14T09:00:00Z"
  }
]
```

#### Select Theme for Tenant
```http
POST /tenant/theme/select
Authorization: Bearer {token}
Content-Type: application/json

{
  "themeId": "507f1f77bcf86cd799439011"
}

Response: 200 OK
{
  "_id": "607f1f77bcf86cd799439013",
  "tenantId": "507f2f77bcf86cd799439099",
  "themeId": "507f1f77bcf86cd799439011",
  "theme": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dark Blue",
    "key": "dark-blue",
    "previewImage": "https://example.com/preview.png",
    "cssVariables": {
      "color-primary": "#007bff",
      "color-secondary": "#6c757d",
      "border-radius": "4px"
    },
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "customCssVariables": {},
  "mergedCssVariables": {
    "color-primary": "#007bff",
    "color-secondary": "#6c757d",
    "border-radius": "4px"
  },
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### Customize Theme (Override CSS Variables)
```http
POST /tenant/theme/customize
Authorization: Bearer {token}
Content-Type: application/json

{
  "customCssVariables": {
    "color-primary": "#ff0000",
    "color-secondary": "#00ff00"
  }
}

Response: 200 OK
{
  "_id": "607f1f77bcf86cd799439013",
  "tenantId": "507f2f77bcf86cd799439099",
  "themeId": "507f1f77bcf86cd799439011",
  "theme": { ... },
  "customCssVariables": {
    "color-primary": "#ff0000",
    "color-secondary": "#00ff00"
  },
  "mergedCssVariables": {
    "color-primary": "#ff0000",        // Tenant override (takes priority)
    "color-secondary": "#00ff00",      // Tenant override (takes priority)
    "border-radius": "4px"             // System default (no override)
  },
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:15:00Z"
}
```

#### Get Tenant's Current Theme
```http
GET /tenant/theme
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "607f1f77bcf86cd799439013",
  "tenantId": "507f2f77bcf86cd799439099",
  "themeId": "507f1f77bcf86cd799439011",
  "theme": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dark Blue",
    "key": "dark-blue",
    "previewImage": "https://example.com/preview.png",
    "cssVariables": { ... },
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "customCssVariables": {
    "color-primary": "#ff0000",
    "color-secondary": "#00ff00"
  },
  "mergedCssVariables": {
    "color-primary": "#ff0000",
    "color-secondary": "#00ff00",
    "border-radius": "4px"
  },
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:15:00Z"
}
```

#### Get Theme as CSS File
```http
GET /tenant/theme/css
Authorization: Bearer {token}

Response: 200 OK
{
  "css": ":root {\n  --color-primary: #ff0000;\n  --color-secondary: #00ff00;\n  --border-radius: 4px;\n}"
}
```

#### Get Theme Variables as JSON
```http
GET /tenant/theme/variables
Authorization: Bearer {token}

Response: 200 OK
{
  "color-primary": "#ff0000",
  "color-secondary": "#00ff00",
  "border-radius": "4px"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Theme with key \"dark-blue\" already exists",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Theme with ID \"507f1f77bcf86cd799439011\" not found",
  "error": "Not Found"
}
```

---

## Business Rules

1. **Super Admin Only**
   - Can create, update, activate, deactivate, and delete themes
   - Can view all themes (active and inactive)

2. **Tenant Operations**
   - Can only select from active themes
   - Can customize CSS variables for their tenant
   - Customizations override system defaults
   - Can only manage their own theme selection

3. **Theme Management**
   - Theme keys must be unique (case-insensitive)
   - Theme names must be unique
   - Cannot delete a theme if tenants are using it
   - Only active themes can be selected

4. **CSS Variable Merging**
   - System defaults are merged with tenant overrides
   - Tenant overrides take priority (override system values)
   - All merged variables are returned to frontend

---

## Usage Example

### Frontend Implementation

```typescript
// Get available themes and allow selection
const themes = await fetch('/tenant/theme/available').then(r => r.json());

// User selects a theme
await fetch('/tenant/theme/select', {
  method: 'POST',
  body: JSON.stringify({ themeId: selectedThemeId })
});

// Get merged CSS variables
const variables = await fetch('/tenant/theme/variables').then(r => r.json());

// Apply to document
Object.entries(variables).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--${key}`, value);
});

// Or fetch as CSS
const { css } = await fetch('/tenant/theme/css').then(r => r.json());
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
```

---

## Database Indexes

```javascript
// Theme collection
db.themes.createIndex({ key: 1 });           // For lookups by key
db.themes.createIndex({ status: 1 });        // For filtering active themes
db.themes.createIndex({ createdAt: -1 });    // For sorting

// TenantTheme collection
db.tenantthemes.createIndex({ tenantId: 1 }, { unique: true }); // One theme per tenant
db.tenantthemes.createIndex({ themeId: 1 });                     // For lookups
db.tenantthemes.createIndex({ updatedAt: -1 });                  // For sorting
```

---

## Best Practices

1. **Theme Variables Naming Convention**
   - Use kebab-case: `color-primary`, `font-size-base`
   - Prefix by category: `color-`, `font-`, `border-`, `shadow-`
   - Example: `color-primary`, `color-secondary`, `border-radius`, `font-family`

2. **Tenant Customization**
   - Only override necessary variables
   - Keep system defaults for non-customized variables
   - Validate CSS values on both frontend and backend

3. **Performance**
   - Cache theme data on frontend
   - Use CSS variables for dynamic theming (no page reload needed)
   - Preload theme on app initialization

4. **Fallback Behavior**
   - If tenant hasn't selected theme, return first active theme
   - Always provide default CSS variables
   - Handle missing variables gracefully on frontend

---

## Related Modules

- **Auth Module**: User authentication and authorization
- **Tenants Module**: Tenant management and isolation
- **Common Guards**: Role-based access control

