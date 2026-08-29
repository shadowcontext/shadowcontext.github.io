---
title: "Patient-Portal Phishing Needs Out-of-Band Verification"
subtitle: "A fake Medicare reward shows why health-account messages must be checked through a separately opened trusted channel."
description: "A new MyChart-themed phishing warning gives patients and healthcare defenders a practical rule: verify portal messages outside the message itself."
date: 2026-08-29 08:10:05 +0400
layout: post
category: threat-intelligence
tags: [phishing, healthcare, identity, fraud]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-29-patient-portal-phishing-needs-out-of-band-verification.svg
image_alt: "Abstract patient portal window protected by a shield while a deceptive gift message is diverted away from a verified access path"
key_points:
  - "A fake MyChart Medicare Kit offer is being delivered through email and text messages."
  - "Users should open the known portal app or address independently instead of following message links."
  - "Healthcare teams should make legitimate portal communications easy to verify and suspicious messages easy to report."
sources:
  - title: "AG Sunday Warns Pennsylvanians of Phishing Scam Targeting “MyChart” Patient Portal Users"
    publisher: "Pennsylvania Office of Attorney General · August 28, 2026"
    url: "https://www.attorneygeneral.gov/taking-action/ag-sunday-warns-pennsylvanians-of-phishing-scam-targeting-mychart-patient-portal-users/"
  - title: "How To Avoid a Government Impersonation Scam"
    publisher: "Federal Trade Commission · November 2023"
    url: "https://consumer.ftc.gov/articles/how-avoid-government-impersonation-scam"
---

A newly warned-of phishing lure combines two sources of trust: a familiar patient portal and the promise of a Medicare-related reward. The useful defensive lesson is broader than this specific message. When a communication asks someone to act on a sensitive account, trust must come from a channel opened independently of that communication.

## What the warning confirms

The Pennsylvania Office of Attorney General warned on August 28 that scammers are impersonating MyChart in emails and text messages. The messages offer a supposed “MyChart Medicare Kit.” The office says no such program or reward exists, and describes the messages as attempts to draw recipients to malicious links and obtain passwords and personal information that could provide access to patient portals.

That is the confirmed scope of the alert. It does not establish how widely the messages have circulated, who operates them, or whether every recipient sees an identical lure. Defenders should not turn a state warning into unsupported claims about a nationwide campaign. They can still act on the observable pattern: an unsolicited benefit, a trusted healthcare identity, and a link that tries to become the route into an account.

The lure is persuasive because each element reduces a different kind of doubt. The portal name supplies familiarity, the Medicare reference supplies institutional weight, and the “kit” supplies a reason to act. Email and SMS also make the link feel like the shortest path to resolving the offer. That convenience is exactly the control point defenders should remove.

## Verification must leave the message

The attorney general’s guidance is direct: do not reply, open attachments, click links, use an unsubscribe control in the suspicious message, or share passwords and verification codes. Instead, users should access the official portal website or app provided by their medical team. If they are unsure where to sign in, they should contact the medical office.

This is out-of-band verification in practical form. A recipient should close the message, open the already installed portal app or use a saved address, and check whether the claimed offer or required action appears there. If neither trusted route is available, the person should call the provider using a number from an existing statement, insurance card, or independently found official website—not a number supplied by the message.

The Federal Trade Commission gives the same structural advice for Medicare impersonation: unexpected messages claiming affiliation with Medicare should not be answered, and questions should be taken to Medicare through its known official channel. The shared principle matters more than visual inspection. Logos, sender names, urgency, and polished writing can all be copied; an independently established destination is harder for the lure to control.

## Healthcare teams can reduce the ambiguity

Patient-facing organizations should treat verification design as part of phishing defense. Portal pages, appointment paperwork, and support recordings should consistently state the canonical app, sign-in address, and help number. Legitimate messages should avoid asking for passwords or verification codes and should direct sensitive actions back to the known portal rather than embedding a destination that users must judge under pressure.

Support teams also need a simple intake path for screenshots and suspicious-message reports. Staff should be able to confirm whether an offer exists without asking the patient to forward a live link or disclose account secrets. Security teams can use reports to identify recurring sender names, domains, shortened URLs, and message wording, while remembering that those indicators may change quickly.

Controls around the account still matter. Strong authentication, alerts for new devices or profile changes, rate limits, and clear recovery procedures can reduce the consequence of a stolen password. None makes a malicious link safe, and no single control should carry the entire burden.

## A short response playbook

For recipients who only saw the message, the safest response is to avoid interacting, preserve a screenshot if reporting is useful, and delete it. Those who entered a password should use the independently opened portal to change it, review account and device activity where available, and contact the provider through a known channel. A verification code should be treated as sensitive as a password.

Healthcare defenders should make that recovery path easy to find before a scam arrives. The central test is simple: can a patient verify a message and recover an account without relying on any address, link, phone number, or instruction contained in the suspicious message? If the answer is yes, the attacker no longer controls the route to trust.
