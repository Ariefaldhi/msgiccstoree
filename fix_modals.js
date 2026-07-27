const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.tsx')) results.push(file);
    });
    return results;
}

walk('app/admin').forEach(f => {
    let lines = fs.readFileSync(f, 'utf8').split('\n');
    let modified = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('z-[10000]') || lines[i].includes('fixed inset-0')) {
            if (lines[i+1] && lines[i+1].includes('className="bg-white')) {
                let classes = lines[i+1];
                
                // Add max-h-[85vh] if missing, or update if exists
                if (!classes.includes('max-h-[')) {
                    classes = classes.replace(' shadow-2xl', ' shadow-2xl max-h-[85vh]');
                } else {
                    classes = classes.replace(/max-h-\[[^\]]+\]/g, 'max-h-[85vh]');
                }
                
                // Add overflow-y-auto if missing
                if (!classes.includes('overflow-y-auto')) {
                     classes = classes.replace(' max-h-[85vh]', ' max-h-[85vh] overflow-y-auto');
                }

                // Clean up any weird multiple paddings and set to a safe padding (p-5)
                classes = classes.replace(/ p-\d+ /g, ' p-5 ');
                classes = classes.replace(/ md:p-\d+ /g, ' md:p-6 ');
                classes = classes.replace(/ p-\d+"/g, ' p-5"');
                
                // Ensure it has w-full
                if (!classes.includes('w-full')) {
                    classes = classes.replace(' max-w-', ' w-full max-w-');
                }

                if (lines[i+1] !== classes) {
                    lines[i+1] = classes;
                    modified = true;
                }
            }
        }
    }
    if (modified) {
        fs.writeFileSync(f, lines.join('\n'));
        console.log('Fixed modal in ' + f);
    }
});
console.log('Modal fix complete.');
