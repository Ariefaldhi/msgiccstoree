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
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Decrease header font sizes on mobile
    content = content.replace(/text-3xl/g, 'text-2xl md:text-3xl');
    content = content.replace(/text-2xl(?! md:)/g, 'text-xl md:text-2xl');
    content = content.replace(/text-xl(?! md:)/g, 'text-lg md:text-xl');
    content = content.replace(/text-lg(?! md:)/g, 'text-base md:text-lg');
    
    // Fix any double 'md:md:' if they occurred accidentally
    content = content.replace(/md:md:/g, 'md:');

    // Also let's tighten the padding on mobile view cards if any
    content = content.replace(/p-5(?! md:)/g, 'p-4 md:p-5');
    content = content.replace(/p-6(?! md:)/g, 'p-4 md:p-6');
    content = content.replace(/p-8(?! md:)/g, 'p-5 md:p-8');

    fs.writeFileSync(f, content);
});
console.log('Font replacements applied.');
