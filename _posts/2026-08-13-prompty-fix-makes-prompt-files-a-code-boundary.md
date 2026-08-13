---
title: "Prompty Fix Makes Prompt Files a Code Boundary"
subtitle: "A critical renderer flaw shows why cloned and AI-generated prompt files need the same controls as executable input."
description: "A critical Prompty renderer flaw makes prompt-file provenance, fixed-version proof and constrained rendering immediate defensive priorities."
date: 2026-08-13 08:09:43 +0400
layout: post
category: ai-security
tags: [prompty, prompt-security, template-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-13-prompty-fix-makes-prompt-files-a-code-boundary.svg
image_alt: "Abstract prompt document entering a luminous rendering chamber while unsafe branching paths are stopped outside a cyan security boundary"
key_points:
  - "CVE-2026-73299 affects the TypeScript renderer in @prompty/core through 0.1.4 and 2.0.0-beta.4."
  - "The fixed releases are 0.1.5 and 2.0.0-beta.5, with controls against unsafe member traversal and template calls."
  - "Defenders should treat cloned, community and AI-generated prompt files as untrusted code-adjacent artifacts."
sources:
  - title: "Server-Side Template Injection to Remote Code Execution in the @prompty/core Nunjucks Renderer"
    publisher: "Microsoft Prompty Security Advisory · 20 July 2026; CVE assigned 13 August 2026"
    url: "https://github.com/microsoft/prompty/security/advisories/GHSA-w28w-gp39-m4p6"
  - title: "fix(typescript): restrict Nunjucks template execution"
    publisher: "Microsoft Prompty · 20 July 2026"
    url: "https://github.com/microsoft/prompty/pull/404"
---

A prompt file may look like documentation, but the software rendering it can give that file much greater authority. The Prompty project’s critical TypeScript renderer advisory, now tracked as CVE-2026-73299, makes that boundary concrete: untrusted template content could reach JavaScript execution inside the host Node.js process.

For defenders, the lesson is larger than one package. Prompt artifacts acquired from a community, cloned repository or model output need provenance, version control and constrained processing before they enter an AI application.

## What the advisory establishes

The Prompty maintainers say the affected component is the Nunjucks renderer in the npm package `@prompty/core`. The vulnerable ranges are version 0.1.4 and earlier, and the 2.0 prerelease line through 2.0.0-beta.4. Fixed releases are 0.1.5 and 2.0.0-beta.5.

According to the advisory, the renderer allowed unrestricted JavaScript member access while processing a `.prompty` template body. A malicious template could traverse constructor and prototype properties and execute JavaScript with the privileges of the Node.js host. The maintainers specifically identify untrusted, community-supplied, cloned and LLM-generated prompt files as relevant exposure paths.

The advisory is rated critical with a CVSS 3.1 base score of 10.0. That score expresses worst-case technical severity; it does not establish that every Prompty deployment is reachable or that exploitation has occurred. The cited upstream material reports a vulnerability and a correction, not an organizational breach.

## Prompt data can become runtime authority

The important design distinction is between values inserted into a template and instructions interpreted by the template engine. A system may intend a prompt file to carry model instructions and ordinary variables, yet the renderer can expose language features that cross into the host runtime. Once that happens, content review alone is not a dependable security boundary.

This matters especially in AI workflows because prompt assets move through channels that encourage reuse: repositories, evaluation sets, agent packages and generated configuration. A familiar extension or readable Markdown-like structure can create false confidence. Provenance tells defenders where a file came from and whether it changed; it does not prove that every construct is safe for the exact renderer version in production.

The merged fix reflects that distinction. The project says it sanitizes render inputs to own-data-only values, rejects constructor and prototype traversal, and prohibits template function calls. Ordinary interpolation, conditionals, loops and nested data remain supported. The defensive goal is not to remove useful templating, but to narrow the language so data cannot silently acquire host-process authority.

## Patch and prove the active path

Teams should first search lockfiles, software bills of materials and deployed images for `@prompty/core`, keeping the two affected version lines separate. Upgrade stable users to 0.1.5 or later and beta users to 2.0.0-beta.5 or later. Then verify the resolved dependency in the built artifact and the version loaded by the running service; changing a manifest without rebuilding and redeploying is not completion evidence.

Trace where `.prompty` files originate and who can change them. Include files downloaded at runtime, copied from sample repositories, submitted by users, produced by models or synchronized through internal catalogs. Rendering should occur with the least filesystem and network access the application can tolerate, without production secrets in the process environment. Those constraints reduce impact if another parser or renderer weakness appears; they do not replace the fixed release.

## Preserve the boundary in tests

Regression tests should express security invariants rather than reproduce an operational exploit. A template must be able to read approved own-data properties, while inherited properties, prototype or constructor traversal and function invocation fail closed. Test both the default rendering route and any explicitly selected renderer, because the project’s fix includes coverage for both paths.

Finally, retain an evidence record linking source digest, dependency lock, built image, observed runtime version and test result. CVE-2026-73299 is a useful reminder that prompt security is not only about what reaches the model. It also depends on what the surrounding application is willing to interpret before the model ever sees the prompt.
