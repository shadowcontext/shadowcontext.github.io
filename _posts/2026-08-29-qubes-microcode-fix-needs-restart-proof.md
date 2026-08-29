---
title: "Qubes Microcode Fix Needs Restart and Measurement Proof"
subtitle: "QSB-117 turns a processor update into a verifiable host-state change, with an extra step for measured-boot users."
description: "Qubes OS users should install the QSB-117 microcode package, restart dom0, and account for changed PCR measurements before declaring systems fixed."
date: 2026-08-29 20:09:12 +0400
layout: post
category: defense
tags: [Qubes OS, firmware, microcode, endpoint security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-29-qubes-microcode-fix-needs-restart-proof.svg
image_alt: "Abstract layered computer compartments around a protected processor core, with a restart arc and measured-boot nodes"
key_points:
  - "Qubes 4.3 users should install microcode_ctl 2.1.20260812 from the stable repository."
  - "The update does not take effect until dom0, and therefore the physical host, is restarted."
  - "Anti Evil Maid users must reseal their passphrase because the microcode changes PCR18 and PCR19."
sources:
  - title: "QSB-117: Intel CPU firmware vulnerabilities"
    publisher: "Qubes OS · August 28, 2026"
    url: "https://www.qubes-os.org/news/2026/08/28/qsb-117/"
  - title: "Intel® Processor Firmware Advisory - 01435"
    publisher: "Intel · August 11, 2026"
    url: "https://www.intel.com/content/www/us/en/security-center/advisory/intel-sa-01435.html"
---

Qubes OS has published QSB-117 for a group of Intel processor firmware vulnerabilities, and its most useful message is operational: receiving a package is not the same as running the corrected microcode. Defenders need evidence that the update reached the host, that the host restarted, and—where measured boot is in use—that the resulting measurement change was handled deliberately.

## What the bulletin establishes

The Qubes Security Team says five Intel advisories associated with Intel’s August 11 microcode release may apply to Qubes OS. The potentially affected processor families include 10th- and 11th-generation Intel Core, Intel Core Ultra Series 1 through 3, and several Xeon variants. Exact exposure depends on the processor, so the vendor advisory tables—not a broad device label—should drive inventory decisions.

Qubes is appropriately cautious about impact. It says the available Intel material is not detailed enough for a definitive assessment of how far the issues affect Qubes isolation, but that it cannot exclude a cross-qube attack. On an affected machine, the project says an attacker who has already compromised one qube could attempt to infer information from other qubes or elevate privileges. That is a risk statement under uncertainty, not confirmation that isolation has been bypassed in the wild.

One constituent issue illustrates why local access does not mean low consequence. Intel rates INTEL-SA-01435 high severity and assigns CVE-2026-20716 to an improper-access-control weakness affecting certain Xeon 6 processors. Intel describes a local, high-complexity path requiring an authenticated user and special internal knowledge, with potential high impact to confidentiality and integrity. The Qubes bulletin covers a wider set of advisories and processors, so teams should not treat that single CVE’s product list as the complete scope.

## The fix has a runtime boundary

For Qubes 4.3, QSB-117 identifies `microcode_ctl` version `2.1.20260812` in dom0 as the security update. The package has already moved through security testing into the stable repository, and the project directs users to install it through the normal Qubes Update tool or supported command-line equivalent.

The decisive step comes afterward: dom0 must be restarted for the new microcode to take effect. Because dom0 is the privileged administrative domain, this is effectively a host restart, not merely recycling an application qube. An inventory record showing the new package version proves availability on disk; it does not prove the processor loaded the update.

For managed fleets, split verification into two states. First confirm that the expected package version is installed from the trusted Qubes repository. Then confirm a restart occurred after installation and record the active microcode state using the organization’s supported platform inventory or attestation workflow. Maintenance reports should flag systems that have the package but have not crossed that restart boundary.

## Measured boot needs planned recovery

QSB-117 adds a specific warning for Anti Evil Maid users: the microcode update changes PCR18 and PCR19, so the secret passphrase must be resealed to the new Platform Configuration Register values. Those measurements are part of the mechanism used to detect changes around the boot environment. A legitimate firmware-state change can therefore look different to a control designed to trust the previous measurements.

Administrators should treat resealing as part of the same change ticket, with the project’s current documentation and established recovery material available before the restart. That is not a reason to preserve vulnerable state. It is a reason to prevent a security update from becoming an avoidable availability problem or encouraging an improvised bypass of boot assurance.

## A defensible completion test

The bulletin also notes that Intel withdrew the relevant Meteor Lake update because of functional issues, leaving the impact for systems without that update unclear. Those machines should remain explicitly tracked as exceptions rather than being marked remediated by association with the wider rollout.

A sound closeout record therefore contains the processor model, applicable advisory set, installed Qubes package version, restart time, active-state evidence, and measured-boot outcome where relevant. For withheld or unavailable updates, document the vendor status and review trigger. The broader lesson is simple: low-level fixes change both execution state and trust measurements. Patch compliance should prove both.
