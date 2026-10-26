const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { generatePacket, generateFairHearingDemand } = require('../src/index');

async function runTests() {
  console.log('Running snap-worker-defense comprehensive test suite...');
  const tmpOut = path.join(__dirname, '../tmp-test-out');
  if (!fs.existsSync(tmpOut)) {
    fs.mkdirSync(tmpOut, { recursive: true });
  }

  // Test 1: Full Compliance Packet
  const sampleDataPath = path.join(__dirname, '../examples/sample-log.json');
  const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
  const packetRes = await generatePacket(sampleData, tmpOut);

  assert(fs.existsSync(packetRes.htmlPath), 'Packet HTML must exist');
  assert(fs.existsSync(packetRes.pdfPath), 'Packet PDF must exist');
  const packetSize = fs.statSync(packetRes.pdfPath).size;
  assert(packetSize > 50000, `Packet PDF size must be >50KB, got: ${packetSize}`);
  console.log(`[PASS] Test 1: Full Compliance Packet generated (${packetSize} bytes).`);

  // Test 2: Fair Hearing & Aid-Paid-Pending Legal Demand
  const hearingData = {
    participant: sampleData.participant,
    caseNumber: sampleData.participant.snapCaseId,
    workforceCenter: sampleData.workforceCenter,
    caseworker: sampleData.caseworker,
    disputeReason: "Agency caseworker failed to issue authorized transportation assistance gas card."
  };
  const hearingRes = await generateFairHearingDemand(hearingData, tmpOut);

  assert(fs.existsSync(hearingRes.htmlPath), 'Hearing HTML must exist');
  assert(fs.existsSync(hearingRes.pdfPath), 'Hearing PDF must exist');
  const hearingHtml = fs.readFileSync(hearingRes.htmlPath, 'utf8');
  assert(hearingHtml.includes('AID PAID PENDING'), 'Hearing must cite Aid Paid Pending');
  assert(hearingHtml.includes('7 CFR § 273.15'), 'Hearing must cite federal regulation');
  const hearingSize = fs.statSync(hearingRes.pdfPath).size;
  assert(hearingSize > 10000, `Hearing PDF size must be >10KB, got: ${hearingSize}`);
  console.log(`[PASS] Test 2: Fair Hearing Legal Injunction generated (${hearingSize} bytes).`);

  // Cleanup
  fs.unlinkSync(packetRes.htmlPath);
  fs.unlinkSync(packetRes.pdfPath);
  fs.unlinkSync(hearingRes.htmlPath);
  fs.unlinkSync(hearingRes.pdfPath);
  fs.rmdirSync(tmpOut);
  console.log('[SUCCESS] All legal defense modules verified. Zero errors.');
}

runTests().catch((err) => {
  console.error('[FAIL] Test suite failed:', err);
  process.exit(1);
});
