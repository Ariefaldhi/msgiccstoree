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

const dirsToScan = ['app/admin'];

dirsToScan.forEach(dir => {
    const files = walk(dir);
    for (const f of files) {
        try {
            let content = fs.readFileSync(f, 'utf8');
            let lines = content.split('\n');
            let modified = false;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('<th ') || lines[i].includes('<td ')) {
                    let oldLine = lines[i];
                    lines[i] = lines[i].replace(/\bp-6\b/g, 'p-3')
                                       .replace(/\bpx-6\b/g, 'px-2')
                                       .replace(/\bpy-4\b/g, 'py-2')
                                       .replace(/\bp-4\b/g, 'p-2')
                                       .replace(/\bpx-4\b/g, 'px-2')
                                       .replace(/\bpy-3\b/g, 'py-1');
                    if (oldLine !== lines[i]) {
                        modified = true;
                    }
                }
            }

            if (modified) {
                fs.writeFileSync(f, lines.join('\n'));
                console.log('Compacted table in:', f);
            }
        } catch(err) {
            console.error('Error on', f, err);
        }
    }
});
console.log('Table compacting finished.');
