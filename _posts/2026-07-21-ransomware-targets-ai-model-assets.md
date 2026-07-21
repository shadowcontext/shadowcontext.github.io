---
title: "Ransomware Is Now Targeting AI Model Assets"
subtitle: "New threat research shows why exposed AI orchestration tools and recoverable model artifacts must enter the ransomware threat model."
description: "Sysdig observed ransomware built to encrypt AI models, vector indexes and training data after entry through a known Langflow flaw."
date: 2026-07-21 02:10:00 +0400
layout: post
category: ai-security
tags: [ransomware, AI security, Langflow, containers]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-21-ransomware-targets-ai-model-assets.png
image_alt: "AI model blocks, vector data, and backups segmented away from an isolated encryption wave"
key_points:
  - "Sysdig observed a ransomware payload designed to encrypt model files, vector indexes and training datasets."
  - "The reported intrusion reused a known Langflow flaw and abused exposed Docker control to reach the host."
  - "Defenders should isolate AI services, remove unnecessary Docker socket access and keep immutable model backups."
sources:
  - title: "JADEPUFFER evolves: The agentic threat actor deploys ransomware built to destroy AI models"
    publisher: "Sysdig Threat Research Team · 20 July 2026"
    url: "https://www.sysdig.com/blog/jadepuffer-evolves-the-agentic-threat-actor-deploys-ransomware-built-to-destroy-ai-models"
  - title: "Langflow Unauth RCE"
    publisher: "Langflow on GitHub · 17 June 2025"
    url: "https://github.com/langflow-ai/langflow/security/advisories/GHSA-rvqx-wpfh-mfx7"
---

Ransomware has moved closer to the assets that make an AI service distinct. Sysdig's Threat Research Team says an operator it tracks as JADEPUFFER returned to a previously compromised Langflow environment with ENCFORGE, a compiled encryptor whose target list includes model checkpoints, vector indexes and training datasets.

This is one research team's observation and attribution, not independent proof of a broad campaign. The defensive consequence is still immediate: AI infrastructure can fail even when conventional business databases remain intact, and a model that took months to refine may be much harder to recreate than an ordinary server.

## What Sysdig observed

Sysdig reported that the activity entered through CVE-2025-3248, an unauthenticated code-execution vulnerability in Langflow's code-validation endpoint. The flaw was publicly disclosed and patched in 2025; the associated GitHub advisory identifies Langflow versions before 1.3.0 as affected. In the new observation, the same entry path reportedly led to credential discovery, internal-service probing and access to the Docker control socket.

The researchers say the first attempt to retrieve the ransomware binary from inside the container failed. The activity then iterated through several scripts and, within minutes, found a way to use Docker's control interface and a privileged container to place the binary on the underlying host. Sysdig interprets the rapid, failure-specific corrections and other behavioural signals as evidence that an AI agent drove the operation. That assessment cannot be independently verified from the public report, so defenders should separate the proposed automation from the confirmed control failures it describes.

Those failures are familiar: an already-known internet-facing vulnerability, credentials accessible to an application process, and Docker authority powerful enough to escape the application's isolation. Whether the operator was autonomous or human-directed does not change the remediation priority.

## Why the payload matters

Sysdig's analysis found approximately 180 targeted file extensions. The list included common model and checkpoint formats, FAISS vector indexes, Parquet and Arrow data, and other artefacts used across AI development and inference. The researchers also found a mechanism for adding more AI-specific patterns to the encryptor's default list, which supports their conclusion that the targeting was deliberate rather than incidental.

The report says ENCFORGE encrypts files and renames them with a `.locked` suffix. Sysdig found no network or cloud-storage capability in the analysed binary and observed no exfiltration during this session. The evidence therefore supports a destruction-first, single-extortion event, not a confirmed data-theft campaign. A Windows build appears technically possible from code present in the sample; a macOS build was not confirmed.

For defenders, the novelty is the recovery dependency. A database can often be rebuilt from a clean backup and transaction logs. A model ecosystem may also require the exact training data, checkpoints, fine-tuning history, embedding indexes and configuration that produced the deployed result. Losing several of those layers at once turns restoration into reconstruction.

## Close the control path

First, find Langflow deployments and verify their running version, not merely the version declared in a repository. Systems still affected by CVE-2025-3248 should be upgraded, removed from public exposure until corrected, and investigated for prior access. Credentials available to a vulnerable process—through environment variables, files or instance metadata—should be treated as exposed and rotated after review.

Next, audit application containers for access to `/var/run/docker.sock`. A process that can command the Docker daemon may effectively control the host. Langflow does not need that access for normal operation, according to Sysdig. Remove the mount where possible; otherwise, tightly constrain the permitted API operations and alert on application processes creating privileged containers, using host process namespaces or mounting the host root filesystem.

Runtime monitoring should cover unexpected child processes beneath web applications, Docker API calls from application identities, namespace-crossing tools and rapid creation of `.locked` files in model stores. These behaviours remain useful even if infrastructure, filenames or payload hashes change.

## Make AI assets recoverable

Model weights, adapters, training data and vector indexes belong in the same recovery design as production databases. Keep offline or immutable copies outside the trust boundary of the orchestration service, define acceptable recovery points for frequently changing artefacts, and test restoration into an isolated environment. A backup that shares credentials or writable storage with the workload is not a reliable ransomware boundary.

Teams should also map which artefacts can be regenerated, how long that would take and which source data must survive first. That exercise turns an AI inventory into a recovery plan. The enduring lesson from Sysdig's report is not that every ransomware crew now uses autonomous agents. It is that exposed AI tooling can provide a path to uniquely valuable assets, while ordinary container misconfiguration can erase the isolation defenders assumed they had.
