-- CMS Pages (Main table)
CREATE TABLE cms_pages (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL,
title VARCHAR(255) NOT NULL,
slug VARCHAR(255) NOT NULL,
UNIQUE(tenant_id, slug),
content JSONB,
status VARCHAR(50) DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED')),
visibility VARCHAR(50) DEFAULT 'PUBLIC' CHECK(visibility IN ('PUBLIC', 'PRIVATE', 'PASSWORD', 'ROLE_BASED')),
password VARCHAR(255),
allowed_roles UUID[] DEFAULT '{}',
parent_page_id UUID REFERENCES cms_pages(id) ON DELETE SET NULL,
meta_tags JSONB DEFAULT '{"title":"","description":"","keywords":[],"ogTitle":"","ogDescription":"","ogImage":"","twitterCard":""}',
json_ld JSONB,
scheduled_publish_at TIMESTAMP,
scheduled_unpublish_at TIMESTAMP,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
created_by UUID NOT NULL,
view_count INT DEFAULT 0,
INDEX(tenant_id),
INDEX(slug),
INDEX(status),
INDEX(parent_page_id)
);

-- Page Versions (Revision history)
CREATE TABLE cms_page_versions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
tenant_id UUID NOT NULL,
version INT NOT NULL,
content JSONB NOT NULL,
change_description VARCHAR(255),
created_by UUID NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
UNIQUE(page_id, version),
INDEX(page_id),
INDEX(tenant_id)
);

-- Page Templates
CREATE TABLE cms_page_templates (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL,
name VARCHAR(255) NOT NULL,
slug VARCHAR(255) NOT NULL,
UNIQUE(tenant_id, slug),
description TEXT,
category VARCHAR(100),
content JSONB NOT NULL,
thumbnail_url VARCHAR(255),
is_global BOOLEAN DEFAULT FALSE,
usage_count INT DEFAULT 0,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
created_by UUID NOT NULL,
INDEX(tenant_id),
INDEX(category)
);

-- A/B Tests
CREATE TABLE cms_ab_tests (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
tenant_id UUID NOT NULL,
name VARCHAR(255) NOT NULL,
description TEXT,
variant_a_content JSONB NOT NULL,
variant_b_content JSONB NOT NULL,
variant_a_views INT DEFAULT 0,
variant_b_views INT DEFAULT 0,
variant_a_conversions INT DEFAULT 0,
variant_b_conversions INT DEFAULT 0,
status VARCHAR(50) DEFAULT 'DRAFT',
started_at TIMESTAMP,
ended_at TIMESTAMP,
created_at TIMESTAMP DEFAULT NOW(),
INDEX(page_id),
INDEX(tenant_id),
INDEX(status)
);

-- Page Analytics
CREATE TABLE cms_page_analytics (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
tenant_id UUID NOT NULL,
views INT DEFAULT 0,
unique_visitors INT DEFAULT 0,
avg_time_on_page INT DEFAULT 0,
bounce_rate FLOAT DEFAULT 0,
conversion_rate FLOAT DEFAULT 0,
date DATE NOT NULL,
metadata JSONB,
UNIQUE(page_id, date),
INDEX(page_id),
INDEX(tenant_id),
INDEX(date)
);

-- SEO Audit Results
CREATE TABLE cms_seo_audit_results (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
tenant_id UUID NOT NULL,
score INT CHECK(score >= 0 AND score <= 100),
title_exists BOOLEAN,
title_length INT,
description_exists BOOLEAN,
description_length INT,
h1_exists BOOLEAN,
alt_text_missing INT,
internal_links INT,
external_links INT,
page_speed_score INT,
mobile_friendly BOOLEAN,
ssl_enabled BOOLEAN,
structured_data BOOLEAN,
recommendations JSONB,
created_at TIMESTAMP DEFAULT NOW(),
INDEX(page_id),
INDEX(tenant_id),
INDEX(score)
);

-- File Imports (Track uploaded files)
CREATE TABLE cms_file_imports (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL,
file_name VARCHAR(255) NOT NULL,
file_type VARCHAR(50) NOT NULL,
file_size INT,
import_type VARCHAR(50) NOT NULL CHECK(import_type IN ('ZIP', 'FIGMA', 'SKETCH', 'XD', 'CANVA', 'PPT', 'PSD', 'AI', 'DREAMWEAVER')),
status VARCHAR(50) DEFAULT 'PROCESSING' CHECK(status IN ('PROCESSING', 'SUCCESS', 'FAILED')),
pages_created INT DEFAULT 0,
error_message TEXT,
created_pages UUID[],
created_at TIMESTAMP DEFAULT NOW(),
completed_at TIMESTAMP,
created_by UUID NOT NULL,
INDEX(tenant_id),
INDEX(import_type),
INDEX(status)
);

-- Menu Items
CREATE TABLE cms_menu_items (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL,
menu_name VARCHAR(100) NOT NULL,
label VARCHAR(255) NOT NULL,
url VARCHAR(255),
page_id UUID REFERENCES cms_pages(id) ON DELETE SET NULL,
parent_item_id UUID REFERENCES cms_menu_items(id) ON DELETE CASCADE,
icon_name VARCHAR(100),
icon_class VARCHAR(100),
sort_order INT,
is_visible BOOLEAN DEFAULT TRUE,
allowed_roles UUID[] DEFAULT '{}',
custom_attributes JSONB,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
INDEX(tenant_id),
INDEX(menu_name),
INDEX(parent_item_id)
);

-- CSS Variables (Theme customization)
CREATE TABLE cms_css_variables (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL,
variable_name VARCHAR(255) NOT NULL UNIQUE,
variable_value VARCHAR(255) NOT NULL,
category VARCHAR(100),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
INDEX(tenant_id),
INDEX(category)
);

-- Page Design State (Save/Load)
CREATE TABLE cms_design_state (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
tenant_id UUID NOT NULL,
design_json JSONB NOT NULL,
section_count INT,
element_count INT,
saved_at TIMESTAMP DEFAULT NOW(),
saved_by UUID NOT NULL,
INDEX(page_id),
INDEX(tenant_id)
);

-- Page Change Log (Audit trail)
CREATE TABLE cms_page_changelog (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
tenant_id UUID NOT NULL,
action VARCHAR(50) NOT NULL,
changed_by UUID NOT NULL,
changed_at TIMESTAMP DEFAULT NOW(),
previous_values JSONB,
new_values JSONB,
description TEXT,
INDEX(page_id),
INDEX(tenant_id),
INDEX(changed_at)
);
