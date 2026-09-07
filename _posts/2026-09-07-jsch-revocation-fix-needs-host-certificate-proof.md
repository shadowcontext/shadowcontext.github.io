---
title: "JSch Revocation Fix Needs Host-Certificate Proof"
subtitle: "A parser gap shows why declaring a revoked SSH identity is not enough unless the client can enforce it."
description: "CVE-2026-86231 affected JSch 2.28.0 through 2.28.5. Defenders should update and verify revoked SSH host certificates are rejected."
date: 2026-09-07 09:09:58 +0400
layout: post
category: defense
tags: [jsch, ssh-security, certificate-revocation, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-07-jsch-revocation-fix-needs-host-certificate-proof.svg
image_alt: "Abstract SSH trust path passing through layered cyan certificate gates while a revoked amber certificate is diverted into a sealed chamber"
key_points:
  - "CVE-2026-86231 affects JSch 2.28.0 through 2.28.5; the CVE record marks 2.28.6 unaffected."
  - "The flaw could cause a certificate-form revoked host key to be ignored during known_hosts processing."
  - "Defenders should update embedded JSch copies and test rejection with controlled host-certificate fixtures."
sources:
  - title: "mwiede jsch KnownHosts.java getRevokedKeys improper check for certificate revocation"
    publisher: "CVE Program · 6 September 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/86xxx/CVE-2026-86231.json"
  - title: "jsch-2.28.6"
    publisher: "JSch on GitHub · 29 July 2026"
    url: "https://github.com/mwiede/jsch/releases/tag/jsch-2.28.6"
  - title: "Fix #1091: Parse certificate-form revoked host keys"
    publisher: "JSch on GitHub · 29 July 2026"
    url: "https://github.com/mwiede/jsch/pull/1098"
---

An SSH client can load a revocation rule without actually enforcing it. CVE-2026-86231, published September 6, identifies that failure in the maintained JSch Java SSH client: certain revoked host-certificate entries could be mishandled while reading `known_hosts`.

This is a narrow flaw, not a reason to distrust SSH host verification generally. It is still operationally important because JSch is often embedded inside applications, build systems and integration services where the library version and effective trust configuration may be difficult to see.

## What the sources establish

The [CVE record](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/86xxx/CVE-2026-86231.json) lists JSch 2.28.0 through 2.28.5 as affected and 2.28.6 as unaffected. It characterizes the issue as an improper certificate-revocation check, says remote exploitation would have high complexity, and gives it a medium CVSS 4.0 score of 6.3. The same record gives a low CVSS 3.1 score of 3.7. There is no claim of exploitation in the wild or of an organizational compromise.

The maintainer evidence explains the mechanism more precisely. JSch had recently added support for OpenSSH host certificates. A revoked entry written in certificate form could be parsed incorrectly, preventing it from contributing the embedded base public key to the set checked during certificate verification. The resulting risk was not that every revocation rule failed; it was that this particular representation could silently lose its intended security effect.

The [fix pull request](https://github.com/mwiede/jsch/pull/1098) says the parser now converts supported certificate-form revoked entries into their embedded base public keys, validates the declared and embedded key families, and preserves malformed or mismatched records without stopping subsequent parsing. Its regression coverage included Ed25519, ECDSA, RSA SHA-2 and invalid certificate records. A maintainer review also confirmed that the corrected client rejected the controlled revoked-certificate case.

## Find the library inside the application

The immediate task is version discovery. Search dependency manifests, resolved lockfiles, software composition analysis results and packaged Java archives for `com.github.mwiede:jsch`. Do not assume the version declared in a top-level build file is the version running in production: dependency mediation, shaded archives and application-server bundles can change the effective component.

Map each finding to the function it serves. Systems that initiate SSH or SFTP connections and use OpenSSH host certificates with revocation entries deserve attention first. A service that contains JSch but never uses certificate-based host verification does not have the same reachable condition. Record that distinction rather than inflating the vulnerability count.

The affected range also matters. The CVE record begins at 2.28.0, the release that introduced OpenSSH certificate support, and stops at 2.28.5. Teams should not generalize that range to unrelated JSch forks or older package coordinates without evidence from their maintainers.

## Update, then test the trust decision

Move affected deployments to 2.28.6 or a later release that retains the fix. The [2.28.6 release notes](https://github.com/mwiede/jsch/releases/tag/jsch-2.28.6) explicitly identify parsing certificate-form revoked host keys as a change. Because newer releases may already exist, choose a supported target compatible with the application, then verify the resolved artifact and running package after deployment.

A safe regression test should use disposable keys and a controlled SSH endpoint. Exercise the organization’s real configuration-loading path and confirm that a test host certificate represented in the revocation data is rejected, while an authorized test certificate still connects. Avoid testing against production identities or converting a live trust failure into an “accept anyway” workflow.

Also check failure visibility. If a revocation record is malformed, the deployment should generate an actionable configuration or validation signal rather than quietly weakening trust. Centralized clients should expose enough telemetry to identify the calling service, destination and verification result without logging private key material or credentials.

## Make revocation observable

CVE-2026-86231 illustrates a broader control problem: a security file’s presence is not proof that every entry has been interpreted. Certificate and key lifecycle processes should therefore validate both syntax and enforcement. When a key is revoked, retain evidence that representative clients refuse it after the configuration change.

Include embedded SSH libraries in dependency inventories, assign an owner to host-trust data, and preserve a small suite of positive and negative connection tests. Those measures turn revocation from a static declaration into an observable decision—and make future parser or format changes much easier to catch before they reach production.
