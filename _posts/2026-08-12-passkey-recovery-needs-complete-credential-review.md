---
title: "Passkey Recovery Needs a Complete Credential Review"
subtitle: "New usability research shows that password resets alone can leave an added passkey and active sessions outside the recovery path."
description: "USENIX research shows why passkey recovery must review credentials, sessions, and recovery channels as one complete workflow."
date: 2026-08-12 23:12:44 +0400
layout: post
category: defense
tags: [passkeys, identity-security, account-recovery, usable-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-12-passkey-recovery-needs-complete-credential-review.svg
image_alt: "Abstract passkey credentials circling a protected account vault, with one amber credential revealed outside the trusted recovery path"
key_points:
  - "A 31-person study found that no participant independently completed every required recovery step."
  - "Changing a password does not necessarily remove registered passkeys or terminate active sessions."
  - "Recovery flows should inventory every access route and show users when remediation is complete."
sources:
  - title: "“Maybe there's only one passkey?”: Challenges Investigating and Remediating Adversarial Passkeys"
    publisher: "USENIX Association · August 12, 2026"
    url: "https://www.usenix.org/conference/usenixsecurity26/presentation/daffalla"
---

Passkeys reduce exposure to phishing and credential stuffing, but their security value does not end at login. A passkey that remains registered after a password reset can preserve an access route that the account owner believes has been closed.

Research published in the proceedings of the 35th USENIX Security Symposium on 12 August examines that recovery gap. The lesson for identity teams is direct: recovery must reconcile every credential, session and recovery channel—not merely change the password.

## A simulated test of a realistic recovery problem

The researchers studied 31 adults, including local residents, technical students and consultants who help people facing technology abuse. Participants ranged from 23 to 78 years old and had varied technical backgrounds. In one-to-one lab sessions, they investigated safely simulated suspicious access on test accounts for three passkey-supporting services: Google, PayPal and LinkedIn.

The scenario assumed that an adversary had temporary access to an account password and used it to register a separate passkey on a device controlled by the adversary. That passkey could then support continued access. The study did not document a real breach of any service or participant; it evaluated how people responded to a controlled account-recovery exercise.

Participants could inspect service emails and account-security interfaces. Complete remediation required them to remove the unrecognized passkey, change the password and ensure that adversarial sessions were terminated. In the Google scenario, they also needed to identify a suspicious recovery email address.

## The dangerous point is the false finish

Many participants could not find the added passkey without a researcher’s prompt. Labels and icons did not always provide enough context to distinguish a legitimate credential from an unrecognized one. Some people also conflated the biometric gesture used to unlock a passkey with the passkey itself, illustrating how interface language can obscure the underlying access route.

More importantly, none of the 31 participants independently completed every step needed to secure the account in the exercise. Some assumed that changing the password would also remove passkeys. Others followed a security wizard to completion and reasonably concluded that the account was safe even though passkey review was not part of that flow. The researchers call this a “false finish”: the interface signals completion before all relevant access paths have been addressed.

The opposite failure also appeared. Some warnings told users to delete a passkey from the device where it was stored. That is unnecessary once the server-side credential has been revoked and impossible when the device is not under the account owner’s control. Recovery guidance that demands an impossible action can leave a user believing the account remains unsafe.

These findings come from a qualitative lab study of three services, not a population-wide measurement. They should guide design review rather than be treated as a universal failure rate.

## Defenders should make recovery credential-complete

Identity owners should map recovery as a state transition across the whole account. The checklist should cover passwords, passkeys, active sessions, recovery addresses, recovery phone numbers, linked identity providers, application passwords and other authenticators. Completion should mean that every access route has been reviewed and that the user can see which routes were removed, retained or re-established.

Notifications should state the exact security change—such as a new passkey being added—and offer a trusted route to the relevant control. Because people are rightly cautious about links in security emails, the researchers suggest clear navigation instructions and an in-product banner that leads to the account’s passkey controls.

For higher-assurance services, security logs should connect each session to the authentication method that created it and record sensitive changes made during that session. That would let users and support teams answer two practical questions: which credential opened this session, and what did that session change?

Finally, recovery testing should include comprehension, not just functional success. Give representative users a simulated unknown passkey and verify that they can identify it, revoke it, invalidate related sessions and recognize an unambiguous completion state. Passkeys strengthen authentication, but only a complete recovery workflow can make their security durable.
