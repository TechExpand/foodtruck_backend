const fs = require('fs');
const path = require('path');

// Function to update logo references in EJS files
function updateLogos() {
    const viewsDir = path.join(__dirname, '../views');
    const files = fs.readdirSync(viewsDir).filter(file => file.endsWith('.ejs'));
    
    let updatedFiles = 0;
    
    files.forEach(file => {
        const filePath = path.join(viewsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        // Update sidebar logo from logo-icon.png to top-logo.png
        if (content.includes('/images/logo-icon.png')) {
            content = content.replace(/\/images\/logo-icon\.png/g, '/images/top-logo.png');
            hasChanges = true;
        }
        
        // Update favicon to use truckmarkerBlue.png
        if (content.includes('/images/favicon-32x32.png')) {
            content = content.replace(/\/images\/favicon-32x32\.png/g, '/images/truckmarkerBlue.png');
            hasChanges = true;
        }
        
        // Update favicon link tags
        if (content.includes('favicon-32x32.png')) {
            content = content.replace(/favicon-32x32\.png/g, 'truckmarkerBlue.png');
            hasChanges = true;
        }
        
        if (hasChanges) {
            fs.writeFileSync(filePath, content, 'utf8');
            updatedFiles++;
            console.log(`Updated: ${file}`);
        }
    });
    
    console.log(`\n✅ Updated ${updatedFiles} files`);
    console.log('📝 Changes made:');
    console.log('   - Sidebar logos changed from logo-icon.png to top-logo.png');
    console.log('   - Favicon changed to truckmarkerBlue.png');
}

// Run the update
updateLogos(); 