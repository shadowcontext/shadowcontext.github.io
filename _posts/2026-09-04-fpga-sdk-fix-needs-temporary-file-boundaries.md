---
title: "AWS FPGA SDK Fix Makes Temporary Files a Privilege Boundary"
subtitle: "A local privilege-escalation flaw shows why installers must keep writable paths outside trusted execution."
description: "AWS fixed CVE-2026-85028 in its FPGA Developer Kit; defenders should verify versions, derivatives, and shared-host installation paths."
date: 2026-09-04 04:09:48 +0400
layout: post
category: defense
tags: [vulnerability-management, cloud-security, privilege-escalation, devsecops]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-04-fpga-sdk-fix-needs-temporary-file-boundaries.svg
image_alt: "Abstract FPGA circuit board with amber temporary-file fragments stopped outside a luminous privilege boundary"
key_points:
  - "AWS FPGA Developer Kit versions before 2.3.4 are affected by CVE-2026-85028."
  - "The issue concerns customer-managed SDK installation hosts, not AWS-managed FPGA service infrastructure."
  - "Defenders should verify the active kit and patch forks or derivatives that retained the vulnerable installer logic."
sources:
  - title: "CVE-2026-85028: Creation of Temporary File in Directory with Insecure Permissions in AWS FPGA Development Kit"
    publisher: "Amazon Web Services · September 3, 2026"
    url: "https://aws.amazon.com/security/security-bulletins/2026-096-aws/"
  - title: "Creation of Temporary File in Directory with Insecure Permissions in AWS FPGA Development Kit"
    publisher: "GitHub Security Advisory · August 10, 2026"
    url: "https://github.com/aws/aws-fpga/security/advisories/GHSA-g4hc-wrmm-2x74"
  - title: "Release v2.3.4"
    publisher: "AWS FPGA on GitHub · August 6, 2026"
    url: "https://github.com/aws/aws-fpga/releases/tag/v2.3.4"
---

AWS has published an important security bulletin for a local privilege-escalation flaw in its open-source FPGA Developer Kit. CVE-2026-85028 affects versions before 2.3.4 and sits in a particularly sensitive transition: installation code moving from an ordinary user context to root.

The immediate action is to update. The lasting defensive lesson is to treat every file consumed after privilege elevation as trusted execution input, even when that file appears to be a temporary implementation detail.

## What AWS fixed

The AWS FPGA Developer Kit supports development of accelerators for high-performance cards on EC2 F2 instances. According to AWS, the affected management-tool installation component used a predictable file in a world-writable temporary directory. The installation process later read that file after elevating its privileges. Under the conditions described in the advisory, another local user could place crafted shell content at that location and have it run as root when an administrator performed the documented installation step.

AWS identifies all releases earlier than 2.3.4 as affected. The project advisory assigns a CVSS 3.1 score of 7.8 and describes the impact as arbitrary code execution with root privileges by an unprivileged local user. This is a local flaw: it requires access to the same host and a later privileged installation action. Those prerequisites narrow exposure, but they do not make the boundary safe on shared development systems.

Version 2.3.4 removes the temporary-file exchange from this path. The release notes say the setup step no longer writes the helper function to the temporary location; SDK tools instead source it directly from a file within the kit. AWS recommends updating and carrying the correction into forked or derivative code.

## Scope the affected execution path

Defenders should begin with where the kit is installed, not with every workload that eventually uses an FPGA image. The GitHub advisory explicitly says the issue exists in the open-source installation script running on customer-managed hosts. It also says AWS-managed infrastructure used to ingest, validate and load Amazon FPGA Images is not affected.

That distinction makes build and development machines the relevant inventory. Teams should identify systems where the SDK or management tools have been installed, then record the checked-out tag or commit and whether the host permits multiple interactive or automation identities. Shared research servers, reusable build hosts and long-lived development instances deserve faster attention because a writable temporary directory is intentionally shared across local users.

Dependency inventories alone may be incomplete. The kit can be cloned, mirrored or incorporated into internal provisioning repositories without appearing as a conventional package dependency. Search approved infrastructure repositories and machine-image definitions for retained setup scripts, and ask owners of derivatives to compare their installer logic with version 2.3.4 rather than relying only on a product label.

## Make installer trust explicit

This flaw illustrates a general installer design rule: elevation must reduce the set of trusted inputs, not expand it. A process that becomes root should not source commands from a location writable by less-privileged identities. Temporary data needed across an elevation boundary should have controlled ownership and permissions, resist path substitution, and be validated before privileged use. Better still, fixed trusted code can remain inside the versioned installation tree, as the corrected kit now does.

Operational controls provide a second layer. Restrict administrative installation rights, avoid using shared developer hosts as privileged build appliances, and run provisioning from known revisions in disposable workers where practical. Monitor privileged setup activity and changes to machine images so teams can establish when the vulnerable path was retired. These measures reduce both opportunity and persistence without depending on an exploit signature.

## Verify closure beyond the upgrade

Update the active AWS FPGA Developer Kit to version 2.3.4 or later, then confirm the scripts actually invoked by provisioning come from that corrected revision. A newer repository clone does not close exposure if an older golden image, cached workspace or automation bundle remains in use.

Fork maintainers should incorporate the upstream change and test the normal installation workflow in a representative environment. Retire or rebuild images containing older copies, and document any systems that used AWS's published workaround while awaiting an update. Finally, preserve a short evidence record: host or image, kit revision, installer source and replacement date.

The useful closure statement is therefore more precise than “the CVE is patched.” It is proof that no privileged FPGA setup process still accepts executable content through a path controlled by a less-privileged user.
