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
        
        // desktop responsive classes
        content = content.replace(/md:text-3xl/g, 'md:text-xl');
        content = content.replace(/md:text-2xl/g, 'md:text-lg');
        content = content.replace(/md:text-xl/g, 'md:text-base');
        content = content.replace(/md:text-lg/g, 'md:text-base');
        content = content.replace(/md:text-base/g, 'md:text-sm');
        
        // standard static classes
        content = content.replace(/text-3xl(?! md:)/g, 'text-xl');
        content = content.replace(/text-2xl(?! md:)/g, 'text-lg');
        content = content.replace(/text-xl(?! md:)/g, 'text-base');
        content = content.replace(/text-lg(?! md:)/g, 'text-sm');
        
        // ensure no double 'md:md:'
        content = content.replace(/md:md:/g, 'md:');

        fs.writeFileSync(f, content);
        console.log('Updated:', f);
    } catch(err) {
        console.error('Error on', f, err);
    }
}
console.log('Desktop font replacements applied.');
