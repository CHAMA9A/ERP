const { spawnSync } = require('child_process');

console.log('Cleaning npm cache...');
spawnSync('npm', ['cache', 'clean', '--force'], { shell: true, stdio: 'inherit' });
console.log('Done.');
