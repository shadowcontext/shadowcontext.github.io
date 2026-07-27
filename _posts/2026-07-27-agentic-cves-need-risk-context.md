---
title: "Agentic CVEs Need Risk Context, Not Severity Alone"
subtitle: "A new Berkeley dataset shows why faster AI-driven discovery must be paired with exploitability and environment-aware triage."
description: "Berkeley’s agentic CVE map finds weak alignment between severity and exploit risk, reinforcing the need for context-led vulnerability triage."
date: 2026-07-27 09:10:45 +0400
layout: post
category: ai-security
tags: [agentic-ai, vulnerability-management, cvss, epss]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-27-agentic-cves-need-risk-context.svg
image_alt: "Abstract streams of vulnerability fragments passing through a luminous risk-filtering prism into a small set of prioritized signals"
key_points:
  - "Berkeley’s rolling dataset tracks publicly attributed CVEs found by agentic systems."
  - "Within its high-severity sample, CVSS correlates weakly with EPSS compared with other CVEs."
  - "Defenders should combine severity with exploit evidence, exposure, asset value and compensating controls."
sources:
  - title: "The Agentic Vulnerability Coverage Map"
    publisher: "Berkeley Vulnerability Initiative · data compiled 26 July 2026"
    url: "https://vuln.cs.berkeley.edu/"
---

AI systems are adding vulnerabilities to public queues faster, but a newly compiled Berkeley dataset suggests that the familiar ordering signals do not become more reliable with volume. For defenders, the immediate lesson is not to distrust AI-found flaws. It is to avoid treating a high severity score as a complete patch priority.

The Berkeley Vulnerability Initiative’s Agentic Vulnerability Coverage Map tracks CVEs publicly attributed to agentic discovery systems and rebuilds its corpus daily. Its 26 July snapshot highlights a widening operational problem: discovery can scale faster than an organization’s ability to validate, contextualize and remediate findings.

## What the coverage map measures

The map compares a rolling 90-day window ending 26 July 2026 with the same period in 2025. Its headline comparison identifies 367 agentic CVEs alongside 21,317 other 2026 filings and 10,820 filings in the earlier baseline. Elsewhere, the page reports 399 agentic CVEs in the 90-day analysis; these figures appear in different displayed summaries, so they should not be treated as interchangeable.

The project also analyzes vulnerability classes and public risk signals. Among CVEs with a CVSS base score of at least 7, it reports a Spearman correlation of 0.17 between CVSS and the Exploit Prediction Scoring System for the agentic set. The corresponding values are 0.30 for the remaining 2026 CVEs and 0.40 for the 2025 baseline.

That is an association inside this dataset, not proof that AI discovery makes severity scoring fail. Attribution is limited to what public CVE records, advisories and credits reveal, while EPSS is a probability estimate rather than confirmation of exploitation. The map is best read as a changing measurement of the public record, not a census of all vulnerabilities found by AI.

## More findings can still mean less signal

The operational risk is queue distortion. The map says 59.2% of its identified agentic CVEs are rated high or critical, compared with 54.9% of the remaining 2026 group and 46.3% of the 2025 baseline. A severity-first workflow could therefore push a large share of new findings into the same urgent lane even when their exposure conditions and predicted exploit risk differ sharply.

The dataset also shows concentration. Across its full verified catalog, cross-site scripting is the most frequent weakness class, representing 131 of 1,377 assignments. Use-after-free and code injection follow at 60 assignments each. At the same time, the project lists exploited weakness classes that agentic discovery has not yet reached. AI-assisted research is broad, but the public results do not show uniform coverage.

For security leaders, this means scanner output and disclosure counts are measures of discovery activity, not direct measures of reduced risk. An organization can find more flaws while becoming slower at deciding which exposed systems need action first.

## Build a context-led triage lane

Keep CVSS as a technical severity input, but combine it with signals that describe the organization’s actual risk. Start with deployment proof: confirm whether the affected component and version are present, reachable and used in a vulnerable configuration. Then add exploitation evidence, EPSS, known-exploited catalogs, public attack prerequisites and the sensitivity of the service or data behind the flaw.

Compensating controls belong in the same record. Network isolation, strong authentication, restricted privileges, application allowlisting and effective detection may change response sequencing, though they do not erase a vulnerability. Record the owner, remediation deadline and verification method so that prioritization produces accountable work rather than another score.

AI-attributed findings may also deserve a distinct quality check. Confirm the affected range and fix against the primary vendor advisory, remove duplicate records, and require human validation before making disruptive emergency changes. That review should be fast, but it should not disappear merely because the discovery system was automated.

## Measure remediation, not accumulation

The most useful executive metrics begin after discovery: time to establish exposure, time to assign an owner, time to mitigate genuinely reachable risk, and the proportion of fixes verified in production. Track exceptions and reopened findings as well. These measures reveal whether increased discovery capacity is improving defense or only enlarging the backlog.

Berkeley’s map offers a timely warning against equating a longer list of high-scoring CVEs with a clearer risk picture. As agentic discovery grows, defenders need stronger context, not a larger emergency queue.
