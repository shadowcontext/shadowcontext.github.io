---
title: "Redirect Fix Keeps Authentication Headers on Trusted Hosts"
subtitle: "Ubuntu’s follow-redirects update shows why every cross-origin hop needs an explicit credential policy."
description: "Ubuntu’s follow-redirects fix makes redirect destinations, custom authentication headers and deployed package proof immediate defensive priorities."
date: 2026-08-13 10:10:41 +0400
layout: post
category: defense
tags: [nodejs, credential-security, vulnerability-management, application-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-13-redirect-fix-keeps-auth-headers-on-trusted-hosts.svg
image_alt: "Abstract network path splitting at a glowing security boundary, with amber credential tokens retained on the trusted blue route"
key_points:
  - "CVE-2026-40895 can forward custom authentication headers when a request follows a cross-domain redirect."
  - "Upstream fixed the issue in follow-redirects 1.16.0, while Ubuntu issued backported packages for five LTS releases."
  - "Defenders should verify both redirect policy and the package actually loaded by each deployed Node.js service."
sources:
  - title: "USN-8632-1: follow-redirects vulnerability"
    publisher: "Ubuntu Security · 12 August 2026"
    url: "https://ubuntu.com/security/notices/USN-8632-1"
  - title: "Custom Authentication Headers Leaked to Cross-Domain Redirect Targets"
    publisher: "follow-redirects Security Advisory · 13 April 2026"
    url: "https://github.com/follow-redirects/follow-redirects/security/advisories/GHSA-r4q5-vmmm-2653"
---

Redirects are often treated as transport plumbing: receive a new destination, then continue the request. Ubuntu’s new security update for `node-follow-redirects` is a reminder that a redirect can also cross a trust boundary while carrying credentials chosen by the application.

CVE-2026-40895 concerns custom authentication headers, not the standard `Authorization` header alone. The defensive task is therefore broader than applying one package update. Teams need to know which secrets their HTTP clients attach, which destinations may receive them, and which component actually performs each redirect.

## What the new Ubuntu notice changes

Ubuntu published USN-8632-1 on 12 August for Ubuntu 26.04, 24.04, 22.04, 20.04 and 18.04 LTS. The notice says `follow-redirects` did not properly remove custom authentication headers when following cross-domain redirects, potentially disclosing authentication information over the network.

The Ubuntu fixes are backported package builds, not a simple adoption of the upstream version number. The notice lists corrected `node-follow-redirects` packages for all five releases through Ubuntu Pro’s ESM Apps coverage. Administrators should use the exact package status reported for their release and subscription rather than compare an Ubuntu package string directly with the upstream semantic version.

The upstream project’s April advisory identifies versions through 1.15.11 as affected and 1.16.0 as patched. It rates the issue Moderate. Neither source reports exploitation or an organisational breach; they establish a vulnerable behavior and available corrections.

## A redirect changes who receives the request

The upstream advisory says the library removed `authorization`, `proxy-authorization` and `cookie` headers when a request crossed domains, but forwarded other application-defined headers. Names such as `X-API-Key` or `X-Auth-Token` may carry equivalent authority even though they do not use a standard credential header name.

That distinction matters in services that call APIs, fetch web resources or process user-influenced URLs. A destination can return an HTTP redirect to another host. If the client follows it automatically and preserves a custom secret header, the second host receives authority that the application intended only for the first. The redirect response does not need to alter the secret; it changes its audience.

Risk is conditional, not universal. Exposure requires a vulnerable library, a custom sensitive header, a cross-domain redirect and a request path capable of reaching that redirect. Defenders should not infer credential disclosure merely from finding the package. They should establish whether those conditions exist in the deployed application.

## Patch the code that actually runs

Start with two inventories. For Ubuntu-managed software, identify hosts with the distribution’s `node-follow-redirects` package and compare the installed build with USN-8632-1. For application-bundled dependencies, inspect lockfiles, built containers and runtime dependency trees for upstream `follow-redirects` versions through 1.15.11. A host package update will not replace a copy bundled inside an application image, and an npm manifest change does not prove that a new image reached production.

Upgrade upstream dependencies to 1.16.0 or later. Apply the Ubuntu-provided build appropriate to each supported release where ESM Apps coverage is active. Then rebuild, redeploy and record the version resolved inside the running workload. If a fixed package is not yet available through an organisation’s chosen support channel, treat disabling automatic redirects or removing custom credentials from redirectable requests as design options that require application testing, not as vendor-certified substitutes.

## Make destination policy explicit

Regression tests should confirm that an approved same-origin flow still works while a cross-origin hop receives no custom secret. Test the HTTP client path the service really uses, including wrappers and retry layers. Avoid testing with production credentials; use inert markers and verify where they appear.

Applications should also restrict which schemes and hosts a sensitive request may reach, cap redirect counts, and log destination changes without recording secret values. Where a workflow genuinely requires credentials on more than one origin, issue destination-specific credentials rather than forwarding one reusable token across hosts.

CVE-2026-40895 turns a small implementation detail into a durable control principle: credentials belong to an intended audience. A redirect is a new authorization decision, and the strongest evidence of remediation combines a fixed runtime package with tests proving that authority does not travel farther than intended.
