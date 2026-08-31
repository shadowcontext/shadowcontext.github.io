---
title: "Browser Agent API Keys Need a Storage Boundary"
subtitle: "A newly published flaw shows why AI interface state must be treated as secret-bearing data."
description: "CVE-2026-82640 exposes a defensive gap: browser-use web-ui can store LLM API keys in plaintext files, making local access controls decisive."
date: 2026-08-31 04:08:13 +0400
layout: post
category: ai-security
tags: [ai-agents, api-keys, secrets-management, vulnerability]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-31-browser-agent-api-keys-need-storage-boundaries.svg
image_alt: "Abstract browser window enclosing a glowing key-shaped secret behind layered storage and access-control shields"
key_points:
  - "CVE-2026-82640 affects browser-use web-ui versions 2.0.0 through 3.0.0."
  - "Configured LLM API keys can persist in predictable plaintext JSON files."
  - "Defenders should bound access, inspect storage, and rotate keys when exposure is plausible."
sources:
  - title: "browser-use web-ui 2.0.0 through 3.0.0 Cleartext API Key Storage"
    publisher: "CVE Program · August 30, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82640.json"
  - title: "Unauthenticated LLM API Key Plaintext Persistence via save_config"
    publisher: "browser-use web-ui GitHub issue · July 5, 2026"
    url: "https://github.com/browser-use/web-ui/issues/736"
---

A newly published vulnerability in an AI browser-agent interface puts an ordinary but consequential security decision in focus: where configuration state lives after a user clicks save. The weakness is not in a model’s reasoning. It is in the storage boundary around the credential that lets the model service run.

## What the record confirms

The CVE Program published CVE-2026-82640 on August 30. Its CNA record, assigned by VulnCheck, says browser-use web-ui versions 2.0.0 through 3.0.0 write configured LLM provider API keys to disk in cleartext, without encryption or access restrictions. It identifies the weakness as CWE-312, cleartext storage of sensitive information.

The record rates the issue medium severity: 6.8 under CVSS 4.0 and 5.5 under CVSS 3.1. Both vectors describe a local attack requiring low privileges, with high confidentiality impact but no stated integrity or availability impact. That distinction matters. This is not evidence that a remote stranger can automatically retrieve every key from an affected deployment. The confirmed risk is that someone or something able to read the temporary settings directory can recover the stored credentials.

The public issue behind the record supplies useful implementation context. It says the save function serializes interface values, including an LLM API key, into timestamp-named JSON files and returns the saved path. The issue also says those files may be reachable from host users or other containers when deployments use shared filesystems or mounted volumes. The CVE record names versions through 3.0.0 as affected and does not identify a patched version.

## Why AI interface state deserves stricter treatment

API keys are authority, not preferences. A browser-agent interface may present provider selection, model choice, task history and credentials in one convenient settings screen, but those values do not carry equal risk. Persisting them through one generic save path can turn a usability feature into a secret repository that operators never intended to create.

The defensive lesson extends beyond this project. AI tools are frequently assembled from a web interface, an orchestration process, browser automation, model-provider credentials and container storage. A boundary that looks local to one component may be shared at the deployment layer. Temporary directories can survive longer than expected, enter backups, appear in support bundles or be mounted where neighboring workloads have access. Those are risk hypotheses for defenders to test, not impacts claimed for this vulnerability.

Severity scores should therefore inform prioritization without replacing deployment context. A locally reachable plaintext secret on a single-user test machine is a different problem from the same file on a shared agent host. The affected-version range is the starting point; storage topology and access paths determine the practical urgency.

## What defenders should verify now

First, inventory browser-use web-ui deployments and establish their exact versions. For systems in the confirmed 2.0.0-through-3.0.0 range, determine whether users entered provider keys through the interface and whether settings were saved. Do not assume a container boundary makes the files private: inspect the effective ownership, permissions, mounts, backup paths and access available to adjacent processes.

Until maintainers identify a fixed release, reduce exposure with controls that do not depend on the application. Keep the interface bound to trusted networks, avoid shared writable storage, limit the service account and container to the minimum filesystem access they require, and prevent secret-bearing temporary paths from entering backups or diagnostic archives. Where the workflow permits, inject short-lived credentials at runtime instead of placing durable keys in UI state.

If review shows that an affected settings directory was readable outside the intended trust boundary, rotate the relevant provider keys and invalidate the old values. Rotation should be paired with a check of provider-side usage and billing logs for anomalies; rotation alone does not explain prior use.

## The durable control

The strongest design outcome is to separate ordinary agent configuration from secrets. Sensitive fields should use a dedicated secret store or runtime injection path, with restrictive access and an explicit lifetime. Saving a model name should never silently imply saving the authority to spend, retrieve or act through that model provider.

CVE-2026-82640 is a focused vulnerability, but its lesson is broad: every AI interface has a data lifecycle. Defenders need evidence for where credentials are written, who can read them, how long they remain and how they are revoked. If those answers are implicit, the storage boundary is not yet a security control.
