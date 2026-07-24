---
title: "Fooocus Metadata Flaw Turns Imported Images Into Active Input"
subtitle: "A newly disclosed code-execution path shows why AI image interfaces must treat embedded metadata as untrusted program input."
description: "A Fooocus flaw can turn imported image metadata into code execution, making UI exposure, workload isolation, and input trust immediate priorities."
date: 2026-07-25 03:09:07 +0400
layout: post
category: ai-security
tags: [fooocus, ai-infrastructure, metadata-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-07-25-fooocus-metadata-needs-an-input-boundary.svg
image_alt: "Abstract image tile carrying layered metadata shapes stopped at a luminous boundary before an isolated AI image workspace"
key_points:
  - "GitHub Security Lab says crafted image metadata can reach unsafe evaluation in Fooocus v2.5.5."
  - "The disclosure identifies potential remote code execution but does not report exploitation or victims."
  - "Until a released repair is verified, restrict access, reject untrusted imports, and isolate the workload."
sources:
  - title: "GHSL-2024-196: Remote Code Execution (RCE) in Fooocus webui - CVE-2025-31114"
    publisher: "GitHub Security Lab · 24 July 2026"
    url: "https://securitylab.github.com/advisories/GHSL-2024-196_Fooocus/"
  - title: "Release v2.5.5"
    publisher: "Fooocus on GitHub · 12 August 2024"
    url: "https://github.com/lllyasviel/Fooocus/releases/tag/v2.5.5"
  - title: "lllyasviel/Fooocus"
    publisher: "GitHub · accessed 25 July 2026"
    url: "https://github.com/lllyasviel/Fooocus"
---

A newly published vulnerability in the Fooocus image-generation web interface makes an ordinary-looking image import a security boundary. GitHub Security Lab says specially prepared metadata can reach unsafe evaluation in the application and potentially execute code on the host.

The disclosure concerns CVE-2025-31114 and was published on 24 July after an extended attempt at coordinated disclosure. It is a vulnerability report, not evidence of attacks: the reviewed sources identify no exploitation, victims or measured impact. The immediate defensive issue is whether an untrusted person can reach the interface or persuade an authorized user to import an untrusted image.

## What the disclosure establishes

GitHub Security Lab tested Fooocus v2.5.5. Its advisory says the application reads generation parameters embedded in image metadata and passes several values into Python’s `eval` function while reconstructing settings such as styles, resolution and guidance values. Because those metadata fields are controlled by the imported file, the parser can treat data as executable expressions rather than inert configuration.

The reported path is available through the web interface’s metadata-import behavior. The advisory concludes that an attacker with access to the interface may be able to execute arbitrary code on the Fooocus instance by supplying a modified image. ShadowContext is deliberately omitting the construction details because defenders do not need a working payload to identify exposure or reduce risk.

The disclosure timeline says the issue was first raised in August 2024, followed by private contact in October 2024, without a maintainer response. On 24 July 2026 the researcher published a proposed repair. The advisory does not identify a fixed release. GitHub still labels v2.5.5—the tested version, released in August 2024—as the project’s latest release.

## An image is more than pixels

Defenders often apply strong controls to model files and plugins while treating uploaded images as passive content. This case shows the gap in that assumption. An image can carry structured metadata that influences application state, and a convenience feature that restores generation settings can quietly become an interpreter for attacker-controlled input.

That lesson extends beyond one interface. AI media workflows routinely move files between public galleries, collaboration tools, asset stores and local generation environments. Renaming a file or previewing its pixels does not establish that its metadata is safe. Security reviews should map every parser invoked during upload, import, indexing and workflow restoration, then ask whether any field reaches dynamic evaluation, command execution, deserialization or filesystem operations.

The correct trust boundary is the complete file and every parser that consumes it. Content-type checks and image decoding alone do not neutralize auxiliary data.

## Reduce reachability before testing fixes

Teams should first find Fooocus deployments by checking endpoint software, GPU workstations, lab servers, container inventories and cloud instances. Confirm the running code locally; do not assume that a service named only “image UI” or “creative AI” uses a different stack.

Next, determine who can reach the web interface. The project documentation says its listening and sharing options can expose the UI and that access is unauthenticated by default unless basic authentication is configured. Remove internet exposure, disable temporary sharing endpoints and restrict access to named users through an existing authenticated gateway. Authentication reduces who can deliver input, but it does not repair the unsafe parser.

Until a released fix has been independently verified, do not import images or metadata from untrusted sources. If metadata restoration is not essential, suspend that workflow. Run the service as a dedicated non-privileged account or container, with no host-management socket, broad home-directory mount, credential store or shared production data. Limit outbound connectivity to documented model and storage destinations.

## Make remediation evidence-based

A proposed source change is not the same as a supported update. Teams that choose to apply or backport it assume responsibility for code review, packaging and regression testing. Validation should confirm that metadata fields are parsed with strict, type-aware routines and that malformed or unexpected values fail closed without reaching a general-purpose evaluator.

After any change, test normal image imports, metadata-free files and deliberately malformed metadata in an isolated environment without turning the exercise into exploit reproduction. Verify the exact deployed commit or package on every node and preserve the evidence in the remediation record.

Longer term, decide whether an application with an unresolved disclosure and an older release cadence belongs in a reachable service tier. The durable control is not merely replacing one unsafe call. It is ensuring that creative files remain data, parsers have minimal authority, and an AI workspace cannot inherit the privileges of the person or system hosting it.
