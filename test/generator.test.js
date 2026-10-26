const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { generatePacket } = require('../src/generator');

async function runTest() {
  console.log('Running snap-worker-defense unit tests...');
  const sampleDataPath = path.join(__dirname, '../examples/sample-log.json');
  const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

  const tmpOut = path.join(__dirname, '../tmp-test-out');
  if (!fs.existsSync(tmpOut)) {
    fs.mkdirSync(tmpOut, { recursive: true });
  }

  const { htmlPath, pdfPath } = await generatePacket(sampleData, tmpOut);

  assert(fs.existsSync(htmlPath), 'HTML output must exist');
  assert(fs.existsSync(pdfPath), 'PDF output must exist');

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  assert(htmlContent.includes('Workforce Solutions Greater Dallas'), 'HTML must contain agency title');
  assert(htmlContent.includes('Jayson Quindao'), 'HTML must contain participant name');
  assert(htmlContent.includes('Cockroach Labs'), 'HTML must contain employer contact');

  const pdfStats = fs.statSync(pdfPath);
  assert(pdfStats.size > 50000, `PDF size must be substantial (>50KB), got: ${pdfStats.size}`);

  console.log(`[PASS] HTML and PDF generation verified. PDF Size: ${pdfStats.size} bytes.`);

  // Cleanup
  fs.unlinkSync(htmlPath);
  fs.unlinkSync(pdfPath);
  fs.rmdirSync(tmpOut);
  console.log('[PASS] Test cleanup successful. All 5 assertions passed.');
}

runTest().catch((err) => {
  console.error('[FAIL] Test failed:', err);
  process.exit(1);
});
