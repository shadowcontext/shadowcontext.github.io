---
title: "Known Exploitation Makes AI Control-Plane Inventory Urgent"
subtitle: "New KEV entries for Kestra and LiteLLM turn version, reachability and connected authority into immediate evidence requirements."
description: "CISA's latest KEV additions show why defenders must inventory, patch and constrain AI workflow engines and MCP gateways as control planes."
date: 2026-09-03 11:12:01 +0400
layout: post
category: ai-security
tags: [AI-security, vulnerability-management, MCP, control-plane]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-03-ai-control-planes-need-runtime-proof.svg
image_alt: "Two abstract blue control-plane cores enclosed by layered security rings while amber network paths are filtered at the boundary"
key_points:
  - "CISA added Kestra CVE-2026-49869 and LiteLLM CVE-2026-59822 to its Known Exploited Vulnerabilities catalog."
  - "The flaws cross different boundaries: workflow execution in Kestra and MCP tool access in LiteLLM."
  - "Defenders need runtime proof of fixed versions, constrained reachability and least-privilege downstream connections."
sources:
  - title: "CISA Adds Seven Known Exploited Vulnerabilities to Catalog"
    publisher: "Cybersecurity and Infrastructure Security Agency · September 2, 2026"
    url: "https://www.cisa.gov/news-events/alerts/2026/09/02/cisa-adds-seven-known-exploited-vulnerabilities-catalog"
  - title: "Unauthenticated Remote Code Execution via Authentication Bypass in `AuthenticationFilter`"
    publisher: "Kestra · June 3, 2026"
    url: "https://github.com/kestra-io/kestra/security/advisories/GHSA-5vc5-wxxq-3fjx"
  - title: "MCP Authentication Bypass via OAuth2 Passthrough Fallback"
    publisher: "LiteLLM · June 30, 2026"
    url: "https://github.com/BerriAI/litellm/security/advisories/GHSA-7488-6r32-c95q"
---

Two AI infrastructure vulnerabilities have moved from disclosed defects to known-exploited priorities. CISA added flaws in Kestra and LiteLLM to its catalog on 2 September, giving defenders a timely reason to examine systems that may be missing from conventional server inventories but can reach workflows, models, tools and credentials.

## What changed on September 2

The US Cybersecurity and Infrastructure Security Agency added seven vulnerabilities to its Known Exploited Vulnerabilities catalog, including CVE-2026-49869 in Kestra and CVE-2026-59822 in LiteLLM. A KEV entry means CISA has evidence that a vulnerability has been exploited in the wild. It does not establish that every exposed deployment has been targeted or compromised.

CISA set 5 September as the required-action date for covered US federal systems affected by the Kestra flaw and 16 September for the LiteLLM flaw. Those mandates apply to the federal civilian executive branch, but the exploitation signal is relevant to any operator. The practical priority is to identify the actual runtime, remove avoidable exposure and apply the vendor fixes—not merely add two CVE numbers to a scanner queue.

The original advisories predate the catalog update. What is new is the evidence-based reprioritisation. That distinction matters because a June ticket judged against a normal maintenance cycle now deserves an immediate deployment check.

## Two products, two different authority boundaries

Kestra describes CVE-2026-49869 as an authentication bypass affecting Kestra OSS through version 1.3.20. The project lists 1.0.45 and 1.3.21 as patched versions for the relevant release lines. According to the advisory, an overly broad path check can let an unauthenticated requester reach operations that create and execute workflows. Because workflow engines are designed to run tasks, a web-layer identity failure can cross directly into execution authority.

LiteLLM's CVE-2026-59822 affects versions before 1.84.0 and is fixed in 1.84.0 or later. Its advisory says a fallback in OAuth2 passthrough could accept an arbitrary bearer token for the MCP Streamable HTTP endpoint, allowing access to configured MCP tools without a valid LiteLLM key. The vendor recommends upgrading; if that cannot happen immediately, it recommends disabling MCP routes or blocking `/mcp/` and related endpoints at a reverse proxy or API gateway.

These are not interchangeable "AI vulnerabilities." Kestra is an orchestration and workflow boundary; LiteLLM is a gateway and tool-access boundary. The defensive lesson is shared, however: authentication strength must be evaluated together with what the service can cause downstream.

## Build a runtime inventory, not a package list

Start with four fields for each deployment: running version, reachable interfaces, enabled features and connected authority. A software bill of materials may identify a dependency, but it will not prove which container is live, whether an older image was restarted after an apparent upgrade, or whether an MCP route is enabled.

For Kestra, verify the running release on every worker and web component, then confirm that network controls expose management and execution interfaces only to intended callers. Review the identities available to workflows, including cloud roles, secret stores and service accounts. Reducing those permissions limits consequence even after the application is fixed.

For LiteLLM, enumerate gateways, confirm version 1.84.0 or later, and test that rejected credentials fail closed at the external boundary and at the application. Inventory every configured MCP server and tool, its destination, and the credential it receives. An authenticated session should not automatically inherit broad tool authority.

## Preserve proof after remediation

An image tag, change ticket or successful pipeline is not enough evidence that the exposed service changed. Record the observed pre-update version, deployment identifier, fixed artifact digest, restart time and post-update version. From an untrusted network position, confirm that management or MCP endpoints are either unreachable or enforce the intended authentication policy.

Also search logs for unexpected workflow creation, execution, MCP sessions and tool calls, using the retention available in each environment. This is prudent validation after a known-exploited signal, not proof that exploitation occurred. Escalate only when evidence supports it.

Finally, keep AI infrastructure in the same emergency-patching and exposure-review process as other control planes. These systems are powerful precisely because they connect services and automate actions. Their security state therefore has to be demonstrated at runtime, where version, identity, reachability and downstream authority meet.
