---
title: "UI-TARS MCP Flaw Makes Local Binding a Security Boundary"
subtitle: "A critical agent-server flaw shows why powerful tools need both network containment and independently verified build provenance."
description: "CVE-2026-81735 exposed UI-TARS MCP tools beyond the host; defenders must verify fixed commit lineage, listener scope, and tool authority."
date: 2026-08-28 11:09:40 +0400
layout: post
category: ai-security
tags: [AI-agents, MCP, vulnerability-management, network-security]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-28-ui-tars-mcp-needs-local-boundary-proof.svg
image_alt: "Abstract AI agent core enclosed by a luminous local boundary while external network paths stop at the perimeter"
key_points:
  - "CVE-2026-81735 concerns UI-TARS MCP command and filesystem servers reachable without authentication."
  - "The correction changes the default listener from all interfaces to the local loopback address."
  - "Because the package version did not change, defenders must verify commit lineage as well as network state."
sources:
  - title: "UI-TARS-desktop @agent-infra MCP Servers Bind Every Interface Without Authentication, Exposing Arbitrary Command Execution"
    publisher: "CVE Program · August 27, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/81xxx/CVE-2026-81735.json"
  - title: "fix(mcp-http-server): default host to 127.0.0.1, not all interfaces"
    publisher: "UI-TARS-desktop · July 1, 2026"
    url: "https://github.com/bytedance/UI-TARS-desktop/commit/c2ad42e3eb9b27830db41a3e6f51ca7179d9b168"
  - title: "UI-TARS-desktop"
    publisher: "ByteDance · accessed August 28, 2026"
    url: "https://github.com/bytedance/UI-TARS-desktop"
---

A newly published critical vulnerability in UI-TARS-desktop turns a quiet network default into an urgent inventory question. CVE-2026-81735 describes Model Context Protocol servers with command and filesystem authority listening beyond the local machine without requiring authentication. For defenders, the issue is not simply whether an AI application is installed. It is whether a capability-bearing service is reachable, which build produced it, and what authority its process holds.

## What the record establishes

The CVE record was published on August 27 and assigns CVE-2026-81735 a critical CVSS 4.0 score of 10.0. It concerns the `@agent-infra` MCP components in the UI-TARS-desktop repository. According to the record, the shared HTTP server defaulted to the IPv6 unspecified address, represented as `::`, when callers supplied no host. That choice can make a listener available on network interfaces rather than confining it to the machine itself.

The same record says authentication middleware was optional and that the command and filesystem server entry points did not supply it. A client able to reach the port could therefore invoke tools without presenting a credential. Those tools included operating-system command execution and file read or write capabilities, exercised with the authority of the account running the service.

This is a vulnerability disclosure, not an incident report. The sources do not establish exploitation in the wild, identify affected organizations or document a breach. The urgency follows from the exposed capability and unauthenticated network path.

## The fix has an unusual proof requirement

The maintainer merged commit `c2ad42e3eb9b27830db41a3e6f51ca7179d9b168` on July 1. The visible change replaces the all-interface fallback with `127.0.0.1`, so an unspecified host defaults to IPv4 loopback. That meaningfully narrows reachability: another machine should not be able to connect directly to a service bound only to the local interface.

However, the CVE record says the affected package remained at version 1.2.4 across the change. A version string alone therefore cannot distinguish code before the correction from code after it. Defenders need provenance at commit or artifact level: the deployed source tree, lockfile resolution, package digest, software bill of materials, image build record or another trustworthy artifact must show that the correction is present.

The patch changes the default network boundary; it should not be interpreted as proof that every deployment now authenticates every request. Explicit host settings, wrappers, containers, proxies and downstream forks can alter effective exposure. Local reachability also still matters when untrusted workloads or multiple users share a host.

## Inventory the capability, not just the application

Start with developer workstations, AI experimentation hosts, CI workers, shared jump systems and containers that may run UI-TARS-desktop or its `@agent-infra` MCP packages. Record the actual listening address and port from the running system, then map which networks, namespaces and local users can reach it. Do not infer safety from a configuration file if the live socket says otherwise.

Next, identify the service account and enumerate the authority available to that process. Command and filesystem tools make the consequences depend on filesystem permissions, mounted secrets, cloud credentials, developer tokens and reachable internal services. Remove unnecessary privileges and mounts, isolate experimental agents from sensitive environments, and constrain outbound and lateral network paths.

Where remote MCP access is intentionally required, loopback is not a complete architecture. Put authentication and authorization at the service boundary, limit allowed clients, protect transport, and separate read, write and execution capabilities rather than treating access to the endpoint as permission to use every tool.

## Turn the correction into durable evidence

Update to an artifact demonstrably containing the fixing commit or a later descendant, then restart the service and verify its live listener. Retain the artifact identifier and network observation with the change record. If provenance cannot be established, rebuild from a known corrected revision instead of accepting the unchanged package version as proof.

Finally, add a deployment test that fails when a capability-bearing MCP server unexpectedly binds beyond loopback or starts without the intended access control. AI agents compress many powerful actions behind a small protocol surface. That makes listener scope, identity checks and per-tool authority first-class security controls—not implementation details.
