---
title: "n8n Agent Tools Need One Authorization Path"
subtitle: "A patched policy bypass shows why AI tool calls must inherit the same controls as direct workflow execution."
description: "CVE-2026-86996 shows how an n8n agent-tool path bypassed a workflow caller policy, and what defenders should verify after updating."
date: 2026-09-09 21:12:49 +0400
layout: post
category: ai-security
tags: [AI agents, n8n, authorization, workflow security, CVE-2026-86996]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-09-n8n-agent-tools-need-one-authorization-path.svg
image_alt: "Abstract agent node passing through a restored authorization boundary toward protected workflow layers"
key_points:
  - "Update affected n8n deployments to 2.37.7, 2.38.2 or a later fixed release."
  - "Inventory restricted workflows exposed as agent tools, not only direct workflow links."
  - "Test authorization at every invocation path and record the effective caller identity."
sources:
  - title: "Agent Workflow Tool Bypasses Sub-Workflow Caller Policy"
    publisher: "n8n · 2 September 2026"
    url: "https://github.com/n8n-io/n8n/security/advisories/GHSA-7hgx-277f-7vmg"
  - title: "n8n: Agent Workflow Tool Bypasses Sub-Workflow Caller Policy"
    publisher: "CVE Program · 8 September 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/86xxx/CVE-2026-86996.json"
---

An authorization rule is only as strong as the least-governed route into the protected action. A newly published n8n vulnerability makes that principle concrete for AI-enabled automation: a workflow restriction applied to ordinary sub-workflow execution did not apply when the same workflow was presented to an Agent as a tool.

## What the advisory confirms

n8n's advisory says the setting “This workflow can be called by” was enforced by the Execute Workflow node, but was not consulted when a workflow was attached to an Agent as a tool. A user who was allowed to build an Agent could therefore invoke a workflow its owner had restricted and read the data that workflow returned.

The issue is tracked as CVE-2026-86996 and GHSA-7hgx-277f-7vmg. The CVE record identifies missing authorization as the weakness and gives it a CVSS 4.0 score of 5.3, or Medium. Its stated conditions include network reachability, low privileges and no user interaction. That rating should not replace local analysis: a restricted workflow returning sensitive operational data may matter more in one deployment than another.

The vendor lists versions earlier than 2.37.7 as affected, along with the 2.38 line from 2.38.0 up to but excluding 2.38.2. It identifies 2.37.7 and 2.38.2 as fixed versions and recommends upgrading to either of those releases or later. Neither primary source claims exploitation in the wild, and this article does not infer that any deployment was compromised.

## Why the agent path changes the trust boundary

Workflow platforms increasingly expose established automations as tools that an agent can select. That reuse is useful, but it adds a new invocation path. The caller is no longer simply another workflow node following a familiar execution route; it may be an agent configuration created by a user with a different role, project membership or business purpose.

The defensive lesson is broader than one setting. Authorization must be evaluated where the protected workflow begins, using an identity and context that survive every intermediary. A permission check performed only in the conventional caller can be bypassed whenever a plugin, API, scheduler or agent tool reaches the same operation through another adapter.

Agent builders should not be treated as implicitly trusted to use every tool they can reference. Tool discovery, attachment and execution are separate control points. A sound design can restrict what appears in the tool catalogue, reject unauthorized attachment, and still re-check policy at execution. The final check is essential because configurations, ownership and memberships can change after an agent is created.

## Patch, then map every exposure

Administrators should first establish the running n8n version on every instance and update affected systems through their normal tested release process. Do not use a package manifest, container tag or deployment ticket as the sole proof of remediation; confirm the version in the running service after rollout.

The vendor's temporary measures are narrower access to fully trusted users, auditing workflows attached as Agent tools, and removing sensitive workflows from agent-tool configurations until the update is complete. The advisory explicitly says these measures do not fully remediate the issue. They are containment steps, not substitutes for the fixed release.

The inventory should join three records: workflows with caller restrictions, agents that expose workflow tools, and users or projects permitted to create or modify those agents. Prioritize combinations where the workflow can return credentials, customer information, administrative output or the result of a privileged downstream action. The flaw described by n8n concerns returned data, but defenders should review both read and write capabilities because the same authorization architecture governs business impact.

## Prove the policy at runtime

After updating, create regression tests that attempt the same restricted workflow through each supported entry point: direct execution, sub-workflow nodes, agent tools, APIs and scheduled paths where applicable. Use accounts from different projects and roles. A passing test should show that permitted calls succeed, prohibited calls fail closed, and the audit record identifies the human or service principal responsible for the action.

Logging should capture the agent, tool, target workflow, effective caller, project or tenant, authorization result and policy version without recording secrets or full sensitive outputs. Alert on repeated denials and on newly attached high-impact tools, but do not mistake an absence of denials for proof that controls are operating.

The durable control is one policy decision at the protected resource, fed by consistent identity context. Agent tooling can change how an action is requested; it must not change who is allowed to perform it.
