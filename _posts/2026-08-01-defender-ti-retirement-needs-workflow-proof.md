---
title: "Defender TI Retirement Needs Workflow-Level Proof"
subtitle: "Microsoft’s standalone threat-intelligence service has retired, making analyst access and investigation continuity the controls to verify."
description: "Microsoft retired standalone Defender TI, requiring teams to verify portal access, shared projects, enrichment, and downstream security workflows."
date: 2026-08-01 13:09:51 +0400
layout: post
category: defense
tags: [threat-intelligence, security-operations, microsoft-defender, resilience]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-01-defender-ti-retirement-needs-workflow-proof.svg
image_alt: "Abstract intelligence nodes flowing through a bright access boundary into a unified protected analysis field"
key_points:
  - "Microsoft retired the standalone Defender Threat Intelligence SKU on August 1."
  - "Eligible Defender and Sentinel customers receive the capabilities in the Defender portal without a separate migration."
  - "Security teams should verify access, projects, enrichment, and downstream workflows with real analyst tasks."
sources:
  - title: "July 2026 announcements"
    publisher: "Microsoft Learn · July 23, 2026"
    url: "https://learn.microsoft.com/en-us/partner-center/announcements/2026-july"
  - title: "Quickstart: Learn how to access Microsoft Defender Threat Intelligence and make customizations"
    publisher: "Microsoft Learn · updated July 16, 2026"
    url: "https://learn.microsoft.com/en-us/defender/threat-intelligence/learn-how-to-access-microsoft-defender-threat-intelligence-and-make-customizations-in-your-portal"
  - title: "Using Projects in Microsoft Defender Threat Intelligence (Defender TI)"
    publisher: "Microsoft Learn · updated September 12, 2025"
    url: "https://learn.microsoft.com/en-us/defender/threat-intelligence/using-projects"
---

Microsoft Defender Threat Intelligence reached its standalone retirement date on August 1. Microsoft says the capabilities are already available through the Microsoft Defender portal to customers with Microsoft Defender or Microsoft Sentinel, so the transition does not require a conventional data migration. That is useful—but it is not operational proof.

For security teams, the milestone should trigger a short continuity check. The question is whether analysts can still reach the intelligence, context and collaborative work they depend on, with the right permissions and without breaking the handoffs around an investigation.

## What changed today

Microsoft’s Partner Center announcement says the standalone Defender Threat Intelligence SKU has retired and all subscriptions end on August 1. It also says the service’s capabilities are available at no extra cost in the Defender portal for customers with Microsoft Defender or Microsoft Sentinel. Customers do not need to perform a migration because those features are already present.

That description establishes product and licensing direction, but it should not be expanded into a claim that every tenant, role or operating procedure is automatically ready. Organizations can have an eligible product while individual analysts lack access, use an outdated bookmark, or rely on a process written around a separate service boundary.

Microsoft’s current quickstart places the threat-intelligence experience under the Defender portal’s Threat intelligence area. It lists Intel profiles, Intel explorer and Intel projects as the relevant pages. The fastest useful validation is therefore not a license screenshot; it is a representative analyst signing in and completing a familiar task in each capability the team actually uses.

## Preserve the investigation context

Threat intelligence is more than a search box. Microsoft describes Intel projects as stores for investigation artifacts and detailed history, including names, descriptions, collaborators and monitoring profiles. Its documentation says analysts can view owned and shared projects in the Defender portal, add collaborators, and download project artifacts for use in blocking or detection workflows.

That context makes project visibility a high-value transition test. Select a small sample of active personal and team projects. Confirm that the expected owner and collaborators can open them, that descriptions and artifacts are present, and that an analyst can add a harmless test item through the approved workflow. Where teams export artifacts to a SIEM or other control, verify the receiving process with non-sensitive test data rather than assuming the portal view proves the handoff.

The test should cover least privilege as well as availability. A successful administrator session does not demonstrate that day-to-day analyst roles work, while broadening roles simply to restore access creates a new control problem. Record which identity, tenant and role combination was tested, then route exceptions through the normal access-review process.

## Test enrichment, not just navigation

Microsoft says Defender TI brings together infrastructure data and lets analysts search indicators and relate them to intelligence articles, actor profiles and vulnerabilities. The quickstart also points to an article digest and featured intelligence within the portal. Teams that use those functions should exercise them directly with a benign, pre-approved test case.

Start with the workflow’s inputs and outputs: can an analyst reach Intel explorer, retrieve the expected enrichment categories, locate a known internal test project, and produce the artifact or record that the next control expects? Check saved procedures, training material, browser bookmarks and service-desk guidance for obsolete paths. If automation or documentation refers to the retired standalone product, assign an owner and a deadline rather than leaving the discrepancy as tribal knowledge.

Avoid claiming parity where it has not been tested. Microsoft confirms convergence and says no customer migration is needed; ShadowContext’s recommendation to validate tenant-specific workflows is a defensive inference from the operational change, not a vendor report of lost data or broken functions.

## Close with measurable evidence

A compact acceptance record is enough: named analyst roles can open the portal; required profiles, explorer functions and projects are visible; collaboration behaves as intended; and any export or downstream detection path completes successfully. Add a failed-access route and escalation owner so the check remains useful after today.

The durable lesson is that service retirement is a security-control change even when the replacement is already deployed. Product availability describes what should exist. A completed analyst task proves that the intelligence workflow still exists where defenders need it.
