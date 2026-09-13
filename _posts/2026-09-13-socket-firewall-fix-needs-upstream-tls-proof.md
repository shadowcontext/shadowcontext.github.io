---
title: "Socket Firewall Fix Needs Upstream TLS Proof"
subtitle: "A package-security control cannot be trusted when its own upstream connections accept unverified certificates."
description: "CVE-2026-90651 makes outbound TLS verification and private-CA handling part of package firewall assurance."
date: 2026-09-13 13:10:45 +0400
layout: post
category: defense
tags: [supply-chain, tls, package-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-13-socket-firewall-fix-needs-upstream-tls-proof.svg
image_alt: "Abstract package stream passing through a luminous firewall gate protected by an intact certificate chain"
key_points:
  - "CVE-2026-90651 affects Socket Firewall registry mode before version 2.0.0."
  - "Older defaults could leave both API and upstream registry TLS certificates unverified."
  - "Defenders should upgrade, install required private CAs, and test the complete package path."
sources:
  - title: "Socket Firewall (socketdev/socket-registry-firewall) in registry mode before 2.0.0 does not verify upstream TLS certificates by default"
    publisher: "GitHub Advisory Database · September 13, 2026"
    url: "https://github.com/advisories/GHSA-jrp2-p3px-f5p5"
  - title: "Release v2.0.0"
    publisher: "SocketDev · June 29, 2026"
    url: "https://github.com/SocketDev/socket-registry-firewall/releases/tag/v2.0.0"
  - title: "Configuration Reference"
    publisher: "Socket documentation · accessed September 13, 2026"
    url: "https://docs.socket.dev/docs/socket-firewall-enterprise-registry-mode-configuration-reference"
---

A newly published vulnerability shows why a software-supply-chain control must authenticate its own dependencies. Socket Firewall’s registry mode could inspect package requests while accepting unverified certificates on the connections used to reach its policy API and upstream registries. That disconnect put the integrity of both downloaded code and security decisions at risk.

The issue is CVE-2026-90651. The practical response is more than changing a setting: operators need to update the firewall, establish the right certificate authorities and prove that every outbound package path now fails securely when trust cannot be established.

## What the advisory establishes

The GitHub Advisory Database rates CVE-2026-90651 High at 8.1 and says it affects Socket Firewall in registry mode before version 2.0.0. When the `api_ssl_verify` and `upstream_ssl_verify` options were absent from the configuration, the generated environment disabled certificate verification for both destinations.

That meant the outbound client could accept self-signed or otherwise untrusted certificates instead of validating their chain. According to the advisory, an attacker able to intercept traffic between the firewall and either the Socket API or an upstream package registry could alter responses in transit. The possible consequences include substituted package content and manipulated allow-or-block decisions.

This is not evidence that exploitation occurred, and the advisory does not claim a customer compromise. It is a control-path weakness with a clear defensive consequence: a package firewall’s verdict is only as trustworthy as the authenticated connections that supply the package and inform the verdict.

## Version 2.0.0 changes the trust default

Socket’s version 2.0.0 release enables verification for API and upstream connections by default. Current configuration documentation likewise lists both verification options as enabled by default and provides separate paths for custom certificate-authority files.

The release also identifies the operational complication. Environments that route traffic through inspection proxies, or connect to private registries using privately issued or self-signed certificates, may stop working until their CA certificates are provided. That is a compatibility problem to plan for, not a reason to preserve an unauthenticated path.

The advisory adds an important version boundary: before version 1.1.334, generated Nginx configuration did not emit the trusted-certificate directive needed to use verification successfully without a manual correction. Teams should therefore avoid treating an enabled-looking option on an old deployment as sufficient evidence. Moving to version 2.0.0 or later removes that ambiguity and adopts the safer default.

## Verify the whole package route

Start with deployment discovery. Find every registry-mode instance, record its running image or release, and map each connection to the Socket API, public registries, internal mirrors, proxies and artifact repositories. Configuration repositories alone are not proof of runtime state; inspect the effective configuration produced inside the deployed service.

Upgrade affected instances to version 2.0.0 or later through the normal change process. Before rollout, collect the public and private CA material each route genuinely requires. Keep trust stores narrowly scoped and managed through the organization’s certificate lifecycle rather than disabling verification to restore connectivity.

Then test negative cases in a controlled environment. A connection presenting an untrusted chain or the wrong server identity should fail. Confirm that a valid private-registry certificate succeeds only after its issuing CA is installed. Exercise package metadata, artifact downloads and policy lookups, because a green health endpoint does not demonstrate that every upstream route is authenticated.

## Turn the fix into durable evidence

Close the work with an evidence set for each instance: deployed version, effective values for both verification controls, trust-store owner, approved upstream hostnames, certificate-expiry monitoring and the result of controlled rejection tests. Alert on verification failures, but do not automate a fallback that silently disables them.

The broader lesson applies to proxies, scanners and repository gateways generally. These products sit in a privileged position precisely because developers and build systems trust their output. Their own outbound TLS policy is therefore part of the software-supply-chain boundary, not transport plumbing. Patch status, certificate trust and route-level failure testing must be reviewed together.
