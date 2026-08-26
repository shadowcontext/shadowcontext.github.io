---
title: "Passkeys Need Recovery and Session Controls"
subtitle: "New CSA guidance makes the case for phishing-resistant sign-in while keeping recovery and authenticated sessions inside the threat model."
description: "CSA’s passwordless guidance shows why passkey rollouts need verified recovery, session containment, and evidence that passwords no longer remain in the path."
date: 2026-08-26 17:09:18 +0400
layout: post
category: defense
tags: [identity-security, passkeys, phishing-resistance, zero-trust]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-26-passkeys-need-recovery-and-session-controls.svg
image_alt: "Abstract cyan passkey bound to a protected portal, with an amber recovery path and flowing session ribbon contained by layered shields"
key_points:
  - "Passkeys and FIDO2 security keys provide stronger phishing resistance than several other passwordless methods."
  - "A rollout is incomplete if routine or recovery flows can still fall back to a password."
  - "Session monitoring and rapid revocation remain necessary after authentication succeeds."
sources:
  - title: "Understanding Passwordless Authentication"
    publisher: "Cyber Security Agency of Singapore · August 26, 2026"
    url: "https://www.csa.gov.sg/alerts-and-advisories/advisories/ad-2026-011/"
---

Removing the password prompt does not automatically remove phishing risk. New guidance from the Cyber Security Agency of Singapore draws a useful boundary: passkeys and FIDO2 security keys offer high phishing resistance, while push approvals, magic links and SMS codes provide weaker protection. Defenders should therefore measure the authentication property they gained, not merely whether users saw a password field.

The advisory also makes the harder point. Passkeys protect the sign-in ceremony, but they do not by themselves stop session theft, malware, social engineering or abuse of weak account recovery. A sound rollout must strengthen the routes around authentication as deliberately as the login itself.

## Passwordless is a category, not a security outcome

CSA describes passkeys as public-key credentials based on FIDO2 and WebAuthn. The private key stays on the user’s device, while the service holds the public key. Because the credential is bound to the legitimate website, a lookalike domain cannot ask the user to submit a reusable secret. That is the central defensive improvement over passwords and one-time codes.

But “passwordless” includes methods with different properties. CSA rates passkeys and FIDO2 security keys as highly phishing-resistant, while push authentication and email magic links are moderate and SMS one-time passwords are low. This matters in procurement and migration plans. Replacing a password with a channel that an attacker can relay or socially engineer may improve usability without delivering the intended resistance.

Identity teams should document the assurance target for each workforce and customer journey. If the goal is phishing resistance, the acceptance test must prove origin-bound cryptographic authentication on the actual applications in scope. A feature checkbox at the identity provider is not enough when a legacy protocol, embedded browser or alternate login route can bypass it.

## Migration proof must include every fallback

CSA notes that some services retain passwords for compatibility or recovery even when routine sign-in is passwordless. That creates a practical test: can an attacker deliberately enter a fallback flow and return the account to a phishable state?

Defenders should inventory every route that can establish or restore access: primary login, device enrollment, lost-device recovery, help-desk intervention, delegated administration and legacy application access. For each route, record the credential accepted, the verification strength, the notification generated and the authority able to reverse the action. High-risk recovery should require stronger evidence than information that is easily discovered or persuaded from a support agent.

Rollouts also need lifecycle evidence. Register more than one trusted authenticator where policy permits, remove authenticators promptly when devices are retired, and alert users when a new passkey or recovery method is added. Test offboarding and device-loss scenarios before removing the old sign-in path; otherwise, operational pressure will predictably preserve an insecure fallback indefinitely.

## Successful authentication is not the finish line

The CSA guidance explicitly lists session hijacking, malware, social engineering and insider misuse among risks that passkeys do not resolve. Once a legitimate session exists, the application must still decide what that session may do, for how long and under what changing conditions.

Organizations should connect passkey deployment to session controls. Keep session lifetimes proportionate to privilege, require fresh authentication for sensitive changes, and detect implausible shifts in device, location or behavior. Responders need a tested way to revoke active sessions and tokens across connected services—not just disable an account and assume existing access disappeared.

Application owners should also protect high-impact actions with server-side authorization and clear transaction context. A phishing-resistant login cannot prevent a user from being manipulated into approving the wrong payment, changing a trusted destination or granting excessive access after signing in. Step-up checks should show what is being authorized and bind approval to that action.

## Measure the boundary that actually changed

A useful passkey program can produce evidence beyond adoption counts. Track the share of in-scope sign-ins that are genuinely phishing-resistant, the number of password-capable fallback paths still open, recovery events by verification method, and the time required to revoke sessions after a simulated account-risk signal.

Those measures expose where the old identity boundary remains. Passkeys remove a highly reusable secret from routine authentication; they do not make identity self-defending. The stronger design binds credentials to the real service, makes recovery at least as trustworthy as login, and gives defenders authority to contain sessions after authentication.
