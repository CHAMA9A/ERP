const bcrypt = require('./backend/node_modules/bcryptjs');

async function main() {
  const hash = await bcrypt.hash('Tazir2019@:-', 10);
  console.log('HASH:', hash);
}
main();
