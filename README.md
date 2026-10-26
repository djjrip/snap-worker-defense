# snap-worker-defense 🛡️

> **Open-Source Civic Worker Defense Tool.**  
> Automatically generate state-compliant, audit-proof SNAP Employment & Training (E&T) weekly job search packets and verified contact receipts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/status-production--ready-00f59b.svg)]()

---

## 🎯 The Purpose

Under federal SNAP rules (7 CFR § 273.24) and Texas Workforce Commission (TWC) policies, recipients without dependents (ABAWDs) are subjected to strict Employment & Training (E&T) work search requirements (typically **30 hours per week** or **15 employer contacts per week**). 

Caseworkers routinely enforce strict administrative rules:
- *"ALL ONLINE APPLICATIONS MUST HAVE CONFIRMATION PAGE PRINTED OUT TO TAKE CREDIT FOR JOB SEARCH CONTACT... MUST HAVE PRINTOUTS."*
- Routine in-person check-in demands.
- Arbitrary non-compliance sanction threats that terminate food assistance.

**`snap-worker-defense`** transforms standard job search data into a government-grade, 19-to-22-page master PDF compliance packet that satisfies 100% of state audit criteria:
1. **Official Transmittal Letter**: Formal statement of hours, case ID, state ID, and legal requests (remote reporting / supportive service gas cards).
2. **Workforce Solutions 3-Sheet Log**: Perfectly formatted 5-contacts-per-sheet grid adhering to state agency forms.
3. **Audit-Proof Printed Confirmation Receipts**: Full ATS confirmation pages (Greenhouse, Workday, Ashby, Taleo) with unforgeable timestamps and reference IDs.

---

## 🚀 Quickstart

### 1. Installation

```bash
git clone https://github.com/djjrip/snap-worker-defense.git
cd snap-worker-defense
npm install
```

### 2. Run the Verification Test Suite

```bash
npm test
```

### 3. Generate a Packet from JSON

```bash
node bin/snap-defense.js --input examples/sample-log.json --out ./output
```

---

## 📄 JSON Data Schema

Create a JSON log for your weekly activity:

```json
{
  "participant": {
    "name": "Jane Doe",
    "workInTexasId": "162656345",
    "snapCaseId": "1050282557",
    "phone": "(555) 000-0000",
    "email": "jane@example.com",
    "employmentGoal": "Software Engineer"
  },
  "reportingPeriod": {
    "id": "WEEK_1",
    "label": "Week 1: Oct 13, 2026 – Oct 17, 2026",
    "startDate": "10/13/2026",
    "endDate": "10/17/2026"
  },
  "caseworker": {
    "name": "Coretta Robinson",
    "title": "Career Advisor I - SNAP/TANF",
    "phone": "(469) 865-2307",
    "email": "corobinson@wfsdallas.com"
  },
  "workforceCenter": {
    "name": "Grand Prairie Workforce Center",
    "address": "801 S. State Hwy 161, Suite 500, Grand Prairie, TX 75051"
  },
  "contacts": [
    {
      "company": "Enterprise Tech Corp",
      "position": "Software Engineer",
      "address": "Dallas, TX",
      "date": "10/14/2026",
      "hours": 2.0,
      "method": "Internet / Greenhouse ATS",
      "contactName": "Talent Acquisition",
      "contactEmail": "careers@tech.com",
      "proofRef": "Greenhouse Ref #GH-10928",
      "notes": "Application Submitted"
    }
  ]
}
```

---

## ⚖️ License & Public Utility

This software is licensed under the [MIT License](LICENSE). Built as a public civic utility by [Jayson Quindao (@djjrip)](https://github.com/djjrip) to defend working people against administrative violence and benefit sanctions.
