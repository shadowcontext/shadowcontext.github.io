---
title: "Telerik Fixes Need Handler and Key-Exposure Proof"
subtitle: "Two Web Forms flaws make component use, file permissions and cryptographic-key history part of patch validation."
description: "Progress fixed two Telerik UI for ASP.NET AJAX flaws; defenders should verify versions, active handlers, file permissions and key exposure."
date: 2026-09-03 05:14:19 +0400
layout: post
category: defense
tags: [Telerik, web-security, vulnerability-management, key-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-03-telerik-fixes-need-handler-and-key-proof.svg
image_alt: "Abstract web editor panels behind a shielded file corridor, with a sealed key boundary separating folders from incoming requests"
key_points:
  - "Telerik UI for ASP.NET AJAX releases through 2026.2.708 should move to 2026.3.812 or later."
  - "RadImageEditor can expose files, while a separate RadEditor flaw requires particular key and feature conditions."
  - "Closure needs proof of the running library, enabled handlers, filesystem rights and historical key exposure."
sources:
  - title: "RadImageEditor Path Traversal Vulnerability (CVE-2026-18672)"
    publisher: "Progress Telerik · updated September 2, 2026"
    url: "https://www.telerik.com/products/aspnet-ajax/documentation/knowledge-base/kb-security-rie-path-traversal-cve-2026-18672"
  - title: "DialogHandler UploadPaths Tampering Vulnerability (CVE-2026-19219)"
    publisher: "Progress Telerik · updated September 2, 2026"
    url: "https://www.telerik.com/products/aspnet-ajax/documentation/knowledge-base/kb-security-dialoghandler-uploadpaths-tampering-cve-2026-19219"
  - title: "Progress Software security advisory (AV26-875)"
    publisher: "Canadian Centre for Cyber Security · September 2, 2026"
    url: "https://www.cyber.gc.ca/en/alerts-advisories/progress-software-security-advisory-av26-875"
---

Progress has updated guidance for two high-severity vulnerabilities in Telerik UI for ASP.NET AJAX. Both are fixed by the same release floor, but they do not create the same exposure. Defenders need to establish which controls an application actually uses before deciding what the update closes and what else requires review.

## What the advisories establish

The first issue, CVE-2026-18672, is a path-traversal vulnerability in `RadImageEditor`. Progress says insufficient validation of client-supplied state can let an unauthenticated attacker influence which file the image cache returns, potentially exposing content outside intended image directories. The control may be present directly or through the image-editor tool built into `RadEditor`. Progress assigns the flaw a CVSS 3.1 score of 7.5 and says no configuration mitigates it before an upgrade.

The second issue, CVE-2026-19219, concerns integrity protection for parameters used by `RadEditor` file-browser dialogs. Progress says altered parameters can influence folders used for reads, writes and uploads, potentially leading to remote code execution. It scores the issue 8.1, but the prerequisites are important: the built-in dialogs must be enabled, and an attacker must have obtained relevant application encryption-key material. Applications using the default auto-generated `machineKey` without a custom dialog-parameter key are not remotely forgeable through this vector, according to the vendor.

Progress directs installations from 2011.2.712 through 2026.2.708 to update to 2026.3.812 or later. Canada’s Cyber Centre independently lists versions before 2026.3.812 as affected and recommends applying the available updates. Neither cited source reports exploitation or an organizational compromise.

## Scope the application, not just the package

An inventory record that names Telerik UI is only a starting point. Teams should identify the library loaded by each deployed application, then determine whether `RadImageEditor` is used directly or embedded through `RadEditor`. They should separately record whether file-browser dialogs and `Telerik.Web.UI.DialogHandler.aspx` are enabled. Those facts distinguish exposure to one flaw from exposure to both.

Deployment evidence matters because .NET applications can carry local assemblies, use centrally managed dependencies or retain older binaries after a release. Confirm the version from the artifact actually running in each environment, including standby and disaster-recovery copies. A source manifest or build declaration is not enough if the deployed package differs.

For CVE-2026-19219, review key history as well as current configuration. Progress ties remote forgery to a custom `Telerik.Web.UI.DialogParametersEncryptionKey` or a statically configured `machineKey` whose material has been exposed or recovered by other means. A newly rotated key improves the present state, but it does not prove an earlier key was never available outside its intended boundary. Document where relevant keys were stored, who and what could read them, and whether the application accepted the same material across multiple environments.

## Patch with filesystem guardrails

Upgrade through Progress’s supported instructions to 2026.3.812 or a later fixed release, then verify the loaded version after restart or redeployment. Exercise normal image-editing and file-browser workflows without attempting to reproduce the vulnerabilities in production. Record the application, node, assembly version, enabled controls and test result in the change evidence.

Progress says upgrading is the only complete remediation for CVE-2026-19219. Until that can happen, its risk-reduction guidance includes removing affected `RadEditor` controls or disabling their file-browser dialogs and dialog handler. The vendor also recommends ensuring the application-pool identity cannot write to the web application root and disabling script execution in directories where it can write. These are useful containment measures, but they should not be recorded as equivalent to the fixed library.

The same permission review remains valuable after patching. An image or document feature rarely needs broad write access across an application tree. Separate content storage from executable paths, grant the worker identity only the directories and operations the feature requires, and alert on unexpected changes to handler configuration or writable locations.

## Close with four kinds of proof

A defensible closure record combines four facts: the fixed assembly is loaded; the relevant editor and handler features are known; application-pool filesystem permissions are narrow; and key exposure has been assessed rather than assumed away. This avoids two weak conclusions—treating every Telerik application as identically exposed, or treating a package update alone as evidence that surrounding deployment risks are controlled.

The broader lesson is that server-side UI components sit across several trust boundaries at once. Browser-supplied state, reusable encryption keys, file-browser handlers and operating-system permissions all shape the outcome. Version proof closes the disclosed defects; configuration and privilege proof keep the same pathways from becoming the next avoidable weakness.
