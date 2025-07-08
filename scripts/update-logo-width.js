const fs = require('fs');
const path = require('path');

// Function to update logo width in EJS files
function updateLogoWidth() {
    const viewsDir = path.join(__dirname, '../views');
    const files = fs.readdirSync(viewsDir).filter(file => file.endsWith('.ejs'));
    
    let updatedFiles = 0;
    
    files.forEach(file => {
        const filePath = path.join(viewsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        // Update top-logo.png width to 120px
        if (content.includes('/images/top-logo.png')) {
            // Find img tags with top-logo.png and add or update width attribute
            content = content.replace(
                /<img([^>]*?)src="\/images\/top-logo\.png"([^>]*?)>/g,
                (match, beforeSrc, afterSrc) => {
                    // Check if width attribute already exists
                    if (beforeSrc.includes('width=') || afterSrc.includes('width=')) {
                        // Update existing width
                        return match.replace(/width="[^"]*"/g, 'width="120"');
                    } else {
                        // Add width attribute
                        return `<img${beforeSrc}src="/images/top-logo.png"${afterSrc} width="120">`;
                    }
                }
            );
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
    console.log('   - Set top-logo.png width to 120px in all sidebar logos');
}

// Run the update
updateLogoWidth(); 