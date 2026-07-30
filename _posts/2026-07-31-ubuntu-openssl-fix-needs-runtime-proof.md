---
title: "Ubuntu OpenSSL Fix Needs Runtime-Level Proof"
subtitle: "Canonical’s HollowByte update closes a bounded TLS resource risk, but package state alone does not prove that running services use the repaired library."
description: "Ubuntu’s HollowByte fix makes OpenSSL patching measurable: map TLS exposure, install the correct package, restart safely, and verify live processes."
date: 2026-07-31 02:10:00 +0400
layout: post
category: defense
tags: [openssl, ubuntu, tls, denial-of-service]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-31-ubuntu-openssl-fix-needs-runtime-proof.svg
image_alt: "Abstract blue TLS service channels passing through a luminous patched library core while amber memory blocks are contained at the network edge"
key_points:
  - "Canonical has issued fixed OpenSSL packages for Ubuntu 26.04, 24.04 and 22.04 LTS."
  - "OpenSSL treats HollowByte as a bounded hardening issue rather than a CVE-class vulnerability."
  - "Defenders should verify that exposed services are running with the updated library after a controlled reboot."
sources:
  - title: "USN-8625-1: OpenSSL vulnerability"
    publisher: "Ubuntu · July 30, 2026"
    url: "https://ubuntu.com/security/notices/USN-8625-1"
  - title: 'On the "HollowByte" denial-of-service report'
    publisher: "OpenSSL Library · July 21, 2026"
    url: "https://openssl-library.org/post/2026-07-21-hollowbyte/"
---

Canonical has released fixed OpenSSL packages for three supported Ubuntu LTS generations in response to the condition known as HollowByte. The update turns a contested upstream security classification into a straightforward defensive task: identify exposed services, apply the distribution package, and prove the repaired library is active.

This is an availability issue, not evidence of data theft, code execution or organizational compromise. Its value for defenders lies in disciplined patch verification and in understanding what upstream severity language does—and does not—change about local risk.

## What Ubuntu fixed

Ubuntu Security Notice USN-8625-1 says OpenSSL allocated memory buffers incorrectly in its SSL/TLS state machine while receiving handshake data. Canonical says a remote actor could possibly cause excessive memory consumption and denial of service with specially crafted network traffic.

The notice covers Ubuntu 26.04 LTS, 24.04 LTS and 22.04 LTS. Canonical lists fixed `openssl` and shared-library packages for each release: version 3.5.5-1ubuntu3.3 for 26.04, 3.0.13-0ubuntu3.12 for 24.04, and 3.0.2-0ubuntu1.26 for 22.04. Those distribution versions matter more to an Ubuntu fleet than comparing its packages directly with upstream OpenSSL release numbers, because Ubuntu backports fixes while retaining release-specific version lines.

Canonical’s update instructions call for a standard system update followed by a reboot. That final step is operationally important. Replacing a shared library on disk does not, by itself, demonstrate that every long-running process has loaded the new code.

## Why the classification needs context

OpenSSL’s own July 21 analysis confirms the allocation behavior but classifies the change as hardening rather than a CVE-worthy vulnerability. The project says the allocation is bounded per connection, limited by the maximum handshake message size, and freed when the connection ends. It separates that allocation from the familiar problem of slow connections consuming workers or file descriptors.

That assessment should prevent inflated claims. OpenSSL does not describe HollowByte as unbounded memory growth, and it has not assigned the issue a CVE. The project also says standard deployment controls for slow connections can address the residual availability risk.

Canonical nevertheless chose to issue a security notice and fixed packages. Those positions are not mutually exclusive. Upstream classification asks whether a behavior crosses the project’s vulnerability threshold; a distribution advisory tells operators that supported packages have changed and provides an actionable update path. Defenders can respect the upstream technical analysis while still treating the Ubuntu release as a reason to close avoidable exposure.

## Build proof around the running service

Start with service scope. Inventory internet-facing and internally critical TLS endpoints on the affected Ubuntu releases, including reverse proxies, application servers, API gateways and custom services that link to the system OpenSSL library. Container images and statically linked applications need separate treatment: a host package update may not change the library inside an image or binary.

Then use Ubuntu’s release-specific package versions as the compliance baseline. Update through trusted repositories, preserve normal change controls, and follow Canonical’s reboot instruction. Where availability requirements demand staged work, rotate nodes behind a load balancer rather than leaving a mixed fleet indefinitely.

Verification should answer two questions. First, is the fixed package installed on every in-scope host? Second, did the service restart after that package became available? A package dashboard can answer the first; process start times, deployment records and post-reboot health checks help answer the second. Test normal TLS negotiation and application health without reproducing hostile traffic.

Existing connection limits, timeouts and resource monitoring remain useful defense in depth. They reduce the impact of slow or incomplete handshakes and provide warning when connection or memory pressure departs from the normal baseline. They are complements to the update, not substitutes for it.

## The durable lesson

HollowByte is a useful test of vulnerability-management precision. A memorable name does not automatically make an issue critical, while the absence of a CVE does not make a vendor-supplied update irrelevant.

The defensible response is proportional and evidence-based: use Canonical’s package matrix, retain OpenSSL’s bounded-impact context, prioritize exposed and availability-sensitive services, and verify the live runtime after maintenance. Closure should mean more than “the package was downloaded.” It should mean the repaired library is loaded, the service is healthy, and the fleet has no unexplained exceptions.
