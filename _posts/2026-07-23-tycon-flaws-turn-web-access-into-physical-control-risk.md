---
title: "Tycon Flaws Turn Web Access Into Physical Control Risk"
subtitle: "A critical authentication bypass in a remote monitor makes isolation, relay mapping, and replacement planning urgent."
description: "Critical Tycon WEB2 flaws expose a remote control path, requiring network isolation, credential review, relay mapping, and safe replacement planning."
date: 2026-07-23 01:22:00 +0400
layout: post
category: defense
tags: [ot-security, industrial-control, vulnerability-management, network-segmentation]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-07-23-tycon-flaws-turn-web-access-into-physical-control-risk.svg
image_alt: "Abstract industrial relay controller isolated behind a luminous segmented network barrier with four protected power channels"
key_points:
  - "CISA says an authentication bypass in WEB2 firmware 2.3.9 can give a remote unauthenticated attacker administrative access."
  - "A second flaw can expose stored credentials, while the device interface can control four physical relays."
  - "Operators should remove direct exposure, map relay consequences, review secrets, and plan a vendor-confirmed replacement path."
sources:
  - title: "Tycon Systems TPDIN-Monitor-WEB2"
    publisher: "Cybersecurity and Infrastructure Security Agency · 21 July 2026"
    url: "https://www.cisa.gov/news-events/ics-advisories/icsa-26-202-01"
  - title: "JVNVU#98832565: CISA ICS Advisory / ICS Medical Advisory（2026年07月21日）"
    publisher: "Japan Vulnerability Notes · 22 July 2026"
    url: "https://jvn.jp/vu/JVNVU98832565/"
  - title: "How do I access data and controlling relays on the TPDIN-Monitor-WEB2/WEB3 via HTTP?"
    publisher: "Tycon Systems · undated"
    url: "https://tyconsystemsinc.zohodesk.com/portal/en/kb/articles/accessing-data-and-controlling-relays-on-tpdin-monitor-web2-web3-via-http"
---

A small web-managed appliance can carry a large operational consequence when its outputs switch physical equipment.

CISA's 21 July advisory for the Tycon Systems TPDIN-Monitor-WEB2 describes two vulnerabilities in firmware version 2.3.9. The more serious can bypass authentication and provide administrative access over the network. The second can expose sensitive information stored in cleartext. For defenders, the priority is not merely patching a web interface: it is controlling a path from network access to physical relay actions.

## Why this is an operational risk

CISA assigns CVE-2026-61884, an authentication-bypass vulnerability, a CVSS v3.1 score of 9.8. The agency says a remote attacker without credentials could submit empty credential fields and obtain full administrative access. CVE-2026-55985, rated 4.3, concerns cleartext storage of sensitive information that can expose credentials through the administrative dashboard.

Tycon's own support documentation says the WEB2 interface can monitor real-time readings and control four relays over HTTP; it also notes that relay control is available through SNMP. That functionality explains why the advisory's impact extends beyond confidentiality. CISA says successful exploitation could disrupt connected infrastructure or manipulate physical equipment, potentially creating a safety risk.

This is not evidence that those outcomes have occurred. CISA reported no known public exploitation specifically targeting the flaws at publication. The agency also said the product is used in critical manufacturing and deployed worldwide. Those are exposure and consequence indicators, not a forecast that every unit faces the same risk.

## Isolate first, then map consequences

The first task is positive identification. Search asset records, switch tables, firewall rules, remote-site inventories and facilities documentation for TPDIN-Monitor-WEB2 units. Confirm the model and firmware on the device rather than inferring them from a hostname. Record each unit's owner, location, management path and connected equipment.

Then determine reachability. CISA recommends minimizing network exposure for control devices, placing them behind firewalls and isolating control networks from business networks. Remove direct internet access and unnecessary port forwarding. Where remote administration is operationally required, permit it only through an updated, managed remote-access path and a restricted jump host. A VPN reduces exposure but does not compensate for an unmanaged endpoint or overly broad network access.

Before changing connectivity or power-cycling a unit, map every relay to its physical effect. Identify normal and fail-safe states, automatic rules, maintenance dependencies and the personnel needed on site if remote control is lost. Security containment that unexpectedly disables monitoring, power or environmental support can create its own hazard.

## Treat stored secrets as part of the affected surface

The cleartext-storage finding makes credential review a separate workstream. Determine which administrative password, SNMP credentials or community strings, and mail-service settings are held by each device. Look for reuse across other controllers, routers, monitoring systems or field-service accounts.

Restrict access before rotating secrets so that a new credential is not immediately exposed through the same vulnerable interface. Prioritize any secret reused elsewhere, then update dependent monitoring and alerting integrations in a controlled sequence. Preserve relevant firewall, VPN and management logs before making changes; embedded equipment may provide limited local audit history.

Do not claim compromise merely because a vulnerable device is present. Review surrounding telemetry for unexpected management sources, access outside maintenance windows, configuration changes and unexplained relay activity. Escalate only findings supported by evidence.

## Replacement needs operational change control

The CISA advisory does not identify a vendor fix, and says attempts to coordinate with Tycon Systems were unsuccessful. That makes a later version number alone insufficient proof of remediation. Operators should obtain written vendor confirmation of any supported firmware path or plan migration to a supported replacement while keeping compensating controls in place.

Replacement should preserve more than IP settings. Capture alert thresholds, relay assignments, schedules, sensor calibration, network restrictions and recovery behavior. Test the successor on an isolated bench, confirm default relay states during startup and failure, and define rollback and on-site support before the maintenance window.

The durable lesson is architectural: a browser-accessible monitor that can switch a relay is privileged operational technology. Its management plane deserves the same ownership, segmentation and lifecycle discipline as the physical process it controls.
