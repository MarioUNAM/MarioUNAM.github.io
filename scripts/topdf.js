// Genera los PDF del CV (EN y ES) desde cv.html / cv_es.html con Chromium (tamaño carta).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [src, out] of [['cv.html', 'Mario_Huarte_CV.pdf'], ['cv_es.html', 'Mario_Huarte_CV_ES.pdf']]) {
    const p = await b.newPage();
    await p.goto('file://' + process.cwd() + '/' + src, { waitUntil: 'load' });
    await p.pdf({ path: out, format: 'Letter', printBackground: true, preferCSSPageSize: true });
    console.log('pdf ok', out);
  }
  await b.close();
})();
