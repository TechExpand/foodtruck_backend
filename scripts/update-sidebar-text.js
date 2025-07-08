const fs = require('fs');
const path = require('path');

// Function to update sidebar text in EJS files
function updateSidebarText() {
    const viewsDir = path.join(__dirname, '../views');
    const files = fs.readdirSync(viewsDir).filter(file => file.endsWith('.ejs'));
    
    let updatedFiles = 0;
    
    files.forEach(file => {
        const filePath = path.join(viewsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        // Update "FTE CTRL" to "ctrl" with blue color
        if (content.includes('FTE CTRL')) {
            content = content.replace(
                /<h5 class="mb-0">FTE CTRL<\/h5>/g,
                '<h5 class="mb-0" style="color: #008cff;">ctrl</h5>'
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
    console.log('Changed "FTE CTRL" to "ctrl" with blue color (#008cff)');
}

// Run the update
updateSidebarText(); 