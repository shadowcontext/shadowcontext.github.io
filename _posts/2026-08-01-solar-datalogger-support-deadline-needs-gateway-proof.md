---
title: "Solar Datalogger Support Deadline Needs Gateway-Level Proof"
subtitle: "Four Solis connectivity models have crossed their security-update deadline, making precise inventory and network-boundary checks essential."
description: "Four Solis solar dataloggers reached their security-update deadline, requiring model-level inventory, exposure checks, and a supported replacement plan."
date: 2026-08-01 10:10:20 +0400
layout: post
category: defense
tags: [iot-security, energy-security, lifecycle, asset-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-01-solar-datalogger-support-deadline-needs-gateway-proof.svg
image_alt: "Abstract solar array connected through an amber datalogger gateway to a protected cyan monitoring cloud"
key_points:
  - "Security updates and services ended July 31 for four listed Solis datalogger models."
  - "The deadline applies to connectivity gateways, so inventory must distinguish logger models from inverters."
  - "Defenders should verify network exposure and remote functions while planning a supported replacement."
sources:
  - title: "Product safety update cycle policy"
    publisher: "SolisCloud PSIRT · milestone effective July 31, 2026"
    url: "https://doc.ginlongcloud.com/en/15.Solis%20PSIRT/02.Product%20safety%20update%20cycle%20policy.html"
  - title: "S3-WiFi-ST and S4-WIFI-ST Installation Video"
    publisher: "Solis Service Center · modified August 2, 2024"
    url: "https://solis-service.solisinverters.com/en/support/solutions/articles/44002541269-s3-wifi-st-and-s4-wifi-st-installation-video"
---

Four network-connected solar datalogger models have crossed a support boundary. Solis’s product security team lists July 31 as the security-update end date for the S3-WiFi-ST, S4-WiFi-ST, S2-WL-ST and S1-W4G-ST.

That does not establish a newly discovered vulnerability, exploitation or failure. It changes the assurance available for devices that bridge solar equipment and monitoring services. Owners and operators should now prove which gateway model is installed, what it can reach, and how it will move to a supported path.

## What the deadline actually covers

The Solis PSIRT policy defines the security-update end date as the point when security updates and services are no longer available for a product. Its table assigns July 31, 2026 to the four models. A fifth model in the same table, S5-WiFi-ST, has a later date of April 30, 2027.

The wording needs careful handling. Solis also says it may patch high-security-level vulnerabilities after expiration “as appropriate,” and promises that listed support cycles may be extended but not shortened. That leaves room for exceptional action; it is not a commitment to routine coverage after the deadline. Defenders should therefore monitor the live policy for an extension or advisory, but should not build a risk decision around the possibility of a discretionary future fix.

The boundary is also model-specific. The listed products are dataloggers, not a blanket declaration about every Solis inverter or the SolisCloud platform. Treating the entire installation as one asset can produce two errors at once: unnecessary replacement of supported equipment and missed attention on the small communications component that has actually aged out.

## Why the gateway deserves its own inventory line

Solis describes its dataloggers as gateways to SolisCloud. Its service documentation says the S3-WiFi-ST and S4-WiFi-ST connect to an inverter and a network to enable remote monitoring and maintenance. It says the S4 model can monitor as many as 10 inverters and supports remote control for installers and customers.

Those functions make the logger a distinct trust boundary. It exchanges operational data across a local connection and an external monitoring path; some models or deployments may also expose management functions. A count of inverters alone will not show which logger is attached, whether one logger represents several inverters, or which accounts and network rules govern remote access.

Start with physical and logical evidence. Record the exact logger model and serial number, the inverter or inverter group it serves, its network segment, outbound destinations, administrative owner, SolisCloud association and enabled remote functions. Reconcile installer records with network observations and a physical check where practical. Similar names across generations make assumptions based on purchase year or dashboard appearance unreliable.

## Reduce exposure while replacement is assessed

The vendor’s lifecycle page does not prescribe a migration model, so the supported destination should be confirmed with Solis or an authorized installer for the particular inverter and region. Until that decision is made, use compensating controls that do not depend on changing the device internally.

Place the logger on a dedicated network segment with no unnecessary path to user devices or administrative systems. Restrict inbound access at the network boundary; permit only the outbound connectivity required for documented monitoring functions. Review who can access the associated cloud plant, remove obsolete installer or staff access, require the strongest authentication the service supports, and ensure recovery contacts remain current.

Do not disable monitoring casually. Telemetry and fault notifications can support safe operation, so isolation changes should preserve required visibility and be tested with the operational owner. Capture a baseline of normal connections and confirm that alerts still arrive after any firewall or account change.

## Make support status measurable

Close the task with evidence rather than a purchase order. The replacement plan should identify compatibility, installer responsibility, configuration backup needs, outage constraints, account transfer and retirement of the old gateway. After the change, verify the new model, firmware, network policy, cloud ownership, remote functions and alert delivery.

Lifecycle review should then become recurring control data. Put the logger model and security-update end date into the asset register, assign an owner, and create advance reminders. The lesson from this deadline is simple: the smallest connected component in an energy system can carry its own support clock, and defenders need to see that clock before it expires.
