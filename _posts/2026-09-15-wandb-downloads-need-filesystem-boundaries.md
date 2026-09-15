---
title: "W&B Downloads Need a Filesystem Boundary"
subtitle: "A newly catalogued SDK flaw shows why machine-learning artifacts must not choose where their own files are written."
description: "CVE-2026-91771 affects W&B SDK releases before 0.29.0; defenders should update clients and isolate artifact-download workflows."
date: 2026-09-15 14:11:49 +0400
layout: post
category: ai-security
tags: [machine-learning, artifact-security, python, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-15-wandb-downloads-need-filesystem-boundaries.svg
image_alt: "Abstract violet artifact tiles entering a protected teal download chamber bounded by layered filesystem paths"
key_points:
  - "CVE-2026-91771 affects the W&B Python SDK before version 0.29.0."
  - "A backend-supplied filename could escape the intended download directory."
  - "Update every downloading runtime and constrain where artifact clients can write."
sources:
  - title: "Weights & Biases wandb before 0.29.0 Path Traversal via File Download"
    publisher: "VulnCheck CNA · September 15, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/91xxx/CVE-2026-91771.json"
  - title: "fix(artifacts): validate path when using run file api to download (#12516)"
    publisher: "wandb/wandb · August 26, 2026"
    url: "https://github.com/wandb/wandb/commit/e52558f3a6a94ea816af74969a13a35e5904cad6"
  - title: "v0.29.0"
    publisher: "wandb/wandb · August 26, 2026"
    url: "https://github.com/wandb/wandb/releases/tag/v0.29.0"
---

A newly published CVE record identifies a path-traversal flaw in the W&B Python SDK for machine-learning workflows. CVE-2026-91771 affects versions before 0.29.0 and sits in a deceptively ordinary action: downloading a file described by a remote service.

The defensive lesson reaches beyond one SDK. An artifact's contents are not the only untrusted input. Its name and destination metadata can also cross into the local filesystem, where a training job or developer process may hold considerably more access than the download requires.

## What the new record confirms

The [VulnCheck-authored CVE record](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/91xxx/CVE-2026-91771.json) was published on September 15 at 01:20 UTC. It says W&B SDK releases earlier than 0.29.0 fail to validate filenames returned by a server to the `File.download` function. A filename containing traversal elements could cause the client to write outside its intended download directory.

The record rates the issue High, at 8.8 under CVSS 3.1 and 8.7 under CVSS 4.0. Its stated precondition matters: an attacker must control the backend response, and a user or process must perform the download. This is a vulnerability advisory, not a report of compromise; the reviewed sources do not report exploitation or affected victims.

W&B's [corrective commit](https://github.com/wandb/wandb/commit/e52558f3a6a94ea816af74969a13a35e5904cad6) shows the repaired design. The download path now passes through filesystem-path validation, and related artifact download and checkout paths reject relative traversal and absolute-path forms. The change also adds negative tests for path handling rather than relying on a single string-cleaning case.

## Treat the client as the exposed component

The vulnerable component is the Python SDK performing the write, not simply the server storing metadata. Inventory therefore needs to find every runtime that downloads run files or checks out artifacts: developer environments, notebooks, training clusters, evaluation jobs, automated promotion pipelines and long-lived container images.

Start with the imported version in the actual Python environment. A newer dependency declaration does not prove that a running notebook kernel, cached virtual environment or prebuilt worker image has moved. Record the interpreter environment, installed `wandb` version, owner and whether the workflow retrieves files from hosted, self-managed or otherwise intermediary-controlled infrastructure.

Prioritise downloaders that run with broad filesystem permissions, consume data from shared projects, or turn downloaded files into later pipeline inputs. Backend control should be treated as a threat-model condition rather than an allegation. DNS, proxy and certificate failures, weak administration of a self-managed service, or an untrusted project boundary can all change who influences a response; the CVE itself does not establish that any of those conditions exists in a particular deployment.

## Update and narrow the write boundary

Upgrade affected environments to [W&B SDK 0.29.0](https://github.com/wandb/wandb/releases/tag/v0.29.0) or later, rebuild dependent images, and restart persistent Python processes so they load the corrected package. The release was published on August 26; the newly published CVE now gives security teams a precise identifier and affected range for tracking that earlier fix.

Keep containment controls independent of the patch. Run artifact retrieval under a dedicated, low-privilege identity with a narrow writable workspace. Mount source, configuration, credential and executable locations read-only where the workflow permits. Separate download from execution or import, and promote files only after type, provenance and integrity checks appropriate to the artifact.

Network trust should be equally explicit. Authenticate the service endpoint, restrict client egress to approved destinations and review proxies or mirrors that can alter responses. These controls reduce the consequences of a failed trust assumption, but they do not replace local path validation.

## Close with a safe negative test

After rollout, capture the version from every runtime that performs downloads and verify a normal artifact retrieval still lands inside its assigned workspace. In an isolated test environment, use harmless invalid metadata to confirm the client rejects names that resolve outside that workspace; there is no need to attempt code execution or write into sensitive locations.

Monitor the workspace for unexpected new paths and retain the artifact source, digest, downloader identity and final destination in pipeline records. CVE-2026-91771 is a compact example of a durable rule: remote metadata must describe an artifact, not define the reach of the local process that receives it.
