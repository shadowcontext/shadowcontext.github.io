---
title: "ACME Validation Needs a Network Boundary"
subtitle: "A Red Hat Certificate System fix shows why domain checks must not inherit unrestricted internal reach."
description: "Red Hat's ACME responder update closes an SSRF path and gives PKI teams a clear test for validation egress, redirects, and deployment proof."
date: 2026-09-14 22:09:14 +0400
layout: post
category: defense
tags: [pki, acme, ssrf, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-14-acme-validation-needs-network-boundaries.svg
image_alt: "Abstract certificate shield filtering a redirected request path before it reaches protected internal network nodes"
key_points:
  - "CVE-2026-18369 lets an ACME account holder induce HTTP GET requests toward internal services."
  - "Red Hat fixed the issue in a September 14 update for supported Red Hat Certificate System deployments."
  - "Teams should verify both the patched package and the responder's effective egress boundary."
sources:
  - title: "RHSA-2026:67110 - Security Advisory"
    publisher: "Red Hat · September 14, 2026"
    url: "https://access.redhat.com/errata/RHSA-2026:67110"
  - title: "CVE-2026-18369"
    publisher: "Red Hat · accessed September 14, 2026"
    url: "https://access.redhat.com/security/cve/cve-2026-18369"
---

Red Hat has released an update for Red Hat Certificate System that closes an unexpected network path inside its ACME responder. The flaw is rated Moderate, but its defensive lesson is important: a service that proves control of an Internet name should not gain permission to explore addresses that only the service itself can reach.

## What Red Hat fixed

[Red Hat's September 14 advisory](https://access.redhat.com/errata/RHSA-2026:67110) makes updated packages available for Red Hat Certificate System 10.4 on RHEL 8.6 Extended Update Support. The security fix addresses CVE-2026-18369 in the system's Automated Certificate Management Environment, or ACME, implementation. Red Hat advises users of the affected product to apply the update after installing previously released errata relevant to their systems.

The more detailed [CVE record](https://access.redhat.com/security/cve/cve-2026-18369) says the ACME responder's HTTP-01 validator accepted IP address literals as DNS identifiers and followed redirects without confirming that the destination was a public address. An unauthenticated ACME account holder could consequently cause the certificate service to make HTTP GET requests to internal network services.

Red Hat scores the vulnerability 5.8 under CVSS 3.1. It rates the issue Moderate because requests are limited to GET, production-supported database backends do not return internal response bodies to the requester, and the ACME responder must be explicitly deployed. Red Hat says an InMemory backend does disclose the internal target's response through an ACME challenge error, but that distinction should not be generalized to supported production configurations.

## Why certificate validation crosses a trust boundary

HTTP-01 validation is intended to answer a narrow question: does the requester control a resource at the identifier being validated? The vulnerable behavior changed that question into a request primitive originating from the certificate system's network position. Internal destinations that reject traffic from the Internet may still trust or simply accept traffic from the PKI host.

Red Hat notes that the practical exposure on supported configurations is primarily internal network-topology probing. It also cautions that internal services whose HTTP GET endpoints perform actions could be affected indirectly; cloud metadata services that issue temporary credentials are one example in its assessment. That is a conditional risk, not evidence that credentials were obtained or that any deployment was compromised.

The redirect detail matters operationally. Checking only the address originally supplied is insufficient when a validator automatically follows a response to another destination. Every hop can change the effective host, address family, port, and trust zone. Validation therefore needs a destination decision at connection time and again after each redirect.

## What PKI owners should verify

First, establish whether the ACME responder is actually deployed. Red Hat explicitly makes that a condition of exposure, so the answer should come from running configuration and service evidence rather than package presence alone. Record the host, environment, network zone, enabled responder endpoints, database backend, and service owner.

For affected supported systems, apply the packages identified in RHSA-2026:67110 through the normal Red Hat update channel. Preserve the advisory ID and installed package versions as evidence, then verify that the running service is using the updated files. A completed package transaction is not enough if a long-lived process, container, image, or standby node still carries the earlier implementation.

Next, review outbound policy from the responder. It should reach only the destinations and ports required for ACME validation, with private, loopback, link-local, metadata, management, and other non-public ranges denied unless a separately justified design requires them. DNS resolution and redirects must not create a route around that policy. Central egress controls provide a useful backstop even after application-level validation is corrected.

## Close with behavior, not inventory

Test the repaired boundary safely in a controlled environment. Confirm that a normal public HTTP-01 target still validates, while IP-literal identifiers, redirects toward prohibited address space, and destination changes after name resolution fail closed. Observe resolver, proxy, firewall, and application logs so the team knows what a blocked attempt looks like.

Finally, apply the same review to other automated verifiers that fetch user-influenced URLs: webhook testers, link previewers, importers, monitoring probes, and identity callbacks. CVE-2026-18369 is a specific certificate-system defect. The durable control is broader: any validation service with privileged network placement must prove both what it is checking and where every resulting request is allowed to go.
