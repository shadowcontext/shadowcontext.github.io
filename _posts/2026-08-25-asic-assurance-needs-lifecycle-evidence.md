---
title: "ASIC Assurance Needs Evidence Across the Entire Design Lifecycle"
subtitle: "New NSA guidance turns custom-chip security into a traceable chain of design, tool, manufacturing, and delivery decisions."
description: "NSA’s new ASIC guidance maps 18 hardware threats and shows why assurance evidence must follow a custom chip from requirements to delivery."
date: 2026-08-25 20:10:01 +0400
layout: post
category: defense
tags: [hardware-security, supply-chain-security, microelectronics, secure-development]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-25-asic-assurance-needs-lifecycle-evidence.svg
image_alt: "Abstract integrated-circuit die protected by nested translucent layers and a continuous cyan provenance path from design traces to sealed delivery"
key_points:
  - "NSA maps 18 intentional-threat categories across the custom-chip lifecycle."
  - "The catalog covers design artifacts and tools as well as fabrication and delivery."
  - "Defenders need reviewable evidence that approved inputs survive every lifecycle handoff."
sources:
  - title: "NSA Releases Best Practices to Mitigate Threats in Development of ASICs"
    publisher: "National Security Agency · August 25, 2026"
    url: "https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4582087/nsa-releases-best-practices-to-mitigate-threats-in-development-of-asics/"
  - title: "DoW Microelectronics: Application Specific Integrated Circuit Best Practices – Threat Catalog"
    publisher: "National Security Agency · August 2026"
    url: "https://media.defense.gov/2026/Aug/25/2003986216/-1/-1/0/CTR_ASIC_BEST_PRACTICES_THREAT_CATALOG.PDF"
  - title: "Application Specific Integrated Circuit (ASIC) Level of Assurance 1 (LoA1) Best Practices"
    publisher: "National Security Agency · August 2026"
    url: "https://media.defense.gov/2026/Aug/25/2003986215/-1/-1/0/CTR_ASIC_LOA1_BEST_PRACTICES.PDF"
---

The National Security Agency has published two technical reports for protecting application-specific integrated circuits during design and manufacturing. Together, they frame custom-chip assurance as a lifecycle discipline: defenders must preserve confidence in requirements, tools, design artifacts, fabrication processes and delivery, rather than relying on a final inspection to reveal every intentional change.

That distinction matters wherever a custom chip supports a consequential system. Once logic is manufactured into silicon, remediation is slower and costlier than correcting software. The practical lesson is to make assurance evidence part of engineering and acquisition before the design becomes difficult to change.

## One threat model follows the whole chip

The new threat catalog describes 18 categories of intentional compromise. They begin with design requirements and continue through development IT, electronic design automation software, third-party intellectual property, hardware-description-language code, tool scripts and netlists. The catalog then follows the design into foundry data, tapeout, wafer manufacturing and testing, personalization, dicing, packaging, physical handling, delivery and user documentation.

This breadth prevents a narrow reading of hardware security. A trustworthy foundry cannot compensate for requirements that were maliciously altered earlier. Likewise, controlled source files do not prove that the approved representation reached tapeout or that the delivered device matches what was accepted. The report explicitly focuses on intentional deviations in digital, single-die ASICs from requirements development through device delivery; it does not claim to cover every hardware type or every accidental defect.

The catalog also separates three levels of assurance using adversary access, technology and investment alongside the value and targetability of the effect. NSA says the companion Level of Assurance 1 report is the first of three planned best-practice reports and supplies multiple mitigation options for custom hardware whose failure could reduce US government capabilities.

## Treat design infrastructure as production infrastructure

Several catalog categories sit inside environments that security teams may already manage: administrator accounts, development hosts, networks, repositories, design software and automation scripts. But their output is not an ordinary software build. A compromised input can propagate into a physical design whose later verification may be constrained by time, cost and observability.

Programs should therefore identify the assets that can alter the chip, not merely those that store source code. That inventory should include requirements systems, EDA installations, third-party IP and models, flow-control scripts, netlists, physical design kits, handoff locations and acceptance records. Each should have a named owner, approved source, change history and access boundary proportionate to its ability to affect the final device.

The catalog notes that a modified “golden copy” of requirements can eliminate the comparison point needed later. Defenders should generalize that warning: a reference artifact is useful only when its origin, authorization and integrity are independently protected. Reviews should verify who approved a change and which downstream artifacts were regenerated, rather than accepting a matching checksum whose baseline may itself have been replaced.

## Build evidence at every handoff

The strongest operational response is an assurance case that connects the lifecycle. At each transition, the receiving team should be able to show which artifact arrived, who authorized it, how its integrity was checked and what transformation followed. Exceptions need owners and expiry dates; undocumented substitutions should stop progression until resolved.

Supplier governance belongs in that chain. Contracts and technical reviews should define approved third-party IP, tool and process changes, artifact-retention requirements, incident escalation and the evidence needed at acceptance. These controls do not prove that no hidden behavior exists, but they reduce ambiguity about what was designed, processed and delivered.

Testing should be mapped back to the threat model. Programs can ask which of the 18 categories each review or test addresses, where coverage is indirect, and what residual risk remains. This produces a more useful record than a generic statement that a chip “passed security testing.”

## Make assurance survive schedule pressure

Hardware programs accumulate handoffs, suppliers and deadline-driven changes. Those are precisely the moments when provenance can fragment. Security leaders should place assurance gates on the engineering schedule, retain evidence with the configuration baseline, and require risk acceptance before bypassing a gate—not after fabrication has made the decision expensive to reverse.

NSA’s reports are aimed at government and defense stakeholders, and their scope should not be presented as a universal certification scheme. Still, the defensive pattern travels well: classify realistic threats, choose assurance depth from consequence and adversary capability, then preserve evidence through every transformation. For custom silicon, security is not a final property to inspect. It is a chain of justified decisions that must remain intact all the way to delivery.
