const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
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

const files = walk('app/admin');
for (const f of files) {
    try {
        let content = fs.readFileSync(f, 'utf8');
        
        // Remove all md:text- sizes so that desktop inherits the smaller base size
        content = content.replace(/\smd:text-3xl/g, '');
        content = content.replace(/\smd:text-2xl/g, '');
        content = content.replace(/\smd:text-xl/g, '');
        content = content.replace(/\smd:text-lg/g, '');
        content = content.replace(/\smd:text-base/g, '');
        content = content.replace(/\smd:text-sm/g, '');
        content = content.replace(/\smd:text-xs/g, '');

        fs.writeFileSync(f, content);
    } catch(err) {
        console.error('Error on', f, err);
    }
}
console.log('Stripped desktop specific fonts. Unified sizes applied.');
