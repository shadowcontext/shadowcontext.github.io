---
title: "MCP Version Tools Need Package-Source Boundaries"
subtitle: "A patched MCP server flaw shows why dependency changes must be constrained before an agent can trigger them."
description: "CVE-2026-59176 turns a version-selection tool into a package execution path, making upgrades, tool controls, and source policy essential."
date: 2026-09-10 09:12:41 +0400
layout: post
category: ai-security
tags: [mcp, ai-agents, supply-chain-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-10-mcp-version-tools-need-package-source-boundaries.svg
image_alt: "Abstract package capsule passing through layered verification gates while an unsafe branch is contained outside an AI tool boundary"
key_points:
  - "CVE-2026-59176 affects functype-mcp-server through version 1.4.3; version 1.4.4 is patched."
  - "The vulnerable tool could install and load a package selected through an unconstrained version argument."
  - "Defenders should restrict tool access, package sources, runtime privilege, and outbound reachability."
sources:
  - title: "MCP `set_functype_version` Package Alias RCE via Unsanitized pnpm install + Dynamic Import"
    publisher: "functype maintainers via GitHub · June 20, 2026; reviewed September 9, 2026"
    url: "https://github.com/jordanburke/functype/security/advisories/GHSA-wcjj-9m6g-2fr2"
---

A version selector sounds administrative, not dangerous. In an MCP server, however, changing a dependency can cross directly into code execution. A newly reviewed advisory for `functype-mcp-server` makes that boundary concrete: a caller-controlled version value could select a package source, after which the server installed and loaded the resulting code.

The fix is to move to version 1.4.4. The wider defensive lesson is that agent tools which alter dependencies need the same approval, source and runtime controls as any other software installation path.

## What the advisory establishes

The maintainer advisory identifies CVE-2026-59176 as a high-severity vulnerability with a CVSS score of 7.8. It lists `functype-mcp-server` versions through 1.4.3 as affected and version 1.4.4 as patched. The issue was published to GitHub's reviewed advisory database on September 9.

According to the advisory, the MCP tool accepted a free-form version string and used it to construct a package specifier for installation. Package managers support more than ordinary semantic version numbers: a specifier can also describe alternate package sources or aliases. The server then dynamically imported code from the installed package. Together, those behaviors meant a caller able to invoke the tool could cause code to run with the MCP server process's privileges.

The advisory says the tool was enabled by default and required no authentication in the standard-input/output mode. That wording needs careful interpretation. Standard input/output is a local process transport, not automatically a remotely reachable service. Risk still depends on which client controls that process and whether the client can be influenced to call the tool. The advisory separately notes that non-default HTTP transport deployments may expose the path to network clients.

No exploitation in the wild, affected organizations or incident impact is claimed in the source. Defenders should treat this as a vulnerability and architecture problem, not evidence that any particular deployment was compromised.

## Inventory the complete execution path

Start by finding every installation of `functype-mcp-server`, including developer workstations, shared engineering hosts, CI runners, containers and prebuilt agent images. Record the running package version, transport type, enabled tool set, initiating client and operating-system identity. A lockfile in a source repository does not prove which copy is executing in a long-lived environment.

Upgrade affected instances to 1.4.4 and rebuild images that may preserve an older dependency. Then restart the relevant process and verify the loaded version from the live environment. Remove obsolete images and templates from deployment catalogs so the vulnerable tool does not return during rollback or workstation provisioning.

Tool reachability matters as much as version state. Determine whether `set_functype_version` is available to the connected assistant, whether calls require human approval, and whether untrusted documents or web content can influence that assistant's decisions. An agent need not be directly exposed to the internet for untrusted content to cross into a privileged tool call.

## Put policy before package installation

The patch constrains the accepted version syntax and suppresses package install scripts, according to the advisory. Operators can add durable controls around that correction. Permit only approved release identifiers; resolve them through a controlled registry or proxy; and reject alternate sources at the policy layer. Dependency changes should produce an auditable event containing the requesting identity, approved version, resolved artifact and integrity result.

Run the MCP server with a dedicated, low-privilege account and a narrowly mounted workspace. Keep production credentials out of its environment, make unrelated files unavailable, and restrict outbound traffic to required package infrastructure. Those measures do not replace the fixed release. They limit what a future package-resolution or import failure could reach.

For higher-risk environments, separate documentation lookup from dependency mutation. A read-oriented agent generally does not need authority to rewrite its own executable dependency set. If version switching is genuinely required, place it behind explicit approval and perform it in a disposable build context rather than inside the long-lived assistant process.

## Close with evidence, not configuration intent

A useful closure record should show the observed 1.4.4-or-later version, the process restart, the active transport, the exported tool list and the identity under which the server runs. It should also document allowed package sources, egress policy, approval behavior and which secrets or writable paths remain accessible.

Finally, test the control with benign invalid inputs: unsupported source forms should fail before package resolution, and rejected tool calls should leave dependencies unchanged. Avoid reproducing the advisory's code-execution path on operational systems.

CVE-2026-59176 is narrow in product scope, but its design lesson travels well. When an AI-facing tool can choose, install and immediately load software, its “version” field is not ordinary metadata. It is an execution boundary, and defenders should govern it accordingly.
