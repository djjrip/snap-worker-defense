---
name: snap-worker-defense
description: Autonomous civic worker defense engine. Generates verified, state-compliant SNAP Employment & Training (E&T) weekly job search packets and statutory administrative fair hearing injunction filings citing 7 CFR § 273.15 and 1 TAC § 357.
---

# SNAP Worker Defense Skill

A production-grade CLI and programmatic engine designed for AI coding agents and human caseworkers to defend working-class public benefits against administrative sanction.

## When to Use

Use this skill whenever:
- A user needs to generate audit-proof SNAP E&T (Employment & Training) job search compliance packets.
- A user receives an administrative sanction, termination, or reduction notice from a state agency (e.g., Texas HHSC, Workforce Solutions, CalFresh, NY SNAP) and needs an immediate Emergency Fair Hearing request with Aid-Paid-Pending continuation.
- An agent needs to parse raw employer application logs and produce verified, paginated PDF compliance packets with official state declarations.

## Commands

### 1. Generate Weekly Compliance Packet

```bash
node bin/snap-defense.js generate --log <path-to-activity-log.json> --out <output-packet.pdf>
```

### 2. Generate Emergency Fair Hearing Injunction

```bash
node bin/snap-defense.js hearing --case <case-details.json> --out <injunction.pdf>
```

## Programmatic API

```javascript
const { generateSnapPacket } = require('snap-worker-defense/src/generator');
const { generateFairHearingInjunction } = require('snap-worker-defense/src/fair-hearing');

// Compile full packet
await generateSnapPacket(logData, './official_packet.pdf');

// Compile administrative injunction citing 7 CFR § 273.15
await generateFairHearingInjunction(caseData, './hearing_request.pdf');
```

## Statutory Authorities

- **Federal Law**: 7 CFR § 273.15 (Fair Hearings & Continued Benefits / Aid-Paid-Pending)
- **Texas Administrative Code**: 1 TAC § 357 (Texas HHSC Fair Hearing rules)
- **Due Process**: *Goldberg v. Kelly*, 397 U.S. 254 (1970)
