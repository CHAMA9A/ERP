const fs = require('fs');
const base = 'C:/Users/sav/Desktop/work/ERP/rizat-modern-erp-interface-main/V1/';
['start-frontend.js', 'run.js'].forEach(f => {
  try { fs.unlinkSync(base + f); console.log('deleted ' + f); }
  catch(e) { console.log('skip: ' + f + ' - ' + e.message); }
});
