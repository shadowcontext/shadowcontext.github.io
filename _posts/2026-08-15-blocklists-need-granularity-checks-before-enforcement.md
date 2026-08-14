---
title: "Blocklists Need Granularity Checks Before Enforcement"
subtitle: "New research shows why defenders should match URL, subdomain, or apex blocking to who controls the underlying namespace."
description: "BlockMeNot research finds most blocklist entries use suboptimal scope, giving defenders a practical test for safer, harder-to-evade blocking."
date: 2026-08-15 02:10:39 +0400
layout: post
category: defense
tags: [blocklists, phishing, dns-security, threat-intelligence]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-15-blocklists-need-granularity-checks-before-enforcement.svg
image_alt: "Abstract layered web paths passing through a precise shield aperture that isolates one hazardous endpoint while leaving neighboring routes open"
key_points:
  - "Blocking scope should follow whether a service leases URLs, subdomains, or neither."
  - "The study found 61.6% of evaluated entries allowed easy evasion through overly narrow blocking."
  - "Defenders should record scope, ownership model, enforcement point, and expiry for every block."
sources:
  - title: "BlockMeNot: Automatic Selection of Domain and URL Blocking Granularity to Minimize Collateral Damage and Evasion"
    publisher: "USENIX Association · 14 August 2026"
    url: "https://www.usenix.org/conference/usenixsecurity26/presentation/ahmed"
---

Blocking a malicious address sounds binary. In practice, defenders must decide whether to deny one URL, one subdomain, or an entire registrable domain. Research presented at USENIX Security '26 shows that this choice is frequently wrong—and that both overly narrow and overly broad entries can weaken defense.

## The control boundary matters

The BlockMeNot paper frames blocking as an ownership problem. A URL-leasing service hosts content from many users under paths on the same domain. A subdomain-leasing service gives different users separate subdomains. A conventional apex domain, by contrast, is generally controlled as one administrative unit.

Those models call for different responses. The researchers recommend URL-level blocking for URL-leasing services, subdomain-level blocking when tenants control separate subdomains, and apex-level blocking when the domain does not lease either. This is not merely taxonomy. Blocking an entire shared service can interrupt unrelated benign resources, while blocking a single path on an attacker-controlled domain lets the operator move the content to another path or subdomain.

Enforcement location also constrains the decision. The paper notes that DNS controls cannot block a URL path, and encrypted web traffic limits what some network controls can see. Endpoint controls can act at URL level before a request is encrypted. Where the available control is too coarse for a shared service, reporting the abusive resource to the hosting service may be safer than imposing a high-collateral block.

## The measurement exposes two failure modes

The authors evaluated 225,355 entries from six blocklists and two threat exchanges. Their system classified the underlying domains using a manually labeled set of 10,843 apexes and separate models for URL- and subdomain-leasing services. The reported F1 scores were above 0.9 for both classifiers.

Only 2.6% of evaluated apexes were leasing services, but they hosted 34.7% of the listed entries. In the PhishTank sample, that share reached 71.7%, which the authors interpret as evidence that shared hosting is especially attractive for phishing. These are measurements of the studied feeds and collection period, not estimates for the whole internet.

The operational finding is sharper: the researchers judged only 37.2% of entries to be listed at the optimal granularity. They classified 1.3% as capable of causing collateral damage, while 61.6% permitted easy evasion because the listed scope was too narrow. BlockMeNot also identified 1,976 leasing apexes; 59.3% were absent from the team's existing ground truth, showing why a static allowlist of shared platforms will age quickly.

## Turn every indicator into a scoped decision

Defenders should treat a domain indicator as evidence requiring resolution, not as a ready-made firewall rule. Before enforcement, enrich it with the registrable apex, the apparent tenant boundary, the type of service, and the control point that will apply the block. Then choose the narrowest scope that contains attacker-controlled movement without crossing into another tenant's space.

That means a malicious path on a shared content platform should not automatically condemn the platform. A malicious subdomain on a tenant-isolating service may justify denying that subdomain, but not its siblings. An attacker-operated apex generally supports broader denial because moving between its paths and subdomains remains under the same control.

The paper's classifier is a research artifact, so security teams should validate it against their own traffic and false-positive tolerance before automating enforcement. A useful production workflow would retain the original indicator, selected scope, classification evidence, enforcement location, confidence, owner, and expiry. Analysts should be able to see when a coarse DNS rule was substituted for a URL-level recommendation.

## Measure blocks after deployment

Block quality is not proven when a rule is accepted. Teams should test whether the malicious resource remains reachable through adjacent paths or sibling subdomains, while sampling known-good resources on the same infrastructure for collateral effects. Resolver logs, proxy telemetry, endpoint events, help-desk reports, and threat-feed updates can reveal different failure modes.

Reclassification also needs a schedule. Hosting models change, domains expire, and attacker-controlled infrastructure can become parked or reassigned. Time-bounded rules with explicit renewal evidence are safer than permanent entries whose original ownership assumptions have disappeared.

The central lesson is simple: an indicator names a location, but a block imposes a boundary. Defenders need evidence that those two scopes match.
