# Theme Management System - Implementation Guide

## Overview

The Theme Management System provides a complete solution for managing multi-tenant themes with system-wide defaults and tenant-specific customizations.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│         Frontend Application                        │
│  (Displays theme selection & customization UI)     │
└─────────────────────┬───────────────────────────────┘
                      │ API Calls
                      ↓
┌─────────────────────────────────────────────────────┐
│      Theme API Endpoints                            │
├─────────────────────────────────────────────────────┤
│ Admin Routes:                                       │
│  POST   /admin/themes           → Create theme      │
│  GET    /admin/themes           → List all themes   │
│  GET    /admin/themes/:id       → Get theme         │
│  PATCH  /admin/themes/:id       → Update theme      │
│  PATCH  /admin/themes/:id/activate                  │
│  PATCH  /admin/themes/:id/deactivate                │
│  DELETE /admin/themes/:id       → Delete theme      │
│                                                     │
│ Tenant Routes:                                      │
│  GET    /tenant/theme/available → Get active themes│
│  POST   /tenant/theme/select    → Select theme     │
│  POST   /tenant/theme/customize → Override CSS vars│
│  GET    /tenant/theme          → Get tenant theme  │
│  GET    /tenant/theme/css      → Get CSS format    │
│  GET    /tenant/theme/variables→ Get JSON format   │
└─────────────────────┬───────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────┐
│      ThemesService                                  │
│  (Business logic & data operations)                 │
└─────────────────────┬───────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────┐
│      MongoDB Collections                            │
├─────────────────────────────────────────────────────┤
│ themes:                                             │
│  - _id, name, key, previewImage                     │
│  - cssVariables, status, createdAt, updatedAt      │
│                                                     │
│ tenantthemes:                                       │
│  - _id, tenantId, themeId                          │
│  - customCssVariables, createdAt, updatedAt        │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
backend/src/modules/themes/
├── controllers/
│   ├── admin-themes.controller.ts     (Super admin endpoints)
│   └── tenant-themes.controller.ts    (Tenant endpoints)
├── services/
│   └── themes.service.ts              (Business logic)
├── schemas/
│   ├── theme.schema.ts                (Theme entity)
│   └── tenant-theme.schema.ts         (Tenant theme entity)
├── dto/
│   └── theme.dto.ts                   (Data transfer objects)
└── themes.module.ts                   (Module definition)
```

---

## Step-by-Step Implementation

### 1. Create Database Schemas

#### Theme Schema (`theme.schema.ts`)
- Stores system-wide theme definitions
- Includes name, key (unique identifier), preview image
- Contains cssVariables (default CSS custom properties)
- Status (ACTIVE/INACTIVE) for controlling availability
- Timestamps for audit

```typescript
@Schema({ timestamps: true })
export class Theme {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  key: string;

  @Prop({ type: String, default: null })
  previewImage?: string;

  @Prop({
    type: Map,
    of: String,
    default: {},
  })
  cssVariables: Record<string, string>;

  @Prop({
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt: Date;
}
```

#### TenantTheme Schema (`tenant-theme.schema.ts`)
- Links tenants to themes
- Stores tenant-specific CSS variable overrides
- Ensures one theme per tenant

```typescript
@Schema({ timestamps: true })
export class TenantTheme {
  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Theme',
    required: true,
  })
  themeId: Types.ObjectId;

  @Prop({
    type: Map,
    of: String,
    default: {},
  })
  customCssVariables: Record<string, string>;

  // Timestamps
}
```

### 2. Create Data Transfer Objects (DTOs)

```typescript
// Create theme (admin)
export class CreateThemeDto {
  name: string;
  key: string;
  previewImage?: string;
  cssVariables: Record<string, string>;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Update theme (admin)
export class UpdateThemeDto {
  name?: string;
  key?: string;
  previewImage?: string;
  cssVariables?: Record<string, string>;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Select theme (tenant)
export class SelectThemeDto {
  themeId: string;
}

// Customize theme (tenant)
export class CustomizeThemeDto {
  customCssVariables: Record<string, string>;
}

// Response objects
export class ThemeResponseDto { ... }
export class TenantThemeResponseDto { ... }
```

### 3. Implement ThemesService

The service handles all business logic:

```typescript
@Injectable()
export class ThemesService {
  // Theme Management (Admin)
  async createTheme(createThemeDto): Promise<ThemeResponseDto> { }
  async getAllThemes(includeInactive): Promise<ThemeResponseDto[]> { }
  async getThemeById(themeId): Promise<ThemeResponseDto> { }
  async updateTheme(themeId, updateThemeDto): Promise<ThemeResponseDto> { }
  async activateTheme(themeId): Promise<ThemeResponseDto> { }
  async deactivateTheme(themeId): Promise<ThemeResponseDto> { }
  async deleteTheme(themeId): Promise<void> { }

