---
title: "Open WebUI Fetch Controls Need Every-Hop Proof"
subtitle: "A redirect-handling flaw shows why AI retrieval policy must follow the request to its final destination."
description: "Open WebUI 0.11.1 fixes a redirect validation gap, underscoring the need to enforce AI retrieval and proxy policy at every network hop."
date: 2026-09-10 06:12:14 +0400
layout: post
category: ai-security
tags: [ai-security, ssrf, egress-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-10-open-webui-fetch-controls-need-every-hop-proof.svg
image_alt: "Abstract AI retrieval core tracing an amber redirect path through layered teal gates before a protected internal network boundary"
key_points:
  - "Open WebUI says versions 0.9.5 through 0.11.0 are affected only when redirect following is enabled."
  - "Version 0.11.1 applies destination checks at each redirect hop and connection point."
  - "Forward-proxy deployments still need destination restrictions enforced by the proxy itself."
sources:
  - title: "Server-side fetches reach blocked and internal hosts via unvalidated HTTP redirect targets"
    publisher: "Open WebUI maintainers · updated September 9, 2026"
    url: "https://github.com/open-webui/open-webui/security/advisories/GHSA-5x7x-4c3c-qf5w"
---

Open WebUI has fixed a server-side request forgery weakness in its web retrieval paths. The issue matters less as an isolated bug than as a clear design warning: when an AI service follows redirects, a policy decision made only against the first URL does not govern the destination that the server ultimately reaches.

The advisory reports no breach or active exploitation. It gives defenders a precise configuration condition, a fixed version and an architectural check that should extend beyond this product.

## What the advisory confirms

The [Open WebUI maintainer advisory](https://github.com/open-webui/open-webui/security/advisories/GHSA-5x7x-4c3c-qf5w), reviewed and updated on September 9, tracks the issue as CVE-2026-88001. It lists Open WebUI versions 0.9.5 through 0.11.0 as affected and version 0.11.1 as patched.

Exposure is conditional. The advisory says `AIOHTTP_CLIENT_ALLOW_REDIRECTS` must be set to `true`; its default is `false`. With redirect following disabled, the affected fetch paths do not follow redirects and the deployment is not affected by this flaw. When the setting is enabled, an authenticated user with access to a feature that makes the server fetch a URL could cause a permitted starting address to redirect elsewhere.

The affected surface is broader than one visible tool. The maintainers identify web retrieval paths using two HTTP clients, the built-in page fetch tool and the URL-ingestion endpoint. They also say web search and chat image retrieval can reach the relevant behavior. This is why inventory must cover enabled capabilities and runtime configuration, not merely the package version.

## The security boundary moved with the redirect

Open WebUI already had an excluded-host list and checks intended to refuse private or internal destinations. The flaw arose because those controls did not consistently evaluate the destination of an HTTP redirect. The original address passed validation, while the server could subsequently connect to a location the operator meant to exclude.

That distinction is especially important in AI systems. Retrieval output may be returned to a user, stored in a collection or supplied to a model as context. A network request is therefore also a data-ingestion decision. If the final destination falls outside the intended trust boundary, downstream model behavior does not restore that lost boundary.

The advisory rates the issue moderate and requires an authenticated account plus non-default configuration. Those constraints should inform priority, but they should not be converted into an assumption that every authenticated user or integrated workflow is trusted to choose server-side destinations. Shared AI interfaces often aggregate several retrieval features behind one service identity with network reach that individual users do not possess.

## Patch, then verify the real request path

Upgrade affected deployments to 0.11.1. The maintainers say the fix evaluates the excluded-host list per request so it applies to redirect hops, and places the private-address check where the relevant client resolves or connects to the actual host. Operators should verify the running build rather than closing the ticket when an image tag or deployment manifest changes.

Next, record whether redirect following is enabled and why. If the feature is unnecessary, keep it disabled. If it is required, test benign redirects to both allowed and prohibited destinations and confirm that the final hop—not only the submitted URL—is represented in logs and enforcement. Review every enabled feature that can initiate a fetch, including ingestion, search, page tools and remote images.

Do not treat the application allowlist as the only control. Restrict outbound network paths at a layer independent of the AI application, limit the service identity’s access to internal systems, and alert on unexpected destination classes or repeated blocked redirects. Avoid granting the retrieval service broad reach merely because user access to the interface is authenticated.

## Forward proxies remain a separate decision point

The advisory identifies an important residual condition: where outbound traffic passes through a forward proxy, the application’s private-address check may see the proxy rather than the final destination. Version 0.11.1 still applies Open WebUI’s excluded-host list, but operators must enforce destination restrictions on the proxy itself.

That creates a useful acceptance test. The application, proxy, DNS path and network policy should agree on which destinations are allowed, including after redirects and resolution. Logs should let defenders reconstruct the initial request, every hop and the final connection without relying on model output as evidence.

The durable lesson is that server-side retrieval is delegated network authority. Its guardrails must travel with the request until the connection is made. A clean first URL is only the beginning of that proof.
