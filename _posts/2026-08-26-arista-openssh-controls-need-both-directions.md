---
title: "Arista OpenSSH Exposure Runs in Both Directions"
subtitle: "A new product advisory makes inbound management access and outbound operator trust part of the same patch decision."
description: "Arista’s OpenSSH advisory shows why defenders must inventory affected releases, restrict inbound SSH, and constrain trusted outbound administration paths."
date: 2026-08-26 08:09:14 +0400
layout: post
category: defense
tags: [network-security, vulnerability-management, ssh, access-control]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-26-arista-openssh-controls-need-both-directions.svg
image_alt: "Abstract network gateway with opposing blue and amber connection paths contained by layered access-control shields"
key_points:
  - "Arista’s advisory covers four OpenSSH flaws with different server, client, SFTP, and SCP exposure conditions."
  - "The highest-rated issue requires an operator-initiated SSH connection to a malicious or compromised server."
  - "Defenders should pair release-level inventory with inbound allowlists and tightly governed outbound administration paths."
sources:
  - title: "Security Advisory 0147"
    publisher: "Arista Networks · August 25, 2026"
    url: "https://www.arista.com/en/support/advisories-notices/security-advisory/24515-security-advisory-0147"
---

Arista has mapped four OpenSSH vulnerabilities onto a broad set of its network and management products. The advisory is useful because it refuses a common simplification: SSH risk is not only about who can reach a device. It is also about where an administrator, appliance, or automation path can connect from that device.

For defenders, the right response is a two-direction review. Establish which software releases are affected, reduce inbound management exposure, and treat outbound SSH, SFTP, and SCP destinations as trusted infrastructure rather than arbitrary operator choices.

## Four flaws, four exposure conditions

Arista’s August 25 advisory covers CVE-2026-59995, CVE-2026-59996, CVE-2026-60001, and CVE-2026-60002 in OpenSSH versions before 10.4 as incorporated into its products. Arista says it is not aware of malicious exploitation of these vulnerabilities in customer networks.

The server-side issue, CVE-2026-60001, can bypass OpenSSH’s minimum authentication delay. That delay is intended to slow password guessing and timing-based username enumeration. Arista rates the flaw 6.5 and stresses that bypassing the delay does not itself grant authentication. On several affected product families, the SSH daemon is enabled by default, making reachability and authentication policy central to exposure.

The highest-rated issue is different. CVE-2026-60002, scored 9.4 by Arista, is a use-after-free in the SSH client. A server that changes its host key during key re-exchange can trigger the condition after an operator initiates an outbound connection. Arista says the result could be a client crash or potentially code execution. The required outbound action is a meaningful constraint, but it is not a reason to ignore the flaw on systems used as administrative jump points.

The two remaining issues affect file-transfer clients. CVE-2026-59995 may let an attacker-controlled SFTP server place a downloaded file outside the expected location. CVE-2026-59996 may let a malicious server place a file in the parent of the intended directory during a copy between remote destinations. Both require a user to initiate the relevant transfer.

## Inventory the software path, not just the switch

The advisory reaches beyond a single EOS image. It discusses EOS-based products, Wi-Fi access points, CloudVision appliances and Portal, DANZ Monitoring Fabric, Converged Cloud Fabric, Multi Cloud Director, and Arista Network Detection and Response. Applicability differs by product and CVE, so a vendor-wide label such as “Arista affected” is too coarse for remediation.

For EOS, Arista lists releases through 4.36.2F in the 4.36 train, 4.35.5M in 4.35, 4.34.7M in 4.34, 4.33.9M in 4.33, and all prior releases as affected by all four issues. Its Wi-Fi access-point section applies only CVE-2026-60001 and names affected thresholds separately. Other platforms have their own applicability notes and preconditions.

Asset records should therefore capture the product role, running release, enabled SSH service, reachable management interfaces, and whether the system initiates SSH-family connections. Bundled software matters too: Arista notes that some monitoring-fabric deployments carry a fixed EOS version on managed switches. Checking only the controller’s marketing version can miss the component that determines exposure.

## Put controls on both sides of the session

For inbound SSH, Arista recommends restricting management access to trusted source addresses. Defenders should verify that filtering applies in every management routing context, not merely on a perimeter firewall. Key-based authentication reduces the relevance of accelerated password guessing, while monitoring failed-authentication rates can reveal pressure against the service. Neither control replaces corrected software.

For outbound sessions, allow only operationally required destinations and verify server host keys through an independent, maintained process. Arista recommends strict host-key checking on EOS and suggests using role-based access control to prevent unnecessary SSH or file-transfer commands. That is a durable boundary: a network device should not become a general-purpose client simply because an administrator has shell access.

SFTP and SCP workflows deserve the same discipline. Limit transfers to managed repositories, verify where downloaded files landed, and investigate unexpected files without assuming that a completed transfer respected the requested directory.

## Make patch status an evidence question

Arista recommends upgrading to a remediated release and says its fixed-version list will expand as releases become available. At publication, the advisory identifies EOS 4.35.6F and 4.34.8F as fixing CVE-2026-60002; teams should consult the live advisory for the current status of every applicable CVE and product rather than treating those two versions as a universal resolution.

A defensible closure record should show the exact running release after maintenance, the applicable CVEs, the inbound management sources still permitted, and the approved outbound destinations. It should also record any product for which a fixed release is not yet listed and the compensating controls in force.

The central lesson is directional. SSH creates a server boundary when operators connect in, and a client boundary when the device connects out. Patch management is complete only when defenders can prove both paths are constrained.
