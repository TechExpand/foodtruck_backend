const fs = require('fs');
const path = require('path');

// Define route mappings from HTML to Express routes
const routeMappings = {
  // Main navigation
  'index.html': '/',
  'dashboard.html': '/',
  'index2.html': '/dashboard',
  
  // Auth pages
  'auth-basic-login.html': '/auth/login',
  'auth-basic-register.html': '/auth/register',
  'auth-basic-forgot-password.html': '/auth/forgot-password',
  'auth-basic-reset-password.html': '/auth/reset-password',
  'auth-cover-login.html': '/auth/login',
  'auth-cover-register.html': '/auth/register',
  'auth-cover-forgot-password.html': '/auth/forgot-password',
  'auth-cover-reset-password.html': '/auth/reset-password',
  'auth-boxed-login.html': '/auth/login',
  'auth-boxed-register.html': '/auth/register',
  'auth-boxed-forgot-password.html': '/auth/forgot-password',
  'auth-boxed-reset-password.html': '/auth/reset-password',
  
  // Main pages
  'vendors.html': '/vendors',
  'users.html': '/users',
  'profile.html': '/profile',
  'user-profile.html': '/profile',
  
  // Admin pages
  'admin-vendors.html': '/admin-vendors',
  'admin-tags.html': '/admin-tags',
  'admin-events.html': '/admin-events',
  
  // Ecommerce pages
  'ecommerce-products.html': '/ecommerce/products',
  'ecommerce-orders.html': '/ecommerce/orders',
  'ecommerce-customers.html': '/ecommerce/customers',
  'ecommerce-customer-details.html': '/ecommerce/customer-details',
  'ecommerce-add-product.html': '/ecommerce/add-product',
  
  // App pages
  'app-fullcalender.html': '/calendar',
  'app-to-do.html': '/todo',
  'app-invoice.html': '/invoice',
  'add-event.html': '/add-event',
  
  // Component pages
  'component-alerts.html': '/components/alerts',
  'component-badges.html': '/components/badges',
  'component-buttons.html': '/components/buttons',
  'component-cards-basic.html': '/components/cards-basic',
  'component-cards-advance.html': '/components/cards-advance',
  'component-cards-contact.html': '/components/cards-contact',
  'component-navbar.html': '/components/navbar',
  'component-modals.html': '/components/modals',
  'component-notifications.html': '/components/notifications',
  'component-typography.html': '/components/typography',
  'component-accordions.html': '/components/accordions',
  'component-carousels.html': '/components/carousels',
  'component-media-object.html': '/components/media-object',
  'component-navs-tabs.html': '/components/navs-tabs',
  'component-paginations.html': '/components/paginations',
  'component-popovers-tooltips.html': '/components/popovers-tooltips',
  'component-progress-bars.html': '/components/progress-bars',
  'component-spinners.html': '/components/spinners',
  'component-avtars-chips.html': '/components/avatars-chips',
  'component-text-utilities.html': '/components/text-utilities',
  
  // Form pages
  'form-elements.html': '/forms/elements',
  'form-layouts.html': '/forms/layouts',
  'form-validations.html': '/forms/validations',
  'form-wizard.html': '/forms/wizard',
  'form-file-upload.html': '/forms/file-upload',
  'form-date-time-pickes.html': '/forms/date-time-pickers',
  'form-select2.html': '/forms/select2',
  'form-repeater.html': '/forms/repeater',
  'form-input-group.html': '/forms/input-group',
  'form-radios-and-checkboxes.html': '/forms/radios-checkboxes',
  
  // Table pages
  'table-basic-table.html': '/tables/basic',
  'table-datatable.html': '/tables/datatable',
  
  // Chart pages
  'charts-apex-chart.html': '/charts/apex',
  'charts-chartjs.html': '/charts/chartjs',
  
  // Map pages
  'map-google-maps.html': '/maps/google',
  'map-vector-maps.html': '/maps/vector',
  
  // Widget pages
  'widgets-data.html': '/widgets/data',
  'widgets-advance.html': '/widgets/advance',
  
  // Icon pages
  'icons-line-icons.html': '/icons/line-icons',
  'icons-boxicons.html': '/icons/boxicons',
  'icons-feather-icons.html': '/icons/feather-icons',
  
  // Page pages
  'pages-error-404.html': '/error/404',
  'pages-error-505.html': '/error/500',
  'pages-coming-soon.html': '/coming-soon',
  'pages-starter-page.html': '/starter-page',
  
  // Other pages
  'faq.html': '/faq',
  'pricing-table.html': '/pricing',
  'timeline.html': '/timeline',
  'user-profile copy.html': '/profile'
};

// Function to fix HTML routes in a file
function fixHtmlRoutesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace all HTML routes with Express routes
    for (const [htmlRoute, expressRoute] of Object.entries(routeMappings)) {
      const htmlPattern = new RegExp(`href=["']${htmlRoute.replace('.', '\\.')}["']`, 'g');
      if (htmlPattern.test(content)) {
        content = content.replace(htmlPattern, `href="${expressRoute}"`);
        modified = true;
        console.log(`Fixed ${htmlRoute} -> ${expressRoute} in ${filePath}`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and fix EJS files
function fixHtmlRoutesInDirectory(directory) {
  const files = fs.readdirSync(directory);
  let totalFixed = 0;
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      totalFixed += fixHtmlRoutesInDirectory(filePath);
    } else if (file.endsWith('.ejs')) {
      if (fixHtmlRoutesInFile(filePath)) {
        totalFixed++;
      }
    }
  }
  
  return totalFixed;
}

// Main execution
const viewsDirectory = path.join(__dirname, '..', 'views');
console.log('Starting to fix HTML routes in EJS files...');
console.log(`Scanning directory: ${viewsDirectory}`);

const fixedFiles = fixHtmlRoutesInDirectory(viewsDirectory);
console.log(`\nCompleted! Fixed HTML routes in ${fixedFiles} files.`); 