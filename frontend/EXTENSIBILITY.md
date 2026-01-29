# Frontend Extensibility & Plugin Architecture

## Theming & Branding
- Uses `ThemeContext` and dynamic theme loading (MUI/Tailwind)
- Per-tenant themes and branding supported
- To add a new theme: update `themes.ts` and provide styles in `index.css`

## Tenant Context
- `TenantContext` provides tenant-aware state and logic
- All pages/components can access tenant info for dynamic UI/branding

## Widget/Plugin System (Proposal)
- Create a `widgets/` or `plugins/` folder in `src/`
- Define a `WidgetRegistry` (object or context) to register custom widgets
- Expose extension points in layouts (e.g., dashboard, sidebar, footer)
- Dynamically load widgets from registry/config at runtime
- Example: `WidgetRegistry['custom-analytics'] = CustomAnalyticsWidget`
- Widgets receive props/context (tenant, user, theme, etc.)

## Custom Fields
- Add custom field components to `widgets/` and register in forms/pages
- Use context/hooks to manage custom field state

## Example Extension Points
- Dashboard: Add custom cards/widgets
- Sidebar: Add navigation links or tools
- Profile/Settings: Add custom tabs or fields

## Best Practices
- Use React context/providers for extensibility
- Document new extension points in code and docs
- Provide a sample widget/plugin for onboarding

---

For more, see `src/contexts/`, `src/utils/themes.ts`, and proposed `src/widgets/`.
