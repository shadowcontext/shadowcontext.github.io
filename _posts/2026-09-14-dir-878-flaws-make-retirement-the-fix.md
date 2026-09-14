---
title: "New DIR-878 Flaws Make Router Retirement the Fix"
subtitle: "Two critical router flaws underline why end-of-life hardware needs a removal plan, not another compensating control."
description: "Two new critical DIR-878 vulnerability records reinforce the need to find and retire unsupported routers rather than wait for a patch."
date: 2026-09-14 19:11:05 +0400
layout: post
category: defense
tags: [network-security, vulnerability-management, routers, asset-lifecycle]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-14-dir-878-flaws-make-retirement-the-fix.svg
image_alt: "Abstract editorial illustration of an aging wireless router fading behind a bright replacement boundary"
key_points:
  - "CVE-2026-90692 and CVE-2026-90693 describe remotely reachable stack overflows in two DIR-878 management functions."
  - "Both records require low privileges, so internet exposure is not the only relevant condition for risk."
  - "D-Link lists every DIR-878 revision and firmware release as end of life and recommends moving to a current product."
sources:
  - title: "NVD - CVE-2026-90692"
    publisher: "National Vulnerability Database · September 14, 2026"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2026-90692"
  - title: "NVD - CVE-2026-90693"
    publisher: "National Vulnerability Database · September 14, 2026"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2026-90693"
  - title: "DIR-878 : All Revisions / All Firmware : End-of-Life (EoL) / End-of-Serivce (EoS) : Vulnerabilities Reported"
    publisher: "D-Link · updated June 30, 2026"
    url: "https://supportannouncement.us.dlink.com/security/publication.aspx?name=SAP10475"
---

Two critical vulnerability records published on September 14 put an old router back on defenders' desks. CVE-2026-90692 and CVE-2026-90693 affect D-Link's DIR-878, but the operational answer is not to wait for another firmware release. D-Link says every revision and firmware version of the model has reached end of life and recommends transition to a current-generation product.

## What the new records establish

The National Vulnerability Database describes both issues as stack-based buffer overflows in DIR-878 firmware version 120B05. CVE-2026-90692 concerns the Dynamic DNS IPv6 settings function, while CVE-2026-90693 concerns a WAN settings function. Both can be reached over a network, require low privileges, and require no user interaction according to their published vectors. Each carries a CVSS 3.1 base score of 9.9.

Those facts support urgent inventory and replacement work, but not speculation. The records do not establish active exploitation, identify a campaign, or show that any organization has been compromised. They also should not be read as confirmation that only one firmware build matters: D-Link's own lifecycle notice applies to all DIR-878 revisions and firmware releases.

The low-privilege condition is especially important. Removing public administration access reduces exposure, but it does not erase the risk where an untrusted or compromised account can reach management functions from an internal, guest, or adjacent network. Defenders need to test reachability from the places real users and devices occupy, not only scan the public internet edge.

## End of life changes the remedy

D-Link's notice says the DIR-878 reached end of support in January 2021. It warns that further support, updates, or development may no longer be available and recommends discontinuing the product. That makes a version-only remediation ticket misleading: there is no supported target release to which defenders can confidently pin the device.

Treat this as an asset-lifecycle exception. Search configuration management, wireless surveys, procurement records, DHCP fingerprints, network access control data, and branch-office inventories for the exact model. Confirm the hardware label and management interface rather than relying on a generic device name. Include routers bought locally, supplied for temporary sites, or retained as emergency spares; those are precisely the assets most likely to sit outside normal patch reporting.

For each finding, record its owner, physical location, upstream connection, management reachability, and replacement date. A device that is powered off but kept ready for failover still needs a disposition, because it can return with the same unsupported firmware during an outage.

## Contain while replacement is moving

Replacement should be the primary control. Until it is complete, narrow access to the management plane to explicitly authorized administration systems and prevent guest, user, and untrusted device networks from reaching it. Remove any unnecessary external management path, use a unique administrative credential, and place the router behind a supported security boundary where architecture allows. These measures reduce opportunity; they do not make the firmware supported.

Preserve the current configuration through the vendor-supported method before migration, but handle that file as sensitive material. Rebuild required settings on the replacement deliberately instead of importing every legacy option without review. Validate routing, DNS, wireless isolation, administrative access, logging, and recovery procedures after cutover.

Do not close the work when a purchase order is raised or the old router disappears from a monitoring dashboard. The security outcome is the unsupported device being disconnected, its replacement being verified, and the retired hardware being prevented from quietly returning to service.

## Make lifecycle visible

The broader lesson is that vulnerability management cannot begin and end with CVE-to-version matching. Supported status is a security property. Asset records should carry an end-of-support date, an accountable owner, and a replacement trigger early enough to avoid emergency migrations.

For edge equipment, measure completion with network evidence: the obsolete management interface is no longer reachable, the old hardware identity is absent, and the supported replacement is enrolled in configuration backup, monitoring, and update workflows. The two new records are the prompt; durable lifecycle proof is the fix.