  // Tenant Operations
  async selectThemeForTenant(tenantId, selectThemeDto): Promise<TenantThemeResponseDto> { }
  async customizeThemeForTenant(tenantId, customizeThemeDto): Promise<TenantThemeResponseDto> { }
  async getTenantTheme(tenantId): Promise<TenantThemeResponseDto> { }

  // Utilities
  async generateCssVariables(tenantId): Promise<string> { }      // CSS format
  async getCssVariablesAsJson(tenantId): Promise<Record> { }    // JSON format

  // Helpers
  private mergeCssVariables(system, custom): Record<string, string> { }
  private mapThemeToDto(theme): ThemeResponseDto { }
  private mapTenantThemeToDto(tenantTheme, theme): TenantThemeResponseDto { }
}
```

### 4. Create Admin Controller

```typescript
@Controller('admin/themes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminThemesController {
  // All CRUD operations for themes
  // Super admin only
}
```

**Endpoints:**
- `POST /admin/themes` — Create
- `GET /admin/themes` — List all
- `GET /admin/themes/:id` — Get one
- `PATCH /admin/themes/:id` — Update
- `PATCH /admin/themes/:id/activate` — Activate
- `PATCH /admin/themes/:id/deactivate` — Deactivate
- `DELETE /admin/themes/:id` — Delete

### 5. Create Tenant Controller

```typescript
@Controller('tenant/theme')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TENANT_OWNER', 'USER')
export class TenantThemesController {
  // Selection and customization endpoints for tenants
}
```

**Endpoints:**
- `GET /tenant/theme/available` — List active themes
- `POST /tenant/theme/select` — Select theme
- `POST /tenant/theme/customize` — Override CSS variables
- `GET /tenant/theme` — Get current theme
- `GET /tenant/theme/css` — Get as CSS
- `GET /tenant/theme/variables` — Get as JSON

### 6. Register Module

```typescript
// themes.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Theme.name, schema: ThemeSchema },
      { name: TenantTheme.name, schema: TenantThemeSchema },
    ]),
  ],
  controllers: [AdminThemesController, TenantThemesController],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
