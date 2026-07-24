---
title: "Threat Actor Renaming Needs Alias Continuity"
subtitle: "Google’s unified naming system makes identity mapping an operational security requirement."
description: "Google’s new threat actor names can aid triage, but defenders must preserve aliases across detections, cases, reports, and historical searches."
date: 2026-07-25 02:09:30 +0400
layout: post
category: threat-intelligence
tags: [threat-intelligence, attribution, detection-engineering, security-operations]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-25-threat-actor-renaming-needs-alias-continuity.svg
image_alt: "Abstract editorial illustration of many colored identity threads converging through a faceted prism into one continuous defensive record"
key_points:
  - "Google is unifying Mandiant and TAG actor tracking under two-word cryptonyms."
  - "A new label must not be treated as proof that two vendors track the same entity."
  - "Alias tables should preserve detections, cases, searches, and historical reporting."
sources:
  - title: "Updated Cyber Threat Actor Naming System"
    publisher: "Google Threat Intelligence Group · July 24, 2026"
    url: "https://cloud.google.com/blog/topics/threat-intelligence/updated-cyber-threat-actor-naming-system"
---

Google Threat Intelligence Group is rolling out a unified system for naming threat actors, replacing parallel Mandiant and Google Threat Analysis Group conventions with memorable two-word cryptonyms. For defenders, the important change is not vocabulary. It is whether identity continuity survives the rename.

## What Google is changing

Google says the first word in each new cryptonym identifies a distinct tracked actor. Where practical, it may preserve a term used in earlier public reporting; otherwise, analysts will choose and vet a randomly generated word. The second word carries a category that Google considers useful for defense and response, such as an assessed origin or activity type.

The examples published on July 24 include CASTLE for People’s Republic of China tracking, ION for Iran, NEPTUNE for North Korea, RELIC for Russia and COMET for cybercriminal activity. These are category markers, not standalone evidence about a campaign. They should help an analyst read a name more quickly, but they do not replace the supporting intelligence behind an attribution or motivation assessment.

The rollout begins with several dozen active groups and will continue over time. Google also says it will retain previous names, MITRE ATT&CK mappings and other vendors’ aliases in its threat-intelligence platform. Early-stage clusters will continue to use UNC, or uncategorized, designations.

## Names are handles, not identity proof

Google explicitly cautions that threat-intelligence providers do not have identical visibility, so their tracked clusters rarely support a simple one-to-one comparison. That warning should govern how security teams import the new names.

An alias is a claim that two labels refer to substantially the same tracked activity. It is not merely a formatting shortcut. Different providers may split one body of activity into several clusters, combine observations that another provider keeps separate, or change an assessment as evidence develops. Automatically merging records because a feed presents two names together can therefore distort confidence, attribution and scope.

Defenders should model the new cryptonym as one identifier attached to a versioned intelligence object. Keep the source, first-seen date, mapping date and confidence or qualification supplied by the intelligence team. Where equivalence is uncertain, record “related to” or “overlaps with” rather than forcing “same as.” This is ShadowContext’s defensive analysis of the operational consequence, not a claim that Google prescribes a particular data model.

## Preserve the chain from intelligence to detection

Renaming becomes risky when actor labels are embedded directly in operational systems. A detection title may use an old Mandiant label, a case may use a TAG name, and an executive report may adopt the new cryptonym. Without an alias layer, searches fragment and teams can mistake an old alert for unrelated activity.

Start by locating actor names across threat-intelligence platforms, SIEM and EDR rules, SOAR playbooks, case templates, dashboards, watchlists and knowledge bases. Do not bulk-replace them. Add the new identifier while retaining the historical label, then test searches in both directions.

Detection logic should continue to depend on observable behavior, technical indicators and relevant context, not the actor name itself. Labels are valuable for organizing evidence and communicating assessments; they are weak control inputs because assessments and nomenclature can change without any change to the underlying activity. If a playbook branches solely on a group name, convert that branch to the behaviors, assets or risk conditions that actually justify the response.

## A practical migration check

Assign one owner for the alias map and record every mapping change. That owner should verify that old saved searches still return current records, new reports remain discoverable through former names, and automated enrichment does not create duplicate actors or silently merge uncertain clusters.

Sample a small set of renamed groups before wider ingestion. For each, trace one intelligence record into a detection, an alert, a case and a report. Confirm that source attribution and assessment confidence remain visible at every step. Also preserve timestamps so analysts can understand which name was current when a historical judgment was made.

Finally, monitor Google’s rolling updates rather than treating July 24 as a finished migration. The durable control is a source-aware identity layer that can accept revised names without rewriting history. A simpler naming scheme can reduce cognitive load, but only disciplined alias management keeps the defensive record coherent.
