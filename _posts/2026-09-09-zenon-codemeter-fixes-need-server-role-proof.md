---
title: "Zenon CodeMeter Fixes Need Server-Role Proof"
subtitle: "Five licensing-runtime flaws make configuration, reachability, and running-version evidence part of one industrial update."
description: "ABB says five CodeMeter flaws affect some zenon installations. Defenders should map license-server roles, restrict reachability, and verify the fixed branch."
date: 2026-09-09 20:13:54 +0400
layout: post
category: defense
tags: [industrial-security, vulnerability-management, network-segmentation, asset-inventory]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-09-zenon-codemeter-fixes-need-server-role-proof.svg
image_alt: "Abstract industrial control panels surrounding a protected licensing core, with an amber network path stopped by segmented cyan barriers"
key_points:
  - "The advisory covers zenon 14 and older when the affected CodeMeter component is present."
  - "Four of the five vulnerabilities require CodeMeter to operate as a network or license server."
  - "Defenders should update, restrict license-service reachability, and verify the correct fixed branch."
sources:
  - title: "ABB AbilityTM zenon Security Risk Due to High-Severity Vulnerabilities in WIBU CodeMeter Runtime"
    publisher: "ABB PSIRT · September 9, 2026"
    url: "https://search.abb.com/library/Download.aspx?Action=Launch&DocumentID=2NGA003144&DocumentPartId=&LanguageCode=en"
---

ABB has published a security advisory covering five vulnerabilities in the Windows licensing component included with some ABB zenon Software Platform installations. The affected surface is not uniform: one flaw requires local access, while four become remotely reachable only when CodeMeter Runtime is configured as a network or license server.

That distinction gives defenders a concrete first move. Find the component, establish its live role and network exposure, then update and prove that the corrected runtime—not merely an installer or package record—is active.

## What ABB has confirmed

The [ABB advisory](https://search.abb.com/library/Download.aspx?Action=Launch&DocumentID=2NGA003144&DocumentPartId=&LanguageCode=en), dated September 9, says the vulnerabilities affect zenon Software Platform version 14 and older when an installation includes CodeMeter Runtime for Windows for software licensing or license management. ABB recommends updating to version 8.41a or later. Its per-vulnerability details also identify 9.10 as the corrected floor for the 9.x line, so teams using that branch should verify the supported target rather than treating any 9.x build as fixed.

The five identifiers are CVE-2026-81572 through CVE-2026-81576. ABB assigns CVSS 3.1 base scores from 7.5 to 8.6. The stated consequences vary by flaw and can include local privilege escalation, access to or modification of configuration and licensing information, service disruption, and loss of system integrity.

Scope needs careful handling. CVE-2026-81572 requires a low-privileged user able to execute locally on an affected Windows system. The other four vulnerabilities are remotely exploitable only when CodeMeter Runtime is configured as a network server, which ABB says is not the default. Systems that do not include or use the affected component are not impacted. ABB also says it had received no information indicating exploitation when the advisory was issued.

## Inventory the role, not just the product

A zenon version record alone cannot answer whether the vulnerable component is present, which CodeMeter build is running, or whether the host provides licensing over the network. Build an exposure record for each zenon engineering station, runtime host, server, standby system, and recovery image. Capture the operating system, zenon version, installed and running CodeMeter version, service state, and whether network-server functionality is enabled.

Then map reachability from the service boundary. Record which subnets and administrative systems can connect to the licensing service, including remote-support paths and temporary engineering access. A firewall rule intended for one peer can become broad exposure if it accepts an entire office, vendor, or shared-services network.

Do not assume that “non-default” means absent. Installation templates, inherited configurations, migrations, or operational licensing requirements may have enabled the server role years ago. Query live configuration and listening services, and assign an owner to reconcile anything that differs from design documentation.

## Reduce exposure while updating

ABB recommends version 8.41a or later and says customers should apply the update at the earliest convenience. For the 9.x branch, use the 9.10 floor stated in the vulnerability details. Follow the supported maintenance procedure, coordinate with operations, and test licensing-dependent functions before production rollout. Where immediate updating is not feasible, the vendor recommends risk assessment, network isolation, access restrictions, and enhanced monitoring.

For a network license server, allow inbound traffic only from systems that require licensing and block general user, guest, internet, and unrelated operational segments. Keep engineering workstations and special-purpose automation networks separated from general-purpose networks. These controls reduce exposure; they do not repair the component.

Local access also matters because one flaw does not depend on the server role. Limit interactive and remote logon rights, remove unnecessary local accounts, and avoid using a licensing host as a general administration workstation. Apply least privilege without disrupting the operational identities the platform legitimately needs.

## Prove the corrected runtime is active

Closure should connect software state to service behavior. After updating, confirm the CodeMeter version from the running host, restart or reboot as required by the supported procedure, and verify that the newly started service loaded the intended build. Check every active, standby, and recoverable instance; an old image can restore exposure later even when production is current today.

Test normal license acquisition from approved clients and confirm that unauthorized network segments cannot reach the service. Monitor service stops, configuration changes, rejected connections, and unexpected licensing requests through existing defensive telemetry. Those signals support operations and investigation, but none alone proves exploitation.

The durable outcome is precise: every in-scope zenon installation has a known licensing role, any required network service has a narrow path, and each running CodeMeter component meets the correct fixed floor for its branch. That evidence is stronger than treating one platform-level update result as proof for an embedded service with its own configuration and exposure.