```

### 7. Add to App Module

```typescript
// app.module.ts
@Module({
  imports: [
    // ... other imports
    ThemesModule,
  ],
})
export class AppModule {}
```

---

## Key Features

### 1. Theme Management (Admin)
- ✅ Create system-wide themes with CSS variables
- ✅ Activate/deactivate themes for availability
- ✅ Update theme properties and CSS variables
- ✅ Delete themes (with usage check)
- ✅ View all themes (active and inactive)

### 2. Tenant Theme Selection
- ✅ Browse available (active) themes
- ✅ Select theme for their organization
- ✅ Automatic default theme assignment

### 3. Theme Customization
- ✅ Override CSS variables per tenant
- ✅ Merge system defaults with custom overrides
- ✅ Tenant overrides take priority

### 4. Data Export Formats
- ✅ CSS file format (ready to inject into DOM)
- ✅ JSON format (for JavaScript variable access)
- ✅ Full theme data with merged variables

### 5. Business Rule Enforcement
- ✅ Unique theme keys and names
- ✅ Only active themes can be selected
- ✅ Cannot delete themes in use
- ✅ One theme per tenant
- ✅ Role-based access control

---

## CSS Variables Convention

### Recommended Naming Pattern

```
--[category]-[property]
```

**Examples:**
```typescript
cssVariables: {
  // Colors
  "color-primary": "#007bff",
  "color-secondary": "#6c757d",
  "color-success": "#28a745",
  "color-danger": "#dc3545",
  "color-warning": "#ffc107",
  "color-info": "#17a2b8",
  
  // Typography
  "font-family-base": "Arial, sans-serif",
  "font-size-base": "14px",
  "font-size-lg": "18px",
  "font-size-sm": "12px",
  "font-weight-normal": "400",
  "font-weight-bold": "700",
  
  // Spacing
  "spacing-xs": "4px",
  "spacing-sm": "8px",
  "spacing-md": "16px",
  "spacing-lg": "24px",
  
  // Borders
  "border-radius-sm": "2px",
  "border-radius-md": "4px",
  "border-radius-lg": "8px",
  
  // Shadows
  "shadow-sm": "0 1px 3px rgba(0,0,0,0.1)",
  "shadow-md": "0 4px 6px rgba(0,0,0,0.1)",
}
```

---

## Frontend Integration

### 1. Load Theme on App Startup

```typescript
// app.component.ts or main.ts
async function initializeTheme() {
  try {
    const response = await fetch('/tenant/theme/variables', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const variables = await response.json();
    
    // Apply CSS variables to document
    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
}

// Call before rendering app
initializeTheme();
```

### 2. Theme Selection Dialog

```typescript
// Get available themes
const themes = await fetch('/tenant/theme/available').then(r => r.json());

// Display in UI (React example)
<select onChange={(e) => selectTheme(e.target.value)}>
  {themes.map(theme => (
    <option key={theme._id} value={theme._id}>
      {theme.name}
    </option>
  ))}
</select>

// Select theme
async function selectTheme(themeId) {
  const response = await fetch('/tenant/theme/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId })
  });
  
  const result = await response.json();
  applyTheme(result.mergedCssVariables);
}
```

### 3. CSS Variable Usage in Stylesheets

```css
:root {
  /* System defaults - overridden by CSS variables */
  --color-primary: blue;
}

.button {
  background-color: var(--color-primary);
  font-family: var(--font-family-base);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.card {
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-lg);
}
```

---

## Testing Scenarios

### Admin Testing
1. ✅ Create theme with CSS variables
2. ✅ List all themes (including inactive)
3. ✅ Update theme properties
4. ✅ Activate/deactivate theme
5. ✅ Delete unused theme
6. ✅ Prevent deletion of in-use theme

### Tenant Testing
1. ✅ View available themes
2. ✅ Select theme from available list
3. ✅ Cannot select inactive theme
4. ✅ Customize CSS variables
5. ✅ Verify merging (custom overrides system)
6. ✅ Get theme as CSS format
7. ✅ Get theme as JSON format

### Edge Cases
1. ✅ Tenant without theme selection (return default)
2. ✅ Invalid theme ID
3. ✅ Duplicate theme key
4. ✅ Empty customization
5. ✅ Unauthorized access (non-admin/non-tenant)

---

## Performance Considerations

1. **Database Indexes**
   ```javascript
   // Theme lookups by key
   db.themes.createIndex({ key: 1 });
   
   // Filter active themes
   db.themes.createIndex({ status: 1 });
   
   // Unique tenant-theme relationship
   db.tenantthemes.createIndex({ tenantId: 1 }, { unique: true });
   ```

2. **Caching Strategy**
   - Cache active themes list (short TTL)
   - Cache tenant's selected theme
   - Invalidate cache on updates

3. **Query Optimization**
   - Use projections to exclude unnecessary fields
   - Populate theme data on tenant theme retrieval
   - Index frequently searched fields

---

## Error Handling

### Expected Error Scenarios

1. **400 Bad Request**
   - Duplicate theme key
   - Invalid theme ID format
   - Inactive theme selection
   - Theme in use (deletion)

2. **401 Unauthorized**
   - Missing auth token
   - Invalid token

3. **403 Forbidden**
   - Non-admin accessing admin endpoints
   - Tenant accessing other tenant's theme

4. **404 Not Found**
   - Theme not found
   - Tenant has no theme (return default)

---

## Migration Guide

### From No Theme System

1. Create default themes for existing tenants
2. Assign each tenant to default theme
3. Optionally allow customization
4. Provide migration scripts

```typescript
// Migration script example
async function migrateDefaultThemes(tenantIds: string[]) {
  const defaultTheme = await themesService.getDefaultTheme();
  
  for (const tenantId of tenantIds) {
    await themesService.selectThemeForTenant(tenantId, {
      themeId: defaultTheme._id.toString()
    });
  }
}
```

---

## Related Documentation

- [THEMES-API-DOCUMENTATION.md](./THEMES-API-DOCUMENTATION.md) — Complete API reference
- [Auth Module](./src/auth/) — Authentication implementation
- [Tenants Module](./src/modules/tenants/) — Tenant management
- [Common Guards](./src/common/guards/) — RBAC implementation

---

## Deployment Checklist

- [ ] Create database collections with indexes
- [ ] Deploy backend code (schemas, services, controllers)
- [ ] Verify API endpoints are accessible
- [ ] Create default themes
- [ ] Test admin theme management
- [ ] Test tenant theme selection
- [ ] Test theme customization
- [ ] Deploy frontend theme integration
- [ ] Test complete user flows
- [ ] Monitor for errors in production

---

## Summary

The Theme Management System provides a complete, production-ready solution for:
- ✅ System-wide theme management (admin)
- ✅ Tenant theme selection and customization
- ✅ Flexible CSS variable system
- ✅ Multiple export formats (CSS, JSON)
- ✅ Proper role-based access control
- ✅ Business rule enforcement
- ✅ Performance optimization

All components are fully integrated with the existing auth and multi-tenancy system.
