---
title: "Mitsubishi CNC Fix Needs System-Number Proof"
subtitle: "A revised industrial advisory gives more operators a patch path, but remediation must be verified at the individual controller."
description: "Mitsubishi added fixed versions for legacy CNC controls, making exact system-number inventory and controlled update validation the priority."
date: 2026-08-27 21:08:16 +0400
layout: post
category: defense
tags: [industrial-security, vulnerability-management, cnc, asset-inventory]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-27-mitsubishi-cnc-fix-needs-system-number-proof.svg
image_alt: "Abstract CNC spindle rings behind a segmented protective barrier, with an illuminated repaired segment blocking incoming network signals"
key_points:
  - "Mitsubishi now lists fixed versions for the M700V, M70V and E70 CNC families."
  - "Affected status depends on the product family and the NCMAIN1 system number."
  - "Network restrictions remain necessary where a corrected release is unavailable."
sources:
  - title: "Denial of Service (DoS) Vulnerability in Mitsubishi Electric CNC Series"
    publisher: "Mitsubishi Electric · updated August 27, 2026"
    url: "https://www.mitsubishielectric.com/psirt/vulnerability/pdf/2025-022_en.pdf"
  - title: "FA Products Security Vulnerability Information"
    publisher: "Mitsubishi Electric · updated August 27, 2026"
    url: "https://www.mitsubishielectric.com/fa/about-us/security/vulnerability/index.html"
---

Mitsubishi Electric has expanded the remediation path for a denial-of-service vulnerability in several computer numerical control systems. Its August 27 update adds corrected versions for the M700V, M70V and E70 families and removes NC Trainer2 and NC Trainer2 plus from the affected-products list. For industrial defenders, the change turns an old advisory into a new inventory and maintenance task.

## What changed in the advisory

The underlying issue is CVE-2025-2399, which Mitsubishi first disclosed on March 10. The vendor describes an input-validation weakness that can lead to an out-of-bounds memory read and denial of service. A successful attack may force an affected CNC product into emergency shutdown, after which recovery requires a system reset. Mitsubishi assigns the issue a CVSS 3.1 base score of 5.9.

The August 27 revision is important because it changes which remediation outcomes are available. Mitsubishi now identifies LK or later as fixed for six products across the M700V/M70V/E70 family: M750VW, M730VW/M720VW, M750VS, M730VS/M720VS, M70V and E70. Earlier fixed branches remain BC or later for the M800V/M80V family and FN or later for the M800/M80/E80 family.

The C80 remains listed as affected in all versions, with no corrected version shown in the advisory. The update also removes the two NC Trainer software tools from the affected list. That removal should be reflected in inventories, but it should not be generalized to the physical CNC families that remain explicitly affected.

## Why family-level status is insufficient

The advisory does not support a single fleet-wide label such as “Mitsubishi CNC updated.” Affected and corrected states are expressed through product family, product name and the version suffix in a specific system number. Mitsubishi directs operators to read the NCMAIN1 system number from the Software Configuration screen under Diagnostics and Config.

That detail matters operationally. Similar-looking controllers can sit on different release branches, and a procurement record may identify the family without preserving the active system number. A reliable remediation record should therefore bind the machine or cell identifier to its exact product name, observed NCMAIN1 value, update target, maintenance owner and verification time.

Teams should also correct stale scope data. The removed trainer tools no longer belong in the vulnerable population described by this advisory; leaving them there wastes effort and weakens confidence in the rest of the campaign. Conversely, the absence of a fixed version for C80 means “all available patches applied” cannot be used as evidence that the exposure has been resolved.

## Treat availability as a production risk

This vulnerability affects availability, not confidentiality or integrity according to Mitsubishi’s CVSS vector. In a CNC environment, however, emergency shutdown and manual reset are production consequences. Prioritization should consider what the controller operates, whether a safe reset can be performed without creating downstream hazards, and when the next controlled maintenance window is available.

Before updating, operators should follow established change-control and safety procedures, consult their Mitsubishi representative for the applicable installation instructions, and preserve the current system-number evidence. Afterward, they should re-read NCMAIN1 and record the corrected value rather than treating a completed work order or transferred package as proof of activation.

The vendor does not report active exploitation in this advisory. Its update is a product-status change, not evidence of an incident or compromise. Defenders should keep that distinction intact while still treating loss of control availability as a meaningful operational risk.

## Keep the network boundary in place

Where a fixed version is unavailable or cannot yet be installed, Mitsubishi recommends preventing unauthorized access with firewalls or VPNs, keeping the products on a LAN, and blocking untrusted networks and hosts. It also recommends restricting physical access to the products and connected systems. IP filtering is available on the M800V/M80V and M800/M80/E80 families, according to the advisory.

Those measures should be verified as paths, not documented as intentions. Owners need evidence that only approved engineering and management hosts can reach each affected controller and that broader enterprise or remote-access routes cannot bypass the intended boundary. For C80 deployments in particular, compensating controls remain the primary available response described by the vendor.

The central lesson from this revision is precise: remediation status lives at the controller, not in the advisory inbox. The update is complete only when every in-scope asset has an observed system number, a supported corrected release or a verified network boundary, and an accountable operational owner.
