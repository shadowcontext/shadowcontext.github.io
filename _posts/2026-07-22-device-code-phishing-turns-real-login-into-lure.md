---
title: "Device-Code Phishing Turns a Real Login Page Into the Lure"
subtitle: "Fresh Kali365 telemetry shows why defenders must govern authentication flows, not merely teach users to inspect login domains."
description: "Kali365 device-code phishing uses legitimate sign-in pages, making flow restrictions, sign-in telemetry, and careful exceptions essential."
date: 2026-07-22 16:08:00 +0400
layout: post
category: threat-intelligence
tags: [phishing, identity-security, microsoft-365, conditional-access]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-22-device-code-phishing-turns-real-login-into-lure.svg
image_alt: "Abstract authorization gateway with a deceptive amber code ribbon stopped by a layered blue identity-control barrier"
key_points:
  - "Kali365 sends targets to a legitimate device-login page with a code created by the attacker."
  - "A successful sign-in can authorize the attacker's session without exposing the user's password."
  - "Defenders should inventory device-code use, block it where possible, and tightly scope monitored exceptions."
sources:
  - title: "Kali365 Targets US Organizations With Device Code Phishing"
    publisher: "ANY.RUN · 21 July 2026"
    url: "https://any.run/cybersecurity-blog/kali365-phishing-targeting-us/"
  - title: "Kali365 Phishing-as-a-Service Kit Hijacks Microsoft 365 Access Tokens"
    publisher: "FBI Internet Crime Complaint Center · 21 May 2026"
    url: "https://www.ic3.gov/PSA/2026/PSA260521"
  - title: "Conditional Access: Authentication flows"
    publisher: "Microsoft Learn · updated 24 March 2026"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-authentication-flows"
---

A phishing page does not have to imitate a sign-in screen. It can send the target to the genuine one.

New telemetry published by ANY.RUN on 21 July describes continued Kali365 activity using device-code phishing against Microsoft 365 users. The defensive consequence is broader than one phishing kit: checking the browser address is valuable, but it cannot validate who initiated an authorization flow or which device will receive the resulting token.

## The real page is part of the trap

Device-code flow exists for equipment and software that cannot conveniently accept credentials, such as shared displays, input-constrained devices and some command-line tools. An application displays a short code; the user opens a separate browser, enters that code on Microsoft's legitimate page and completes the normal authentication experience.

Kali365 reverses the trust relationship. According to ANY.RUN and an earlier FBI public-service announcement, the attacker initiates the flow and delivers the resulting code through a phishing lure. The target then visits the authentic Microsoft page and enters a code belonging to the attacker's session. If the authorization completes, the attacker can receive OAuth access and refresh tokens without the phishing page collecting the user's password.

This is not evidence that multifactor authentication has been cryptographically broken. The social-engineering step persuades the user to authenticate and authorize a flow they did not initiate. A familiar domain and a successful MFA prompt can therefore coexist with a hostile outcome.

ANY.RUN says its public sandbox records more than 80 Kali365-linked sessions per week, with activity spanning several sectors. Public-sandbox submissions are visibility into observed samples, not a census of all attacks, but they are a timely reason to verify controls rather than assume awareness training is sufficient.

## Treat the authentication flow as a control point

Microsoft characterizes device-code flow as high risk because it can be used in phishing or to reach corporate resources from unmanaged devices. Its guidance recommends blocking the flow wherever possible.

That recommendation needs an inventory first. Use Microsoft Entra sign-in logs to filter for device-code authentication and identify the accounts, applications, devices and business processes that depend on it. Distinguish legitimate room systems, shared devices and administrative tooling from unexplained or obsolete use. Owners should document why each exception exists and when it will be reviewed.

Then create a Conditional Access policy in report-only mode to measure impact before enforcement. Organizations with no valid use can move toward a broad block. Where the flow remains necessary, scope exceptions to the smallest practical set of dedicated accounts, resources and trusted conditions. Microsoft notes that some Teams devices need the flow for provisioning or reauthentication, so an indiscriminate production block can cause avoidable outages.

## Detection must follow authorization, not just email

Email controls should still detect impersonation, urgent document lures and suspicious links, but identity telemetry is the stronger confirmation layer. Alert on unexpected successful device-code sign-ins, unfamiliar locations, unusual applications and use by accounts with no approved device-code requirement. Compare those events with message reports and endpoint activity rather than investigating each signal in isolation.

Response playbooks should also reflect token abuse. A password reset alone may not terminate an already issued session. When investigation confirms unauthorized authorization, revoke relevant sessions and refresh tokens, remove unapproved application consent where applicable, review sign-in and mailbox activity, and re-establish access from a known-good device. The exact containment steps should follow the tenant's identity architecture and Microsoft guidance.

Train users on the transaction, not only the page. A device code should be entered only when the person has just initiated a sign-in on a device they recognize. An unexpected request from email, chat, telephone support or a document prompt should be treated as suspicious even when the next page is hosted by Microsoft.

## Make exceptions visible and temporary

Device-code phishing succeeds in the space between a legitimate protocol and an illegitimate request. That makes governance more durable than chasing each kit domain.

Maintain an approved-use register, named owners and periodic review for every exception. Monitor exception-group changes, test the blocking policy after identity-platform changes, and retain enough sign-in data to investigate authorization events. The objective is not to declare a useful protocol inherently malicious. It is to ensure that a cross-device authorization path exists only where the organization can explain, constrain and observe it.
