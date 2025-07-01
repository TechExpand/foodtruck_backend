const fs = require('fs');
const path = require('path');

// Function to convert HTML to EJS
function convertHtmlToEjs(htmlContent, fileName) {
    let ejsContent = htmlContent;
    
    // Remove DOCTYPE and html tags (will be handled by layout)
    ejsContent = ejsContent.replace(/<!doctype[^>]*>/i, '');
    ejsContent = ejsContent.replace(/<html[^>]*>/i, '');
    ejsContent = ejsContent.replace(/<\/html>/i, '');
    
    // Remove head section (will be handled by layout)
    ejsContent = ejsContent.replace(/<head[\s\S]*?<\/head>/i, '');
    
    // Remove body opening tag (will be handled by layout)
    ejsContent = ejsContent.replace(/<body[^>]*>/i, '');
    ejsContent = ejsContent.replace(/<\/body>/i, '');
    
    // Convert asset paths to use root path
    ejsContent = ejsContent.replace(/src="assets\//g, 'src="/');
    ejsContent = ejsContent.replace(/href="assets\//g, 'href="/');
    
    // Convert relative links to absolute paths
    ejsContent = ejsContent.replace(/href="([^"]*\.html)"/g, (match, link) => {
        const pageName = link.replace('.html', '');
        return `href="/${pageName}"`;
    });
    
    // Add EJS variables for dynamic content
    ejsContent = ejsContent.replace(/<title>([^<]*)<\/title>/i, '<title><%= title %></title>');
    
    // Convert static content to EJS variables where appropriate
    ejsContent = ejsContent.replace(/Foodtruck Express/g, '<%= title || "FoodTruck Express" %>');
    
    return ejsContent;
}

// Function to determine the target directory based on file name
function getTargetDirectory(fileName) {
    const name = fileName.toLowerCase();
    
    if (name.includes('auth-')) return 'views/auth';
    if (name.includes('login') || name.includes('register') || name.includes('forgot')) return 'views/auth';
    if (name.includes('user') || name.includes('profile')) return 'views/pages';
    if (name.includes('ecommerce') || name.includes('product') || name.includes('order')) return 'views/ecommerce';
    if (name.includes('component-')) return 'views/components';
    if (name.includes('form-')) return 'views/forms';
    if (name.includes('table-')) return 'views/tables';
    if (name.includes('chart-')) return 'views/charts';
    if (name.includes('map-')) return 'views/maps';
    if (name.includes('icon-')) return 'views/icons';
    if (name.includes('widget-')) return 'views/widgets';
    if (name.includes('error') || name.includes('404') || name.includes('500')) return 'views/pages';
    if (name === 'index.html') return 'views/pages';
    
    return 'views/pages';
}

// Function to get the EJS file name
function getEjsFileName(fileName) {
    let name = fileName.replace('.html', '');
    
    // Remove prefixes
    name = name.replace(/^(auth-|component-|form-|table-|chart-|map-|icon-|widget-)/, '');
    
    // Convert to kebab-case if needed
    name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Handle special cases
    if (name === 'index') return 'dashboard';
    if (name === 'user-profile') return 'profile';
    if (name === 'user-profile-copy') return 'profile-copy';
    
    return name;
}

// Main conversion function
function convertFiles() {
    const sourceDir = 'fte-ctrl-html';
    const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.html'));
    
    console.log(`Found ${files.length} HTML files to convert`);
    
    files.forEach(file => {
        try {
            const sourcePath = path.join(sourceDir, file);
            const targetDir = getTargetDirectory(file);
            const ejsFileName = getEjsFileName(file);
            const targetPath = path.join(targetDir, `${ejsFileName}.ejs`);
            
            // Create target directory if it doesn't exist
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            // Read HTML content
            const htmlContent = fs.readFileSync(sourcePath, 'utf8');
            
            // Convert to EJS
            const ejsContent = convertHtmlToEjs(htmlContent, file);
            
            // Write EJS file
            fs.writeFileSync(targetPath, ejsContent);
            
            console.log(`✓ Converted ${file} -> ${targetPath}`);
        } catch (error) {
            console.error(`✗ Error converting ${file}:`, error.message);
        }
    });
    
    console.log('\nConversion completed!');
}

// Run the conversion
convertFiles(); 