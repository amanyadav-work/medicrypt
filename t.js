const path = require('path');
const fs = require('fs');

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.min.js');

fs.copyFileSync(pdfWorkerPath, path.join(__dirname, 'public', 'pdf.worker.js'));