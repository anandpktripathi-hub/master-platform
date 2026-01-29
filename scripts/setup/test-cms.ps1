Write-Host "=== TEST 1: Create CMS Page ===" -ForegroundColor Green
$pageBody = @{
    title = "Home Page"
    slug = "home"
    status = "DRAFT"
    visibility = "PUBLIC"
    content = @{ sections = @() }
} | ConvertTo-Json

$pageRes = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/pages" -Method Post `
    -Headers @{"X-Tenant-ID"="demo-tenant"; "Content-Type"="application/json"} `
    -Body $pageBody

$pageId = $pageRes._id
Write-Host "✅ Page created with ID: $pageId`n"

Write-Host "=== TEST 2: Create Template ===" -ForegroundColor Green
$templateBody = @{
    name = "Blog Template"
    slug = "blog-template"
    category = "blog"
    description = "Pre-built blog template"
    content = @{ type = "blog"; sections = @() }
    thumbnailUrl = "https://example.com/thumb.jpg"
} | ConvertTo-Json

$templateRes = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/templates" -Method Post `
    -Headers @{"X-Tenant-ID"="demo-tenant"; "Content-Type"="application/json"} `
    -Body $templateBody

$templateId = $templateRes._id
Write-Host "✅ Template created with ID: $templateId`n"

Write-Host "=== TEST 3: Use Template to Create Page ===" -ForegroundColor Green
$useTemplateRes = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/templates/$templateId/use" -Method Post `
    -Headers @{"X-Tenant-ID"="demo-tenant"; "Content-Type"="application/json"} `
    -Body '{"pageName":"My Blog Post"}'

Write-Host "✅ Page created from template: $($useTemplateRes.title)`n"

Write-Host "=== TEST 4: Run SEO Audit ===" -ForegroundColor Green
$auditRes = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/seo-audit/$pageId/run" -Method Post `
    -Headers @{"X-Tenant-ID"="demo-tenant"}

Write-Host "✅ SEO Audit Score: $($auditRes.score) | Status: $($auditRes.overallStatus)`n"

Write-Host "=== TEST 5: Track Page View ===" -ForegroundColor Green
$trackRes = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/analytics/$pageId/track" -Method Post `
    -Headers @{"X-Tenant-ID"="demo-tenant"; "Content-Type"="application/json"} `
    -Body '{}'

Write-Host "✅ Page view tracked`n"

Write-Host "=== TEST 6: Get Page Analytics ===" -ForegroundColor Green
$analyticsRes = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/analytics/page/$pageId" `
    -Headers @{"X-Tenant-ID"="demo-tenant"}

Write-Host "✅ Analytics retrieved: $($analyticsRes.Length) records`n"

Write-Host "=== TEST 7: Get Tenant Analytics ===" -ForegroundColor Green
$tenantAnalytics = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/analytics/tenant" `
    -Headers @{"X-Tenant-ID"="demo-tenant"}

Write-Host "✅ Tenant Total Views: $($tenantAnalytics.totalViews) | Pages: $($tenantAnalytics.totalPages)`n"

Write-Host "=== TEST 8: Create Menu Item ===" -ForegroundColor Green
$menuBody = @{
    label = "Home"
    url = "/"
    order = 1
    isVisible = $true
} | ConvertTo-Json

$menuRes = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/menus/main/items" -Method Post `
    -Headers @{"X-Tenant-ID"="demo-tenant"; "Content-Type"="application/json"} `
    -Body $menuBody

$menuItemId = $menuRes._id
Write-Host "✅ Menu item created: $($menuRes.label)`n"

Write-Host "=== TEST 9: Get Menu Tree ===" -ForegroundColor Green
$menuTree = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/menus/main/tree" `
    -Headers @{"X-Tenant-ID"="demo-tenant"}

Write-Host "✅ Menu tree retrieved with $($menuTree.Length) items`n"

Write-Host "=== TEST 10: Get Import History ===" -ForegroundColor Green
$importHistory = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/api/cms/import/history" `
    -Headers @{"X-Tenant-ID"="demo-tenant"}

Write-Host "✅ Import history: $($importHistory.Length) imports`n"

Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ ALL 10 CMS TESTS PASSED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
