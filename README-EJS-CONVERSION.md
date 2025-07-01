# HTML to EJS Conversion Documentation

## Overview
This document describes the conversion of HTML files from the `fte-ctrl-html` directory to EJS templates while maintaining the TypeScript backend.

## What Was Done

### 1. EJS Setup
- Installed `ejs` and `@types/ejs` for TypeScript support
- Installed `express-ejs-layouts` for layout management
- Configured Express.js to use EJS as the view engine

### 2. Directory Structure
Created the following EJS directory structure:
```
views/
├── partials/
│   ├── head.ejs          # Common head section
│   ├── header.ejs        # Navigation header
│   ├── sidebar.ejs       # Sidebar navigation
│   └── footer.ejs        # Footer section
├── layout.ejs            # Main layout template
├── auth-layout.ejs       # Authentication layout
├── pages/                # Main pages
├── auth/                 # Authentication pages
├── components/           # UI components
├── forms/                # Form pages
├── tables/               # Table pages
├── charts/               # Chart pages
├── maps/                 # Map pages
├── icons/                # Icon pages
├── widgets/              # Widget pages
└── ecommerce/            # E-commerce pages
```

### 3. Conversion Process
- Created a conversion script (`scripts/convert-html-to-ejs.js`) that:
  - Removes HTML boilerplate (DOCTYPE, html, head, body tags)
  - Converts asset paths to use root paths (`/assets/` → `/`)
  - Converts relative links to absolute paths
  - Adds EJS variables for dynamic content
  - Organizes files into appropriate directories based on naming conventions

### 4. Backend Integration
- Created `ViewsController` class to handle EJS rendering
- Created view routes in `routes/views.ts`
- Updated `app.ts` to serve static assets and handle view routes
- Maintained existing API routes with authorization

### 5. Layout System
- **Main Layout**: Uses `layout.ejs` with header, sidebar, and footer
- **Auth Layout**: Uses `auth-layout.ejs` for authentication pages
- **Partial System**: Reusable components (head, header, sidebar, footer)

## File Conversion Mapping

### Authentication Pages
- `auth-basic-login.html` → `views/auth/basic-login.ejs`
- `auth-basic-register.html` → `views/auth/basic-register.ejs`
- `auth-basic-forgot-password.html` → `views/auth/basic-forgot-password.ejs`
- `auth-cover-login.html` → `views/auth/cover-login.ejs`
- etc.

### Main Pages
- `index.html` → `views/pages/dashboard.ejs`
- `user-profile.html` → `views/pages/profile.ejs`
- `users.html` → `views/pages/users.ejs`
- `vendors.html` → `views/pages/vendors.ejs`

### Component Pages
- `component-buttons.html` → `views/components/buttons.ejs`
- `component-cards-basic.html` → `views/components/cards-basic.ejs`
- `component-alerts.html` → `views/components/alerts.ejs`
- etc.

### Form Pages
- `form-elements.html` → `views/forms/elements.ejs`
- `form-layouts.html` → `views/forms/layouts.ejs`
- `form-validations.html` → `views/forms/validations.ejs`
- etc.

### E-commerce Pages
- `ecommerce-products.html` → `views/ecommerce/ecommerce-products.ejs`
- `ecommerce-orders.html` → `views/ecommerce/ecommerce-orders.ejs`
- `ecommerce-customers.html` → `views/ecommerce/ecommerce-customers.ejs`
- etc.

## Usage

### Starting the Server
```bash
npm run serve
```

### Accessing Pages
- Dashboard: `http://localhost:8000/`
- Login: `http://localhost:8000/auth/login`
- Register: `http://localhost:8000/auth/register`
- Profile: `http://localhost:8000/profile`
- Users: `http://localhost:8000/users`
- Components: `http://localhost:8000/components/buttons`
- Forms: `http://localhost:8000/forms/elements`
- Tables: `http://localhost:8000/tables/basic`
- Charts: `http://localhost:8000/charts/apex`
- Maps: `http://localhost:8000/maps/google`
- Widgets: `http://localhost:8000/widgets/data`

### API Endpoints
All existing API endpoints remain unchanged and are accessible at `/foodtruck/*`

## Key Features

### 1. Dynamic Content
- Page titles are dynamic using `<%= title %>`
- User data can be passed to templates
- Active page highlighting in navigation

### 2. Asset Management
- Static assets served from `/fte-ctrl-html/assets/`
- All asset paths converted to use root paths
- CSS and JS files properly linked

### 3. Layout Flexibility
- Different layouts for different page types
- Reusable partials for common elements
- Easy to maintain and extend

### 4. TypeScript Integration
- Full TypeScript support maintained
- Type-safe controllers and routes
- Proper error handling

## Benefits of the Conversion

1. **Maintainability**: EJS templates are easier to maintain than static HTML
2. **Reusability**: Partials and layouts reduce code duplication
3. **Dynamic Content**: Server-side rendering with dynamic data
4. **Consistency**: Unified layout and styling across all pages
5. **Performance**: Static assets served efficiently
6. **Scalability**: Easy to add new pages and features

## Next Steps

1. **Customize Templates**: Modify EJS templates to match your specific needs
2. **Add Dynamic Data**: Integrate with your database models
3. **Authentication**: Implement proper authentication flow
4. **Form Handling**: Add form processing and validation
5. **API Integration**: Connect frontend with your existing API endpoints

## Notes

- All original HTML files are preserved in `fte-ctrl-html/`
- The conversion script can be run again if needed
- Static assets (CSS, JS, images) are served from the original location
- The TypeScript backend remains unchanged and fully functional 