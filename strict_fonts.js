const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const dirsToScan = ['app/admin', 'components/admin'];

dirsToScan.forEach(dir => {
    const files = walk(dir);
    for (const f of files) {
        try {
            let content = fs.readFileSync(f, 'utf8');
            let original = content;
            
            content = content.replace(/\btext-3xl\b/g, 'text-base');
            content = content.replace(/\btext-2xl\b/g, 'text-base');
            content = content.replace(/\btext-xl\b/g, 'text-sm');
            content = content.replace(/\btext-lg\b/g, 'text-sm');

            if (original !== content) {
                fs.writeFileSync(f, content);
                console.log('Fixed:', f);
            }
        } catch(err) {
            console.error('Error on', f, err);
        }
    }
});
console.log('Strict font reduction applied to admin and components/admin.');
