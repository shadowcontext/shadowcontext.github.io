---
title: "MCP Pagination Tools Need Destination Boundaries"
subtitle: "A newly published SSRF flaw shows why agent tools must constrain where server-side requests can go."
description: "CVE-2026-19956 turns MCP URL handling into a practical control: allowlist destinations, block redirects, and verify the deployed patch."
date: 2026-08-17 02:10:38 +0400
layout: post
category: ai-security
tags: [mcp, ssrf, ai-agents, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-17-mcp-pagination-needs-destination-boundaries.svg
image_alt: "Abstract luminous request paths narrowed through a guarded gateway toward one trusted endpoint while other routes fade away"
key_points:
  - "CVE-2026-19956 affects version 0.1.0 of the Facebook Ads MCP server."
  - "The merged fix restricts pagination requests to one HTTPS host and disables redirects."
  - "Defenders should verify source provenance, outbound policy, and the exact deployed revision."
sources:
  - title: "gomarble-ai facebook-ads-mcp-server server.py fetch_pagination_url server-side request forgery"
    publisher: "VulDB via CVE Program · 16 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/19xxx/CVE-2026-19956.json"
  - title: "SSRF in fetch_pagination_url — facebook-ads-mcp-server"
    publisher: "GoMarble AI · 27 June 2026"
    url: "https://github.com/gomarble-ai/facebook-ads-mcp-server/issues/29"
  - title: "fix: prevent SSRF in pagination fetcher"
    publisher: "GoMarble AI · 20 July 2026"
    url: "https://github.com/gomarble-ai/facebook-ads-mcp-server/pull/32"
  - title: "fix: prevent SSRF in pagination fetcher (#32)"
    publisher: "GoMarble AI · 20 July 2026"
    url: "https://github.com/gomarble-ai/facebook-ads-mcp-server/commit/4e53875aa22e8991c2fa4a7660d86e1caba66659"
---

An MCP tool that follows a “next page” link may look like plumbing. In an agent workflow, however, it is a network-capable action: if the caller controls the destination, the tool can become a route from model input to services the model was never meant to reach.

## What the new CVE establishes

The CVE Program published CVE-2026-19956 on 16 August. The record identifies a server-side request forgery flaw in version 0.1.0 of GoMarble AI's open-source Facebook Ads MCP server and points to a merged patch. It rates the issue medium severity, but deployment context determines the practical risk.

The affected `fetch_pagination_url` tool accepted a complete URL and passed it to the server's HTTP client. The project's issue report says the path did not validate the destination host, address range, protocol, redirects, or request duration. Because the server performed the request and returned JSON to the MCP client, a caller could potentially make it contact another service reachable from that process.

That finding does not establish exploitation or affected deployments. It establishes a vulnerable capability and a corrected code path. Reachability depends on whether the tool is enabled, who or what can invoke it, which network destinations the process can reach, and whether untrusted content can influence agent decisions.

## Why agent tools change the trust calculation

Traditional SSRF review asks whether a user can place an arbitrary URL into a server-side fetch. MCP adds another decision-maker between input and action: the model. A user may not need direct protocol access if content presented to an agent can persuade it to call a permissive tool. That makes tool descriptions, argument schemas, approval rules, and prompt-injection resistance relevant—but none is a substitute for destination enforcement.

Pagination is a useful example because a full URL is convenient and often includes all state required for the next request. Convenience can quietly widen authority. A function intended to continue one trusted API conversation should not inherit permission to reach every address visible from its host.

The strongest policy is therefore positive and local to the action: accept only the scheme, hostname, and port required for the business function. Apply the same check after any redirect, or disable redirects when they are unnecessary. Network egress controls should independently deny loopback, link-local, private, management, and metadata destinations that the workload does not need.

## What the patch changes

The merged pull request restricts pagination URLs to HTTPS on the exact `graph.facebook.com` hostname, permits only the default port or 443, rejects embedded credentials and malformed input, disables redirect following, and adds a 30-second timeout. The project says it tested legitimate pagination along with deceptive hostnames, alternate destinations, malformed ports, and control-character variations.

Those choices are more defensible than a denylist. Private-address checks alone can miss alternate address forms, name-resolution changes, or redirects. An exact origin allowlist expresses the tool's purpose directly: this capability exists to continue requests to one API, not to fetch arbitrary web resources.

The CVE record names version 0.1.0 as affected, while the repository does not present a numbered release on its main page. Defenders should therefore avoid assuming that reinstalling a package name proves remediation. The relevant evidence is whether the deployed source or image contains commit `4e53875aa22e8991c2fa4a7660d86e1caba66659` or an equivalent downstream fix.

## Turn the fix into deployment proof

Inventory where this MCP server is configured, including desktop clients, shared agent hosts, containers, automation runners, and one-click installers. Record the source URL, revision, installation method, execution identity, available credentials, and network boundary. Forks and cached copies need separate checks because an upstream merge does not update running code.

After updating, test safely in a non-production environment. Confirm that valid API pagination still works, disallowed schemes and destinations fail before network access, redirects cannot cross the boundary, and timeouts are enforced. Observe outbound DNS and connection telemetry during the test rather than relying only on the tool's response.

Finally, apply the lesson across the tool catalog. Flag every MCP action that accepts a URL, hostname, repository, callback, webhook, or remote file reference. For each one, define the smallest destination set its purpose requires and enforce that policy both in code and at egress. The durable control is not that an agent usually chooses the right URL; it is that the tool cannot send the request anywhere else.
