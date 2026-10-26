/**
 * SNAP Fair Hearing & Aid-Paid-Pending Legal Demand Generator
 * Statutory Authority: 7 CFR § 273.15 & Texas Administrative Code (1 TAC § 357)
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Generate formal Fair Hearing & Aid-Paid-Pending legal packet
 * @param {Object} data - Case and participant details
 * @param {string} outputDir - Destination directory
 */
async function generateFairHearingDemand(data, outputDir = process.cwd()) {
  const {
    participant,
    caseNumber,
    workforceCenter,
    caseworker,
    disputeReason = "Improper imposition of work-search sanction or denial of transportation supportive services."
  } = data;

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Formal Demand for Fair Hearing &amp; Continued Benefits (Aid Paid Pending)</title>
  <style>
    @page { size: letter portrait; margin: 0.8in; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
    }
    .header { text-align: center; font-weight: bold; margin-bottom: 24px; }
    .header h2 { margin: 0; font-size: 14pt; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 11pt; }
    .meta-box { border: 1.5px solid #000; padding: 12px; margin-bottom: 24px; font-size: 11pt; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .statute-cite { background: #f4f4f4; border-left: 4px solid #000; padding: 8px 12px; margin: 16px 0; font-family: Arial, sans-serif; font-size: 10pt; }
    .section-title { font-weight: bold; text-decoration: underline; margin-top: 18px; margin-bottom: 6px; }
    .signature-area { margin-top: 40px; }
  </style>
</head>
<body>

  <div class="header">
    <h2>Texas Health and Human Services Commission (HHSC)</h2>
    <p>Appeals Division • Administrative Hearings Department</p>
    <p><strong>FORMAL DEMAND FOR FAIR HEARING &amp; STATUTORY AID PAID PENDING</strong></p>
  </div>

  <div class="meta-box">
    <div class="meta-row"><span><strong>APPELLANT:</strong> ${participant.name}</span><span><strong>DATE:</strong> ${today}</span></div>
    <div class="meta-row"><span><strong>SNAP CASE NUMBER:</strong> ${caseNumber}</span><span><strong>WORKINTEXAS ID:</strong> ${participant.workInTexasId}</span></div>
    <div class="meta-row"><span><strong>PRIMARY CONTACT:</strong> ${participant.phone}</span><span><strong>EMAIL:</strong> ${participant.email}</span></div>
    <div class="meta-row"><span><strong>LOCAL WORKFORCE CENTER:</strong> ${workforceCenter.name}</span><span><strong>STAFF:</strong> ${caseworker.name}</span></div>
  </div>

  <p><strong>TO:</strong> Texas Health and Human Services Commission Appeals Division &amp; Workforce Solutions Greater Dallas</p>

  <p>
    I, <strong>${participant.name}</strong>, hereby exercise my federal and state statutory right to formally request an immediate 
    <strong>Administrative Fair Hearing</strong> to appeal and challenge any adverse action, sanction determination, or denial of supportive services taken against my SNAP assistance.
  </p>

  <div class="statute-cite">
    <strong>MANDATORY STATUTORY NOTICE OF CONTINUED BENEFITS (AID PAID PENDING):</strong><br>
    Pursuant to <strong>7 CFR § 273.15(k)(1)</strong> and <strong>1 Texas Administrative Code § 357.11</strong>, if an appellant requests a fair hearing within the advance notice period, benefits <em>must be continued at the prior level</em> ("Aid Paid Pending") until the official hearing decision is issued by an Administrative Law Judge. Any reduction, suspension, or termination of my SNAP benefits prior to the conclusion of this hearing constitutes a violation of federal due process.
  </div>

  <div class="section-title">I. GROUNDS FOR APPEAL &amp; DISPUTE</div>
  <p>
    This appeal is requested on the following grounds:
  </p>
  <p>
    1. <em>Substantial Compliance:</em> Appellant has maintained contemporaneous, verifiable job search activity exceeding program guidelines (30.0 hours weekly and 15 documented employer contacts per reporting period).<br>
    2. <em>Administrative Defect &amp; Barrier:</em> Local agency officials have improperly restricted reporting methods and failed to disburse authorized WIOA transportation supportive services (physical gas card assistance) legally required to facilitate in-person workforce travel.<br>
    3. <em>Dispute Statement:</em> ${disputeReason}
  </p>

  <div class="section-title">II. DEMAND FOR RELIEF</div>
  <p>
    Appellant respectfully demands:
  </p>
  <ul>
    <li>Immediate scheduling of an Administrative Fair Hearing before an impartial HHSC Hearing Officer.</li>
    <li>Immediate written confirmation that full monthly SNAP allotment ($306.00) remains active without penalty under Aid Paid Pending protections.</li>
    <li>Immediate disbursement of approved transportation supportive services (gas card assistance) to offset mandated workforce travel.</li>
    <li>Full disclosure of all agency notes, casework logs, and communication records regarding Case #${caseNumber}.</li>
  </ul>

  <div class="signature-area">
    <p>Respectfully submitted,</p>
    <br>
    <p>___________________________________________<br>
    <strong>${participant.name}</strong>, Appellant<br>
    Grand Prairie, Texas • Phone: ${participant.phone}
    </p>
  </div>

</body>
</html>`;

  const htmlPath = path.join(outputDir, `SNAP_FAIR_HEARING_DEMAND_${caseNumber}.html`);
  const pdfPath = path.join(outputDir, `SNAP_FAIR_HEARING_DEMAND_${caseNumber}.pdf`);

  fs.writeFileSync(htmlPath, html, 'utf8');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.8in', right: '0.8in', bottom: '0.8in', left: '0.8in' }
  });

  await browser.close();

  return { htmlPath, pdfPath };
}

module.exports = { generateFairHearingDemand };
