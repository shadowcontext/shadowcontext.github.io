---
title: "Ajax.NET exploitation makes legacy dependency discovery urgent"
subtitle: "CISA’s new warning turns an old library flaw into a test of application-level inventory and deployed-version proof."
description: "CISA’s Ajax.NET exploitation warning calls for dependency discovery, fixed-version verification, and careful retirement of unsupported components."
date: 2026-08-27 18:11:17 +0400
layout: post
category: defense
tags: [cisa-kev, dependency-security, dotnet, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-27-ajaxnet-kev-needs-dependency-proof.svg
image_alt: "Abstract application layers surrounding an amber legacy component inside a blue protective boundary"
key_points:
  - "CISA added CVE-2021-23758 to its exploited-vulnerability catalog on August 26."
  - "The reviewed advisory identifies 21.11.29.1 as the first patched AjaxNetProfessional release."
  - "Defenders need application-level dependency evidence, not server inventory alone."
sources:
  - title: "CISA Adds Six Known Exploited Vulnerabilities to Catalog"
    publisher: "CISA · August 26, 2026"
    url: "https://www.cisa.gov/news-events/alerts/2026/08/26/cisa-adds-six-known-exploited-vulnerabilities-catalog"
  - title: "Remote Code Execution in AjaxNetProfessional"
    publisher: "GitHub Advisory Database · updated February 3, 2026"
    url: "https://github.com/advisories/GHSA-6r7c-6w96-8pvw"
---

CISA has added CVE-2021-23758, a vulnerability in Ajax.NET Professional, to its Known Exploited Vulnerabilities catalog. The August 26 addition is the timely fact: a flaw disclosed in 2021 now carries evidence of real-world exploitation. For defenders, the immediate problem is less about the CVE’s age than proving where an old application dependency still runs.

## What the new signal confirms

CISA says Ajax.NET Professional contains a deserialization-of-untrusted-data vulnerability that can allow remote code execution through arbitrary .NET classes. Its catalog action sets September 9 as the remediation due date for US federal civilian executive branch agencies. That mandate is jurisdiction-specific, but the exploitation evidence is useful risk intelligence for any organization operating web applications built on the component.

The agency also cautions that the affected product may be end-of-life or end-of-service and advises users to discontinue it or move to a supported version. That wording matters. A nominal package update is not automatically a durable answer when an application depends on an abandoned component, an unofficial binary or a framework that no longer receives dependable maintenance.

The GitHub Advisory Database’s reviewed entry provides the clearest version boundary. It lists AjaxNetProfessional releases through 21.11.29 as affected and 21.11.29.1 as patched. The advisory assigns a critical 9.8 CVSS v3.1 score and says the issue is network-reachable without privileges or user interaction. It also says there is no comprehensive workaround other than updating to the latest version from the project’s GitHub source.

## Inventory must reach inside applications

This is a dependency-discovery problem before it is a patching problem. A server inventory may identify Windows, IIS and a business application while missing the DLLs actually loaded by that application. A software-composition report may identify a package in source control but say nothing about an older binary copied into production years ago. Neither view alone proves exposure or remediation.

Defenders should build a scoped list of internet-facing and partner-facing .NET applications, then identify whether AjaxNetProfessional is present in source manifests, build artifacts, deployment bundles and loaded runtime files. Include applications described internally as “legacy,” “stable” or “unchanged”; those labels are operational context, not security evidence.

Package identity also needs care. The reviewed advisory warns about binary DLLs obtained from other sites and notes that some NuGet packages not owned by the project contain vulnerable versions. Teams should therefore record the package source and artifact hash alongside the displayed version. If a scanner recognizes only a package name, validate its finding against the deployed file and the application that loads it.

## Turn remediation into proof

Prioritize applications that accept requests from untrusted networks, then choose between upgrading and retiring the dependency. Where 21.11.29.1 is supportable, rebuild through the normal trusted pipeline, test application behavior and deploy through change control. Where the component cannot be safely updated, reduce exposure while owners plan replacement: restrict access to known users and networks, place the service behind existing application-layer controls, and avoid presenting those measures as a complete fix.

Verification should answer four concrete questions: Was the affected file removed or replaced? Is the fixed artifact the one loaded by every running instance? Did all scaled-out nodes and recovery images receive the same change? Can the team reproduce the result after a restart or rollback exercise? Retain the package manifest, artifact identity, deployment record and runtime observation as one evidence set.

## The defensive lesson

A four-year-old CVE entering an exploited-vulnerability catalog is a warning about hidden persistence in software estates. Vulnerability age does not establish safety, and a clean operating-system scan does not establish application safety. The useful response is an application owner, an exact dependency location, a trustworthy fixed artifact and runtime proof that the vulnerable component is no longer serving requests.

That evidence also improves the next response. Once teams can map deployed libraries back to applications and owners, future exploitation warnings become targeted work instead of a broad search across every .NET server.
