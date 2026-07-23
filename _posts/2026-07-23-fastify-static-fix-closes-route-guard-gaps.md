---
title: "Fastify Static Fix Closes Two Route-Guard Gaps"
subtitle: "Two related fixes show why file authorization must evaluate the same normalized path that the server ultimately resolves."
description: "Fastify static users should move to 10.1.2 and verify that authorization checks operate on canonical file paths."
date: 2026-07-23 19:10:21 +0400
layout: post
category: defense
tags: [fastify, nodejs, vulnerability-management, application-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-23-fastify-static-fix-closes-route-guard-gaps.svg
image_alt: "Abstract layered file paths pass through aligned security arches toward a protected vault"
key_points:
  - "Applications using @fastify/static 10.1.1 or earlier should upgrade to 10.1.2."
  - "The flaws affect authorization around files inside the configured static root, not arbitrary files outside it."
  - "Regression tests should compare the path authorized by middleware with the canonical path actually served."
sources:
  - title: "@fastify/static vulnerable to route guard bypass via path traversal"
    publisher: "GitHub Security Advisory · July 22, 2026"
    url: "https://github.com/fastify/fastify-static/security/advisories/GHSA-83w8-p2f5-377r"
  - title: "@fastify/static vulnerable to Authorization Bypass via Non-Canonical URL Paths"
    publisher: "GitHub Security Advisory · July 22, 2026"
    url: "https://github.com/fastify/fastify-static/security/advisories/GHSA-8pvw-jcv7-9cmj"
  - title: "Security Advisories"
    publisher: "OpenJS Foundation CNA · July 23, 2026"
    url: "https://cna.openjsf.org/security-advisories.html"
---

Two newly catalogued vulnerabilities in `@fastify/static` turn a narrow package update into a broader application-security lesson: an access decision is only trustworthy when it examines the same canonical path that the file server will use.

The OpenJS Foundation’s CVE Numbering Authority listed both issues on July 23. The maintainers’ advisories point to version 10.1.2 as the safe upgrade floor.

## Two gaps in one trust boundary

The higher-severity issue, CVE-2026-15074, affects `@fastify/static` through version 10.1.0. GitHub rates it High at 7.5. The advisory says specially structured path segments can cause route-based middleware or guards to evaluate one route while the underlying file-serving component resolves another. An unauthenticated request could therefore reach a file within the configured static root even when middleware on that file’s route was expected to block access.

The second issue, CVE-2026-7120, affects versions through 10.1.1 and is rated Moderate at 5.3. Here, the package’s `allowedPath` callback evaluates a pathname before dot segments and duplicate separators are normalized. A denied file or subtree may become reachable when a non-canonical request is resolved to an allowed-looking location after the authorization decision.

These are confidentiality flaws, but their stated scope matters. The advisories do not say the defects permit arbitrary reads outside the configured static root. They describe bypasses of controls intended to divide public and restricted content *inside* that root. Defenders should preserve that distinction when assessing exposure.

## Version 10.1.2 is the meaningful floor

The release sequence is operationally important. Version 10.1.1 fixes CVE-2026-15074, but the advisory for CVE-2026-7120 identifies 10.1.1 itself as affected. Teams that stop at the first fixed version can remain exposed to the related authorization bypass. The current remediation is to upgrade to `@fastify/static` 10.1.2 or later.

For CVE-2026-15074, the maintainer also says applications should not rely on route-based middleware or guards to protect statically served files if they cannot update immediately. For CVE-2026-7120, no workaround is offered; upgrading is the prescribed action.

Inventory should go beyond a direct dependency search. JavaScript services may receive the package through internal frameworks, shared platform templates, or transitive dependency chains. Confirm the version actually installed in each built artifact and running image, not just the range declared in a manifest or the state of a developer workstation.

## Test the resolved path, not the request shape

The central defensive failure is inconsistent interpretation. Routing, authorization, and file resolution each handled the pathname at a different stage of normalization. A guard could make the correct decision about the string it received and still protect the wrong resource.

Regression tests should exercise semantically equivalent path variants without publishing exploit recipes. The assertion is simple: every representation that resolves to the same file must receive the same authorization result. Tests should cover protected files and protected subtrees, run through the production proxy and application stack, and verify both response status and the resource ultimately selected.

Architecture reviews should also ask whether restricted material belongs beneath a static document root at all. Separating public assets from authenticated downloads reduces the consequence of a routing mismatch. Sensitive files are better served through an explicit handler that authenticates the caller, authorizes the specific object, and records the decision.

## A focused defender checklist

Start by locating services and container images that include `@fastify/static`, then establish whether they use route middleware, guards, or `allowedPath` to restrict files. Upgrade affected deployments to at least 10.1.2 and rebuild immutable artifacts so the corrected package reaches production.

Next, verify the resolved dependency version from the deployed artifact and test protected paths through the same ingress route users reach. Review static roots for configuration files, source maps, exports, or other material that was never meant to be public.

Finally, add a release control for superseding security fixes. When closely related advisories land together, “patched” is not a durable state unless the team records the final safe version and confirms it after deployment.
