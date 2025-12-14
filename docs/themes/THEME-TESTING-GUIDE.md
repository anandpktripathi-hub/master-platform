# Phase 3.3 - Theme Module Testing Guide

## 🎯 Testing Objective
Verify that the complete theme system works end-to-end:
- Platform super admin can create/manage global themes
- Tenants can select themes
- Tenants can customize selected themes
- Theme changes apply immediately and persist
- Tenant isolation is maintained

---

## 🔧 Prerequisites

### 1. Backend Running
```powershell
cd c:\Users\annes\Desktop\smetasc-saas-multi-tenancy-app\backend
npm run start:dev
```
Backend should be running on `http://localhost:3000`

### 2. Frontend Running
```powershell
cd c:\Users\annes\Desktop\smetasc-saas-multi-tenancy-app\frontend
npm run dev
```
Frontend should be running on `http://localhost:5173`

### 3. Database Clean
Ensure MongoDB is running and accessible.

### 4. Create Test Accounts
You need:
- **Platform Super Admin**: User with `MANAGE_PLATFORM_THEMES` permission
- **Tenant A Owner**: User with `MANAGE_TENANT_WEBSITE` permission (Tenant A)
- **Tenant B Owner**: User with `MANAGE_TENANT_WEBSITE` permission (Tenant B)

---

## 📋 Test Cases

### Test 1: Platform Admin Creates Themes

**Goal**: Super admin creates 3 global themes that tenants can select from.

**Steps**:
1. Login as **Platform Super Admin**
2. Navigate to: `http://localhost:5173/admin/themes`
3. Click **"Create Theme"** button

#### Theme 1: Modern Light
```
Name: Modern Light
Slug: modern-light
Primary Color: #1976d2 (Blue)
Secondary Color: #dc004e (Pink)
Background Color: #ffffff (White)
Surface Color: #f5f5f5 (Light Gray)
Text Primary: #000000 (Black)
Text Secondary: #666666 (Gray)
Font Family: Roboto, sans-serif
Base Font Size: 14
Base Spacing: 8
Border Radius: 4
Active: ✅ Checked
```

4. Click **"Create"**
5. Verify theme appears in the DataGrid table
6. Click **Star Icon** next to "Modern Light" to set as **Default**
7. Verify star icon is filled (yellow)

#### Theme 2: Dark Professional
```
Name: Dark Professional
Slug: dark-professional
Primary Color: #90caf9 (Light Blue)
Secondary Color: #f48fb1 (Light Pink)
Background Color: #121212 (Dark)
Surface Color: #1e1e1e (Dark Gray)
Text Primary: #ffffff (White)
Text Secondary: #b0b0b0 (Light Gray)
Font Family: Inter, sans-serif
Base Font Size: 14
Base Spacing: 8
Border Radius: 8
Active: ✅ Checked
```

8. Click **"Create Theme"** again and create this theme

#### Theme 3: Vibrant Colors
```
Name: Vibrant Colors
Slug: vibrant-colors
Primary Color: #ff5722 (Orange)
Secondary Color: #4caf50 (Green)
Background Color: #fafafa (Off-White)
Surface Color: #ffffff (White)
Text Primary: #212121 (Dark Gray)
Text Secondary: #757575 (Medium Gray)
Font Family: Poppins, sans-serif
Base Font Size: 15
Base Spacing: 10
Border Radius: 12
Active: ✅ Checked
```

9. Create this theme as well

**Expected Results**:
- ✅ 3 themes created successfully
- ✅ "Modern Light" is marked as default (star icon filled)
- ✅ All themes show correct color previews in DataGrid
- ✅ Active chips show "Active" (green)

