---
title: "OpenShift AI Secrets Need Read-Path Authorization"
subtitle: "A dashboard flaw shows why credential controls must cover retrieval as rigorously as creation and deletion."
description: "CVE-2026-86332 can expose NIM credentials to authenticated OpenShift AI dashboard users. Restrict access or remove the integration pending a patch."
date: 2026-09-07 22:14:11 +0400
layout: post
category: ai-security
tags: [openshift-ai, secrets-management, access-control, kubernetes]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-07-openshift-ai-secrets-need-read-path-authorization.svg
image_alt: "Abstract AI workspace with two amber credential capsules held behind layered cyan authorization gates"
key_points:
  - "CVE-2026-86332 lets an authenticated dashboard user retrieve configured NVIDIA NIM credential secrets."
  - "Red Hat confirmed the issue by source review but did not reproduce it against a live deployment."
  - "Remove the NIM integration or limit dashboard access to trusted administrators until a patched image is available."
sources:
  - title: "Odh-dashboard: odh-dashboard: nim credential secret readable by any authenticated user"
    publisher: "Red Hat via CVE Program · 7 September 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/86xxx/CVE-2026-86332.json"
  - title: "CVE-2026-86332 odh-dashboard: odh-dashboard: NIM credential Secret readable by any authenticated user"
    publisher: "Red Hat Bugzilla · 7 September 2026"
    url: "https://bugzilla.redhat.com/show_bug.cgi?id=2529287"
---

Creating and deleting an AI service credential may be restricted to administrators while reading it remains broadly available. CVE-2026-86332 documents that asymmetry in the dashboard used by Red Hat OpenShift AI: under specific conditions, an authenticated dashboard user can retrieve secrets associated with NVIDIA NIM.

Red Hat rates the flaw Moderate and provides a workaround while a patched dashboard image is pending. The immediate job is to find deployments where the integration and its credentials are present, then narrow dashboard access or remove the integration. The durable lesson is that authorization must follow the sensitivity of the object, not the apparent harmlessness of a read operation.

## What Red Hat has confirmed

The CVE record, made public on September 7, describes a missing authorization check in the OpenShift AI dashboard's backend-for-frontend layer. That component uses its own Kubernetes service account to read the relevant Secret objects and can return their data to the requesting dashboard user.

The affected configuration has important preconditions. A user must already have authenticated dashboard access, and a NIM Account custom resource with the referenced credentials must exist. The records identify the NVIDIA NGC API key and the NIM image-pull secret as the sensitive objects at issue. Red Hat assigned a CVSS 3.1 score of 6.5, with high confidentiality impact and no stated integrity or availability impact.

There is also a meaningful limit on what has been established. Red Hat's public bug states that the finding was confirmed through source review at the project's current code, but was not reproduced against a live OpenShift AI and NGC deployment. The sources do not report exploitation, an affected organization, or a breach. Teams should therefore investigate their own configuration without presenting the vulnerability itself as evidence of compromise.

## Why a read path can outrank admin controls

The same credential object's create and delete operations are administrator-gated, according to Red Hat, while the vulnerable read path is not. That pattern is easy to miss in review because write operations look more dangerous. For a secret, however, unauthorized retrieval can transfer the authority embodied by the credential without changing the original object at all.

The dashboard service account is the second boundary. A backend may legitimately need broad Kubernetes permissions to perform platform work, but those permissions must not automatically become the permissions of every signed-in user. Each route needs an authorization decision tied to the caller, followed by response shaping that excludes secret material unless disclosure is explicitly required.

This distinction matters across AI platforms. Model registries, inference services and accelerator integrations often join cluster identities with third-party API keys and image-pull credentials. A dashboard is therefore not merely a presentation layer; it is a broker between human roles, Kubernetes privileges and external services. A single inconsistent read decision can collapse those otherwise separate trust domains.

## Defensive action while a patch is pending

Start with configuration evidence. Determine whether OpenShift AI is deployed, whether NVIDIA NIM integration is enabled, whether a NIM Account resource exists, and which users or groups can authenticate to the dashboard. Do not assume exposure from the product name alone; the published preconditions are specific.

Red Hat's stated workaround offers two choices. Where the integration is unnecessary, disable or remove it so the NIM Account resource and associated Secrets are absent. Where those credentials must remain configured, restrict dashboard access to trusted administrators until a patched dashboard image is available. Teams should treat either choice as a temporary, documented control with an owner and a review trigger.

Avoid broad secret rotation based only on the CVE announcement. Instead, review available dashboard authentication and access records for unexpected use, preserve relevant evidence, and follow the organization's credential-response policy if that review creates a reason to suspect disclosure. This keeps vulnerability management separate from unsupported incident claims.

## What to verify after remediation

When Red Hat publishes a fix, inventory should drive rollout. The CVE record lists multiple Red Hat OpenShift AI packages as affected but does not currently provide a fixed version, so teams should follow the vendor record rather than guess at an image tag.

After updating, verify the digest or release identity of the running dashboard image, not just the desired deployment configuration. Then use controlled accounts representing an ordinary dashboard user and an administrator to confirm that sensitive credential data is denied to the former and available only where operationally required. Finally, check that disabling the integration actually removed the associated resources and that later automation did not recreate them.

The strongest closure evidence joins three facts: the vulnerable feature state, the effective caller authorization, and the exact runtime image. Anything less can show that a change was requested without proving that the credential boundary was restored.
