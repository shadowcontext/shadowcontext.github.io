---
title: "Post-Quantum Migration Starts With Discovery, Not Algorithms"
subtitle: "New NCSC workshop findings put ownership, supplier readiness, and cryptographic discovery ahead of product selection."
description: "The NCSC's latest post-quantum guidance gives defenders a practical starting point: map cryptographic dependencies and engage suppliers now."
date: 2026-07-22 22:08:00 +0400
layout: post
category: defense
tags: [post-quantum cryptography, cryptography, resilience, supply chain]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-22-post-quantum-migration-starts-with-discovery.svg
image_alt: "Abstract cryptographic lattice changing from fragmented amber rings into a resilient blue-green shield form"
key_points:
  - "Begin with a cryptographic dependency map, not a product shortlist."
  - "Make supplier roadmaps part of security and procurement reviews."
  - "Prioritise long-lived data, critical services, and hard-to-replace systems."
sources:
  - title: "Post-quantum cryptography (PQC) migration workshop report"
    publisher: "UK National Cyber Security Centre · 22 July 2026"
    url: "https://www.ncsc.gov.uk/blogs/post-quantum-cryptography-pqc-migration-workshop-report"
  - title: "Timelines for migration to post-quantum cryptography"
    publisher: "UK National Cyber Security Centre · 20 March 2025"
    url: "https://www.ncsc.gov.uk/guidance/pqc-migration-timelines"
---

Post-quantum cryptography is often presented as an algorithm decision. A new UK National Cyber Security Centre workshop report makes the more useful point: for most organisations, the immediate challenge is knowing what must change, who owns it, and which suppliers control the timetable.

That reframes post-quantum migration as a resilience programme rather than a specialist cryptography project. Defenders do not need to deploy unfinished technology today. They do need to expose dependencies that could otherwise turn a planned transition into a rushed one.

## The deadline is an inventory problem

The NCSC says a sufficiently capable quantum computer would undermine the public-key cryptography used to protect present-day networks and systems. Post-quantum cryptography, or PQC, is the planned mitigation. Its published milestones call for organisations to define goals, complete discovery and build an initial migration plan by 2028; finish early high-priority work and refine the roadmap by 2031; and complete migration by 2035.

Those dates can look distant until they are measured against hardware replacement cycles, certificate lifetimes, industrial systems and bespoke applications. The NCSC estimates that discovery, strategy selection and initial planning alone can take large organisations two to three years. That makes the 2028 milestone a current operating concern, not a future research date.

The first deliverable should therefore be a cryptographic dependency map. Start from important services and data, then identify where encryption, signatures, certificates and key exchange protect them in transit or at rest. Include cloud and managed services, enterprise identity infrastructure, network appliances, software, end-user devices, connected equipment and operational technology. The objective is not a perfect count of every key. It is a decision-quality view of which services depend on which protocols, products, providers and hardware.

## Ownership belongs above the cryptography team

The July 22 workshop report says executive sponsorship was one of its strongest themes. That is justified because migration choices will cross security, architecture, procurement, legal, risk and business-continuity functions. A cryptography team can assess algorithms; it cannot independently schedule a platform replacement, renegotiate a supplier commitment or accept downtime for a critical service.

Defenders should give a senior sponsor a phased roadmap tied to business outcomes. The case is stronger when it identifies systems that protect valuable or long-lived data, services with high availability requirements, and equipment whose replacement window may not return before a migration deadline. These factors make priorities more defensible than a flat list of cryptographic components.

This governance also prevents premature buying. Standards and implementations will continue to mature. Selecting a tool before mapping the estate risks optimising one technical layer while overlooking certificate authorities, embedded devices or provider-controlled services that determine whether the whole path can migrate safely.

## Supplier readiness is part of exposure

The workshop participants also treated supply-chain readiness as critical. Organisations should ask providers what they depend on, when standards-compliant PQC support will be available, whether existing products can be upgraded, and how hybrid or transitional modes will be tested. Answers should feed both the migration roadmap and future purchasing requirements.

This matters most where technology refreshes are infrequent. A router, hardware security module, industrial sensor or proprietary platform bought now may remain in service across several planning milestones. Procurement teams should record upgradeability, supported algorithms, certificate constraints and vendor end-of-life dates while a purchase can still be influenced—not after the equipment is embedded.

Supplier claims also need assurance. The NCSC guidance warns that incorrectly configured cryptography may continue operating while providing weaker protection than intended. Migration testing must verify actual negotiation and use of the expected cryptography, including whether systems silently fall back to traditional methods.

## What defenders should do this quarter

Assign an accountable sponsor and a small cross-functional working group. Choose a handful of critical services and trace their cryptographic dependencies end to end. Record data lifetime, business criticality, system owner, provider, replaceability and the next natural refresh window. Use the exercise to establish an inventory method that can expand across the estate.

Then open structured conversations with the suppliers that control the largest dependencies. Ask for roadmaps and evidence without requiring immediate deployment. Feed the answers into risk registers, architecture standards and procurement language, and define how interoperability, rollback and fallback behaviour will be tested.

The central defensive lesson is deliberately unglamorous: migration begins with visibility and leverage. Organisations that discover dependencies and shape supplier plans now can adopt mature PQC implementations in stages. Those that wait for a product announcement may find that their hardest constraint was never the algorithm.
