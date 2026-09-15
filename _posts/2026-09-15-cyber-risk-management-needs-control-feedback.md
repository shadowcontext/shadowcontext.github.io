---
title: "Cyber Risk Management Needs a Control Feedback Loop"
subtitle: "New Canadian guidance connects enterprise risk decisions to system evidence, ownership, and continuous reassessment."
description: "Canada's new cyber and privacy risk guidance shows how control ownership and system feedback can keep authorization decisions current."
date: 2026-09-15 07:11:16 +0400
layout: post
category: defense
tags: [risk-management, security-governance, privacy, continuous-monitoring]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-15-cyber-risk-management-needs-control-feedback.svg
image_alt: "Abstract layered security field with connected control nodes and luminous feedback arcs flowing between organizational and system levels"
key_points:
  - "Canada's Cyber Centre released a new organizational cyber and privacy risk-management process."
  - "The guidance links enterprise control decisions to evidence returned by individual systems."
  - "Defenders should assign control ownership and define feedback that can reopen risk decisions."
sources:
  - title: "Organizational cyber security and privacy risk management activities - ITSP.10.036"
    publisher: "Canadian Centre for Cyber Security · September 14, 2026"
    url: "https://www.cyber.gc.ca/en/guidance/cyber-security-privacy-risk-management/organizational-cyber-security-privacy-risk-management-activities-itsp10036"
---

Canada's Cyber Centre has released a new organizational cyber security and privacy risk-management guide. Its most useful message for defenders is structural: risk decisions made at the enterprise level need a defined path into individual systems, and evidence from those systems needs a path back to the people who authorize risk.

That makes governance an operating loop, not an annual document exercise. Teams can use the model to test whether control ownership, monitoring and authorization stay connected as systems and threats change.

## What the new guidance establishes

The Canadian Centre for Cyber Security says ITSP.10.036 took effect on 14 September and is the first release of the publication. It supersedes the organizational activities in Annex 1 of ITSG-33 and forms part of a wider cyber security and privacy risk-management series. Although the document includes requirements and terminology specific to the Government of Canada, it says the process can be adapted to an organization's needs.

The guide sets four objectives: understand the security and privacy needs of programs and services; select and allocate controls and activities; continuously monitor their performance; and update them when incidents, vulnerabilities or deficiencies demand change. It also brings privacy into the same lifecycle while making clear that not every privacy risk is an information-security risk.

At organizational level, the process progresses from defining needs and developing control profiles to allocating controls, monitoring performance, maintaining authorization and updating the profiles. At system level, projects and operations move through concept, development, production, operation and retirement. System performance feedback then informs the organizational process.

This is newly published defensive guidance, not an incident or breach report. The source does not claim that adoption prevents every adverse event, and its recommended process still requires tailoring to local law, mission and risk appetite.

## Turn allocation into accountable ownership

The strongest operational lesson is that selecting a control does not establish who actually delivers it. The guidance distinguishes common controls provided across the organization, system-specific controls owned by a project or operational group, and hybrid controls whose implementation is shared. That distinction should appear in evidence, not only architecture language.

For every required control, record the accountable authority, implementation owner, systems that inherit it, assurance activity, evidence source and review trigger. A centrally operated identity service may be a common control, for example, while application authorization remains system-specific. Network protection may be hybrid if a central platform supplies the boundary and a product team owns workload rules. A single undifferentiated control owner would hide those hand-offs.

Privacy needs the same precision. Map where personal information is collected, used, retained and disposed of, then connect those flows to the controls and privacy activities intended to protect them. The Cyber Centre describes security and privacy as overlapping functions with complementary objectives; organizations should therefore identify shared evidence while preserving distinct decision authorities.

## Build feedback that can change a decision

Continuous assessment does not mean every check must run in real time. The guide notes that some activities, such as log review, may be automated continuously, while others, including review of backup procedures, may follow a schedule. The useful test is whether each assessment produces timely evidence for its risk and whether a failed result reaches someone empowered to act.

Start with one critical service. Trace its business impact and information flows to its organizational control profile, then follow each allocated control to a named provider and a verifiable system implementation. Work backward from recent evidence—configuration results, access reviews, recovery tests or vulnerability findings—to confirm that it reaches the authorization record.

Define explicit triggers that reopen the decision: a material architecture change, a new threat, repeated control failure, a change in information sensitivity, an expired exception or evidence that a shared control no longer meets its objective. Assign deadlines and an escalation route. Without those triggers, “continuous monitoring” can become a dashboard that never changes risk acceptance.

Finally, preserve the loop in a small assurance record: current need, selected control, allocation, latest evidence, unresolved deficiency, approving authority and next review. The Cyber Centre's process is comprehensive, but its central defensive value is simple. Governance becomes credible when system evidence can revise an enterprise decision—and when that revised decision reliably changes the systems below it.
