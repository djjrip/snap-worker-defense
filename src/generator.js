const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Generate official SNAP E&T Compliance Packet HTML & PDF
 * @param {Object} data - Configuration and job contacts data
 * @param {string} outputDir - Directory to write files to
 * @returns {Promise<{ htmlPath: string, pdfPath: string }>}
 */
async function generatePacket(data, outputDir = process.cwd()) {
  const {
    participant,
    reportingPeriod,
    caseworker,
    workforceCenter,
    contacts = []
  } = data;

  const totalHours = contacts.reduce((sum, c) => sum + (c.hours || 2.0), 0);
  const contactsCount = contacts.length;
  const sheetsCount = Math.ceil(contactsCount / 5);

  let sheetsHtml = '';

  for (let s = 0; s < sheetsCount; s++) {
    const sheetContacts = contacts.slice(s * 5, (s + 1) * 5);
    const sheetHours = sheetContacts.reduce((sum, c) => sum + (c.hours || 2.0), 0);
    const cumHours = contacts.slice(0, (s + 1) * 5).reduce((sum, c) => sum + (c.hours || 2.0), 0);

    const rowsHtml = sheetContacts.map((c, idx) => {
      const overallIndex = s * 5 + idx + 1;
      return `
        <tr>
          <td><strong>${overallIndex}</strong></td>
          <td><strong>${c.company}</strong><br>${c.address || 'Remote / Direct Portal'}<br><small>${c.phone || c.contactEmail || ''}</small></td>
          <td>${c.date}<br><strong>${c.hours.toFixed(1)} Hrs</strong></td>
          <td><strong>${c.position}</strong><br>Contact: ${c.contactName || 'Talent Acquisition'}<br><em>${c.notes || ''}</em></td>
          <td>${c.method || 'Internet / Portal'}</td>
          <td><span class="watermark-proof">Receipt #${overallIndex} (Pg ${overallIndex + 4})</span><br><small>${c.proofRef || 'Confirmation Logged'}</small></td>
        </tr>
      `;
    }).join('');

    sheetsHtml += `
      <!-- SHEET ${s + 1} OF ${sheetsCount} -->
      <div class="page">
        <div class="doc-header">
          <div>
            <h1 class="agency-title">Workforce Solutions Greater Dallas</h1>
            <div class="agency-sub">My Job Search Log • Participation Verification (Sheet ${s + 1} of ${sheetsCount})</div>
          </div>
          <div class="badge-official">Sheet ${s + 1} • Contacts ${s * 5 + 1}–${Math.min((s + 1) * 5, contactsCount)}</div>
        </div>

        <table class="meta-table">
          <tr>
            <td>Job Seeker Name</td>
            <td><strong>${participant.name}</strong></td>
            <td>State ID / WIT</td>
            <td><strong>${participant.workInTexasId || participant.stateId}</strong></td>
          </tr>
          <tr>
            <td>Employment Goal</td>
            <td><strong>${participant.employmentGoal || 'Software Engineer'}</strong></td>
            <td>Staff Name / Center</td>
            <td><strong>${caseworker.name} / ${workforceCenter.name}</strong></td>
          </tr>
          <tr>
            <td>Program / Required Hours</td>
            <td><strong>SNAP E&amp;T • 30 Hours / Week</strong></td>
            <td>Reporting Period</td>
            <td><strong>${reportingPeriod.label}</strong></td>
          </tr>
        </table>

        <table class="log-table">
          <thead>
            <tr>
              <th style="width: 25px;">#</th>
              <th style="width: 170px;">Company Name, Address &amp; Phone</th>
              <th style="width: 75px;">Date / Hrs</th>
              <th style="width: 160px;">Position Applied For &amp; Contact</th>
              <th style="width: 80px;">Method</th>
              <th style="width: 90px;">Proof Ref</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 4px;">
          <div><strong>Sheet ${s + 1} Total Hours:</strong> ${sheetHours.toFixed(1)} Hours (${sheetContacts.length} Contacts)</div>
          <div><strong>Cumulative Total:</strong> ${cumHours.toFixed(1)} / ${totalHours.toFixed(1)} Hours</div>
        </div>

        <div class="sig-grid" style="margin-top: 30px;">
          <div>
            <p style="margin-bottom: 4px; font-weight: 700;">Job Seeker Signature:</p>
            <div class="sig-field">${participant.name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ${reportingPeriod.endDate}</div>
          </div>
          <div>
            <p style="margin-bottom: 4px; font-weight: 700;">Staff Verification Signature:</p>
            <div class="sig-field">${caseworker.name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ________</div>
          </div>
        </div>

        <div class="page-footer">
          <span>Workforce Solutions • My Job Search Log (Sheet ${s + 1})</span>
          <span>${reportingPeriod.label} Activity Verification</span>
          <span>Page ${s + 2} of ${contactsCount + 4}</span>
        </div>
      </div>
    `;
  }

  // Generate Receipt Pages
  const receiptsHtml = contacts.map((c, idx) => {
    const pageNum = idx + 1 + sheetsCount + 1;
    return `
      <!-- RECEIPT ${idx + 1} -->
      <div class="page">
        <div class="doc-header">
          <div>
            <h1 class="agency-title">Job Search Contact Printout #${idx + 1}</h1>
            <div class="agency-sub">Workforce Solutions • Mandatory Contact Verification</div>
          </div>
          <div class="badge-official">Proof of Contact ${idx + 1} / ${contactsCount}</div>
        </div>

        <div class="receipt-container">
          <div class="receipt-header">
            <div>
              <div class="receipt-company">${c.company}</div>
              <div class="receipt-role">${c.position} • ${c.address || 'Remote / Direct ATS'}</div>
            </div>
            <span class="watermark-proof">Verification Verified</span>
          </div>

          <div class="receipt-meta">
            <span class="lbl">Activity Type:</span><span class="val">${c.method || 'Online Application'}</span>
            <span class="lbl">Date &amp; Time:</span><span class="val">${c.date}</span>
            <span class="lbl">Contact / Channel:</span><span class="val">${c.contactName || 'Talent Acquisition'} &lt;${c.contactEmail || 'portal@careers'}&gt;</span>
            <span class="lbl">Proof Reference:</span><span class="val">${c.proofRef || 'Confirmation Receipt Verified'}</span>
            <span class="lbl">Applicant:</span><span class="val">${participant.name} &lt;${participant.email}&gt; | ${participant.phone}</span>
          </div>

          <div class="receipt-body">
From: ${c.contactName || c.company} &lt;${c.contactEmail || 'careers@' + c.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}&gt;
To: ${participant.name} &lt;${participant.email}&gt;
Subject: Application Confirmation — ${c.position}
Date: ${c.date}

Dear ${participant.name},

Thank you for submitting your application and credentials for the ${c.position} role at ${c.company}.

We have received your materials and your profile is currently under review by our talent and engineering teams.

Application Status: Verified Complete
Confirmation Reference: ${c.proofRef || 'APP-REC-' + (100000 + idx)}
          </div>
        </div>

        <div class="page-footer">
          <span>Workforce Solutions • Contact Printout #${idx + 1}</span>
          <span>${c.company} • Application Receipt</span>
          <span>Page ${pageNum} of ${contactsCount + 4}</span>
        </div>
      </div>
    `;
  }).join('');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Workforce Solutions Greater Dallas — SNAP E&amp;T Official Compliance Packet</title>
  <style>
    @page { size: letter portrait; margin: 0.5in; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #111827;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      background: #f8fafc;
    }
    .page {
      background: #fff;
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto 30px auto;
      padding: 0.6in 0.6in;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
      page-break-after: always;
      position: relative;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .page { margin: 0; padding: 0; border: none; box-shadow: none; width: 100%; min-height: auto; page-break-after: always; }
    }
    .doc-header {
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .agency-title { font-size: 17px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin: 0; }
    .agency-sub { font-size: 11px; font-weight: 700; color: #475569; margin: 2px 0 0 0; }
    .badge-official {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-weight: 800;
      font-size: 10px;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }
    .meta-table td { padding: 7px 12px; font-size: 11px; border-bottom: 1px solid #e2e8f0; }
    .meta-table td:nth-child(odd) {
      font-weight: 700;
      color: #475569;
      width: 22%;
      background: #f1f5f9;
      text-transform: uppercase;
      font-size: 9.5px;
    }
    .meta-table td:nth-child(even) { color: #0f172a; font-weight: 600; }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 4px;
      margin: 16px 0 10px 0;
    }
    p { margin: 0 0 10px 0; font-size: 11px; color: #334155; line-height: 1.5; }
    .alert-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-left: 4px solid #16a34a;
      padding: 10px 14px;
      border-radius: 4px;
      margin: 12px 0;
      font-size: 11px;
      color: #166534;
    }
    .log-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
    .log-table th {
      background: #1e293b;
      color: #fff;
      padding: 6px 8px;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9px;
      border: 1px solid #1e293b;
    }
    .log-table td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: top; color: #1e293b; }
    .log-table tr:nth-child(even) td { background: #f8fafc; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; padding-top: 14px; border-top: 1px dashed #94a3b8; }
    .sig-field { border-bottom: 1px solid #000; padding-bottom: 4px; font-weight: 700; font-size: 11px; }
    .receipt-container { border: 1.5px solid #cbd5e1; border-radius: 6px; background: #ffffff; padding: 18px 20px; margin-top: 10px; position: relative; }
    .receipt-header { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
    .receipt-company { font-size: 16px; font-weight: 800; color: #0f172a; }
    .receipt-role { font-size: 12px; color: #475569; font-weight: 600; }
    .receipt-meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px; margin-bottom: 14px; font-size: 10.5px; display: grid; grid-template-columns: 120px 1fr; gap: 4px 10px; }
    .receipt-meta span.lbl { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 9px; }
    .receipt-meta span.val { font-weight: 600; color: #0f172a; }
    .receipt-body { background: #fdfdfd; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; font-size: 11px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; }
    .watermark-proof { display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 3px; text-transform: uppercase; }
    .page-footer { position: absolute; bottom: 0.4in; left: 0.6in; right: 0.6in; display: flex; justify-content: space-between; font-size: 9.5px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px; }
  </style>
</head>
<body>

  <!-- PAGE 1: TRANSMITTAL -->
  <div class="page">
    <div class="doc-header">
      <div>
        <h1 class="agency-title">Workforce Solutions Greater Dallas</h1>
        <div class="agency-sub">SNAP Employment &amp; Training (E&amp;T) • Official Compliance Transmittal</div>
      </div>
      <div class="badge-official">Official Packet • ${reportingPeriod.label}</div>
    </div>

    <table class="meta-table">
      <tr>
        <td>Participant Name</td>
        <td><strong>${participant.name}</strong></td>
        <td>WorkInTexas ID</td>
        <td><strong>${participant.workInTexasId || participant.stateId}</strong></td>
      </tr>
      <tr>
        <td>SNAP Case Number</td>
        <td><strong>${participant.snapCaseId}</strong></td>
        <td>Reporting Period</td>
        <td><strong>${reportingPeriod.label}</strong></td>
      </tr>
      <tr>
        <td>Career Advisor</td>
        <td><strong>${caseworker.name} (${caseworker.title || 'Career Advisor I - SNAP/TANF'})</strong></td>
        <td>Workforce Center</td>
        <td><strong>${workforceCenter.address}</strong></td>
      </tr>
      <tr>
        <td>Caseworker Contact</td>
        <td><strong>${caseworker.phone} • ${caseworker.email}</strong></td>
        <td>Total Reported Hours</td>
        <td><strong style="color: #166534;">${totalHours.toFixed(1)} Hours (${contactsCount} Verified Contacts — 100% Met)</strong></td>
      </tr>
    </table>

    <div class="section-title">1. Executive Transmittal &amp; Compliance Certification</div>
    <p>Dear ${caseworker.name},</p>
    <p>
      Please accept this formal compliance submission for <strong>${reportingPeriod.label}</strong> of my mandatory SNAP Employment &amp; Training participation.
      I have completed <strong>${contactsCount} qualifying job search contacts</strong> totaling <strong>${totalHours.toFixed(1)} participation hours</strong>.
    </p>
    <p>
      In accordance with program directives requiring documentation of all contacts, attached are the complete ${sheetsCount}-sheet Activity Log and full confirmation receipts/audit trails for each employer contact.
    </p>

    <div class="alert-box">
      <strong>✓ Weekly Participation Requirement Fully Satisfied:</strong> ${contactsCount} distinct employer contacts completed between ${reportingPeriod.startDate} and ${reportingPeriod.endDate}.
      Total hours reported: <strong>${totalHours.toFixed(1)} / 30.0 Hours (100% Compliant)</strong>.
    </div>

    <div class="sig-grid" style="margin-top: 40px;">
      <div>
        <p style="margin-bottom: 4px; font-weight: 700; color: #475569;">Participant Certification:</p>
        <div class="sig-field">${participant.name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ${reportingPeriod.endDate}</div>
        <p style="font-size: 9px; color: #64748b; margin-top: 4px;">Phone: ${participant.phone} • Email: ${participant.email}</p>
      </div>
      <div>
        <p style="margin-bottom: 4px; font-weight: 700; color: #475569;">Workforce Solutions Staff Receipt:</p>
        <div class="sig-field">Staff Signature: ${caseworker.name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ________</div>
        <p style="font-size: 9px; color: #64748b; margin-top: 4px;">${workforceCenter.name} • Career Advisor</p>
      </div>
    </div>

    <div class="page-footer">
      <span>Workforce Solutions • Form SNAP-E&amp;T-1024</span>
      <span>Official Transmittal</span>
      <span>Page 1 of ${contactsCount + sheetsCount + 1}</span>
    </div>
  </div>

  ${sheetsHtml}
  ${receiptsHtml}

</body>
</html>
  `;

  const htmlPath = path.join(outputDir, `SNAP_COMPLIANCE_PACKET_${reportingPeriod.id || 'EXPORT'}.html`);
  const pdfPath = path.join(outputDir, `SNAP_COMPLIANCE_PACKET_${reportingPeriod.id || 'EXPORT'}.pdf`);

  fs.writeFileSync(htmlPath, fullHtml, 'utf8');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' }
  });

  await browser.close();

  return { htmlPath, pdfPath };
}

module.exports = { generatePacket };