**Test Admin Edit/Delete**:
10. Click **Edit** icon on "Vibrant Colors"
11. Change `Primary Color` to `#e91e63` (Pink)
12. Click **"Update"**
13. Verify color updated in table
14. Try to delete "Modern Light" (the default theme)
15. Verify delete button is **disabled** (default themes can't be deleted)

---

### Test 2: Tenant A Selects Theme

**Goal**: Tenant A selects a theme from available options.

**Steps**:
1. Logout from admin account
2. Login as **Tenant A Owner**
3. Navigate to: `http://localhost:5173/tenant/theme/select`
4. Verify **3 theme cards** are displayed:
   - Modern Light
   - Dark Professional  
   - Vibrant Colors
5. Each card should show:
   - Theme name
   - Color preview (2 color boxes + sample surface)
   - Sample text in theme colors
   - Chip showing primary/secondary colors
   - "Default" chip on Modern Light
6. Click **"Select"** button on **"Dark Professional"**
7. Wait for success message: "Theme selected successfully"
8. Verify card now shows **"Current"** chip (blue with checkmark)
9. Verify button changes to **"Selected"** (disabled)
10. Verify **entire page theme changes** to dark colors immediately

**Expected Results**:
- ✅ 3 themes available for selection
- ✅ Theme previews accurately show colors
- ✅ After selection, "Current" chip appears
- ✅ Page theme changes instantly (dark background, light text)
- ✅ Success alert shown

---

### Test 3: Tenant A Customizes Theme

**Goal**: Tenant A customizes their selected theme with brand colors.

**Steps**:
1. Still logged in as **Tenant A Owner**
2. On theme selector page, click **"Customize Theme"** button (top right)
3. Navigate to: `http://localhost:5173/tenant/theme/customize`
4. Verify **left panel** shows customization controls:
   - 6 color pickers (Primary, Secondary, Background, Surface, Text colors)
   - Font family text input
   - 3 sliders (Font Size, Spacing, Border Radius)
5. Verify **right panel** shows **Live Preview** with current theme

**Customize Colors**:
6. Change **Primary Color** to `#ff6b6b` (Red)
7. Verify live preview updates immediately (primary button changes to red)
8. Change **Secondary Color** to `#4ecdc4` (Teal)
9. Verify secondary button in preview updates

**Customize Typography**:
10. Change **Font Family** to: `Open Sans, sans-serif`
11. Move **Base Font Size** slider to `16`
12. Verify preview text size increases

**Customize Spacing**:
13. Move **Border Radius** slider to `16`
14. Verify preview buttons become more rounded

15. Click **"Save Changes"** button (top right)
16. Wait for success message: "Theme customized successfully"
17. Verify entire page theme updates with new customizations

**Expected Results**:
- ✅ All controls functional
- ✅ Live preview updates in real-time
- ✅ After save, entire app theme updates
- ✅ Navigation to other pages shows new theme applied

**Test Persistence**:
18. Close browser tab
19. Open new tab and login as **Tenant A Owner** again
20. Navigate to dashboard or any page
21. Verify **custom theme persists** (red primary color, teal secondary, etc.)

---

### Test 4: Tenant B Has Independent Theme

**Goal**: Verify tenant isolation - Tenant B's theme is independent of Tenant A.

**Steps**:
1. Logout from Tenant A
2. Login as **Tenant B Owner**
3. Navigate to: `http://localhost:5173/tenant/theme/select`
4. Verify Tenant B sees **3 available themes** (same as Tenant A)
5. Verify **NO "Current" chip** on any theme (Tenant B hasn't selected yet)
6. Verify page is using **"Modern Light"** (the default theme)
   - Light background, dark text

**Select Different Theme**:
7. Click **"Select"** on **"Vibrant Colors"**
8. Verify theme changes to vibrant orange/green colors
9. Navigate to: `http://localhost:5173/tenant/theme/customize`
10. Change **Primary Color** to `#9c27b0` (Purple)
11. Change **Secondary Color** to `#00bcd4` (Cyan)
12. Click **"Save Changes"**
13. Verify Tenant B's theme is now purple/cyan

**Verify Tenant A Unchanged**:
14. Logout from Tenant B
15. Login as **Tenant A Owner** again
16. Navigate to dashboard
17. Verify Tenant A's theme is still **red/teal** (NOT purple/cyan)

**Expected Results**:
- ✅ Tenant B starts with default theme
- ✅ Tenant B can select and customize independently
- ✅ Tenant A's theme unchanged after Tenant B's changes
- ✅ Full tenant isolation confirmed

---

### Test 5: Reset Theme to Base

**Goal**: Verify reset functionality removes customizations.

**Steps**:
1. Login as **Tenant A Owner**
2. Navigate to: `http://localhost:5173/tenant/theme/customize`
3. Verify customizations are loaded (red primary, teal secondary, etc.)
4. Click **"Reset to Base"** button (top right)
5. Confirm dialog: "Reset all customizations and return to base theme?"
6. Click **OK**
7. Wait for success message: "Theme reset successfully"
8. Verify all color pickers reset to **base theme colors** (Dark Professional):
   - Primary: #90caf9 (Light Blue)
   - Secondary: #f48fb1 (Light Pink)
9. Verify live preview shows base theme
10. Verify entire page theme reverts to base (no customizations)

**Expected Results**:
- ✅ Reset confirmation dialog appears
- ✅ After reset, customizations cleared
- ✅ Theme reverts to exact base theme colors
- ✅ Page reflects base theme

---

### Test 6: Tenant Switches Themes

**Goal**: Verify selecting a new theme clears previous customizations.

**Steps**:
1. Login as **Tenant A Owner**
2. Navigate to: `http://localhost:5173/tenant/theme/customize`
3. Customize again:
   - Primary: #e91e63 (Pink)
   - Secondary: #ffc107 (Yellow)
4. Click **"Save Changes"**
5. Navigate back to: `http://localhost:5173/tenant/theme/select`
6. Click **"Select"** on **"Modern Light"** (different theme)
7. Confirm: "Select this theme? (Your customizations will be cleared)"
8. Verify theme switches to Modern Light
9. Navigate to: `http://localhost:5173/tenant/theme/customize`
10. Verify **all customizations are empty** (all controls show base theme values)

**Expected Results**:
- ✅ Selecting new theme clears customizations
- ✅ Customizer page shows new base theme
- ✅ No residual customizations from previous theme

---

### Test 7: Admin Deactivates Theme

**Goal**: Verify inactive themes don't appear for tenant selection.

**Steps**:
1. Logout and login as **Platform Super Admin**
2. Navigate to: `http://localhost:5173/admin/themes`
3. Click **Edit** on "Vibrant Colors"
4. Uncheck **"Active"** checkbox
5. Click **"Update"**
6. Verify "Active" chip changes to "Inactive" (gray)

**Verify Tenant View**:
7. Logout and login as **Tenant A Owner**
8. Navigate to: `http://localhost:5173/tenant/theme/select`
9. Verify only **2 themes** are shown:
   - Modern Light
   - Dark Professional
10. Verify **"Vibrant Colors" is NOT visible**

**Re-activate**:
11. Logout and login as **Platform Super Admin** again
12. Navigate to: `http://localhost:5173/admin/themes`
13. Edit "Vibrant Colors" and check **"Active"** again
14. Update theme
15. Verify tenants can see it again

**Expected Results**:
- ✅ Inactive themes hidden from tenant selection
- ✅ Re-activating makes theme visible again
- ✅ Admin can control theme availability

---

### Test 8: Domain/Subdomain Isolation

**Goal**: Verify themes work correctly with domain routing.

**Prerequisites**: Add to `hosts` file (if not already done):
```
127.0.0.1 tenant1.localhost
127.0.0.1 tenant2.localhost
```

**Steps**:
1. Ensure **Tenant A** has subdomain: `tenant1`
2. Ensure **Tenant B** has subdomain: `tenant2`
3. Login to Tenant A at: `http://tenant1.localhost:5173/login`
4. Verify Tenant A's custom theme loads (e.g., red/teal)
5. Logout
6. Login to Tenant B at: `http://tenant2.localhost:5173/login`
7. Verify Tenant B's theme loads (e.g., purple/cyan or vibrant colors)
8. Open both in separate browser windows side-by-side
9. Verify themes are different and isolated

**Expected Results**:
- ✅ Each subdomain loads correct tenant's theme
- ✅ Themes persist across subdomains
- ✅ No cross-contamination

---

## ✅ Test Summary Checklist

After completing all tests, verify:

- [ ] Admin can create themes (Test 1)
- [ ] Admin can edit themes (Test 1)
- [ ] Admin can set default theme (Test 1)
- [ ] Admin cannot delete default theme (Test 1)
- [ ] Admin can deactivate themes (Test 7)
- [ ] Tenant can see available themes (Test 2)
- [ ] Tenant can select theme (Test 2)
- [ ] Theme applies immediately after selection (Test 2)
- [ ] Tenant can customize theme (Test 3)
- [ ] Customizations apply immediately (Test 3)
- [ ] Customizations persist after logout (Test 3)
- [ ] Different tenants have independent themes (Test 4)
- [ ] Tenant A changes don't affect Tenant B (Test 4)
- [ ] Reset removes customizations (Test 5)
- [ ] Switching themes clears customizations (Test 6)
- [ ] Inactive themes hidden from tenants (Test 7)
- [ ] Domain routing preserves themes (Test 8)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch tenant theme"
**Cause**: User not authenticated or backend not running.
**Solution**: 
- Ensure backend running on `http://localhost:3000`
- Check JWT token is valid
- Check browser console for CORS errors

### Issue 2: Theme doesn't update after save
**Cause**: Frontend theme context not refreshed.
**Solution**: 
- Hard refresh browser (Ctrl+Shift+R)
- Check `refreshTheme()` is called after API operations
- Verify API returns updated theme in response

### Issue 3: "Permission denied" on admin pages
**Cause**: User lacks `MANAGE_PLATFORM_THEMES` permission.
**Solution**: 
- Verify user has correct role in database
- Check `PermissionsGuard` is working correctly
- Test with different user account

### Issue 4: Colors look wrong in preview
**Cause**: MUI theme conversion issue or CSS specificity.
**Solution**: 
- Check `createMuiTheme()` function logic
- Verify color hex codes are valid
- Check browser DevTools for CSS conflicts

### Issue 5: DataGrid not showing themes
**Cause**: API call failed or empty response.
**Solution**: 
- Check network tab (F12) for API response
- Verify MongoDB connection working
- Check backend logs for errors

---

## 📝 Test Results Template

Copy this template to record your test results:

```
=== Phase 3.3 Theme Module Test Results ===
Date: _______________
Tester: _______________

Test 1 - Admin Creates Themes: ☐ PASS ☐ FAIL
Notes: ________________________________________________

Test 2 - Tenant Selects Theme: ☐ PASS ☐ FAIL
Notes: ________________________________________________

Test 3 - Tenant Customizes: ☐ PASS ☐ FAIL
Notes: ________________________________________________

Test 4 - Tenant Isolation: ☐ PASS ☐ FAIL
Notes: ________________________________________________

Test 5 - Reset Theme: ☐ PASS ☐ FAIL
Notes: ________________________________________________

Test 6 - Switch Themes: ☐ PASS ☐ FAIL
Notes: ________________________________________________

Test 7 - Deactivate Theme: ☐ PASS ☐ FAIL
Notes: ________________________________________________

Test 8 - Domain Routing: ☐ PASS ☐ FAIL
Notes: ________________________________________________

Overall Status: ☐ ALL PASS ☐ ISSUES FOUND
```

---

## 🎉 Success Criteria

Phase 3.3 is **COMPLETE** when:
1. ✅ All 8 tests pass without errors
2. ✅ Theme changes apply instantly
3. ✅ Themes persist after logout/login
4. ✅ Tenant isolation confirmed
5. ✅ Admin controls work correctly
6. ✅ No console errors during testing
7. ✅ Domain routing preserves themes

---

## 📚 Next Steps

After Phase 3.3 completes successfully:
- **Phase 3.4**: Implement security hardening & comprehensive tests
- **Phase 3.5**: Live end-to-end check across all features
- **Phase 4**: Production deployment preparation

---

**End of Phase 3.3 Testing Guide**
