---
title: "Encrypted messaging needs authenticity and ordering proof"
subtitle: "New protocol research shows why content encryption alone cannot establish who sent a message or whether a conversation is complete."
description: "New Session Protocol V1 research shows why secure messaging reviews must test key authentication, replay resistance, and message ordering separately."
date: 2026-08-10 15:10:10 +0400
layout: post
category: defense
tags: [secure-messaging, cryptography, identity-security, protocol-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-10-encrypted-messaging-needs-authenticity-and-ordering-proof.svg
image_alt: "Abstract editorial illustration of two encrypted message streams crossing a luminous identity gate while ordered sequence markers remain protected"
key_points:
  - "Researchers report authentication and sequence-binding weaknesses in Session Protocol V1."
  - "Encryption does not by itself prove sender identity, message order, or completeness."
  - "High-consequence messaging needs independent verification until protocol-level assurance is established."
sources:
  - title: "Practical Attacks on a Decentralized Secure Messenger Session"
    publisher: "USENIX Association · August 10, 2026"
    url: "https://www.usenix.org/conference/woot26/presentation/urushigaki"
  - title: "Session Protocol V2: PFS, Post-Quantum and the Future of Private Messaging"
    publisher: "Session · December 1, 2025"
    url: "https://getsession.org/session-protocol-v2"
  - title: "Account IDs and self managed keys"
    publisher: "Session Docs · accessed August 10, 2026"
    url: "https://docs.getsession.org/session-network/session-protocol/account-ids-and-self-managed-keys"
---

End-to-end encryption answers an essential question: can an intermediary read the message? It does not automatically answer three others: who supplied the key, whether the message arrived in the right order, and whether part of the conversation was replayed or removed.

Research released in the open-access proceedings of WOOT ’26 on August 10 puts those distinctions into practical focus. The authors report two design weaknesses in Session Protocol V1 and describe impersonation, timestamp forgery, message dropping, and replay attacks. Their work is a protocol-security finding, not a report of a breach.

## What the researchers found

Kota Urushigaki, Hayato Kimura, Atsushi Tanaka, and Takanori Isobe analyzed the protocol used for one-to-one and closed-group conversations in Session, a decentralized encrypted messenger. According to their USENIX paper page, the first weakness is an absence of mutual public-key authentication. The second is a lack of cryptographic binding to monotonic sequence counters.

Those are separate from content confidentiality. A message may be encrypted for a key while the protocol still lacks sufficient proof that the key belongs to the intended participant. Likewise, an encrypted message can be authentic in isolation without proving its position in a conversation or showing that no earlier message has been duplicated, suppressed, or reordered.

The researchers say malicious server nodes or unprivileged malicious group insiders can exploit these properties to substitute public keys, manipulate perceived chronology, or silently drop and duplicate messages. ShadowContext found no public vendor response to this specific paper at publication time. The findings should therefore be attributed to the authors, not presented as a confirmed vendor assessment or as evidence that attacks have occurred.

## Why the trust boundary is wider than encryption

Session’s documentation says account identity is based on a locally generated Ed25519 public-private key pair rather than a phone number or email address. That design reduces dependence on conventional identifiers, but it makes the integrity of key association especially important: users and systems need reliable evidence that the public key they are using represents the intended correspondent.

For defenders, the broader lesson applies to any collaboration or messaging system. A procurement checklist that stops at “end-to-end encrypted” is incomplete. Assurance should cover peer-key authentication, device linking and key changes, membership changes, anti-replay state, sequence integrity, and the user-visible handling of missing or delayed messages.

These properties matter most when chat becomes an authorization channel. Payment changes, credential resets, emergency instructions, release approvals, and administrative requests should not be trusted merely because they appeared inside an encrypted conversation. A protocol can protect content from observation while leaving the meaning or chronology of the exchange open to manipulation.

## Defensive action without overclaiming a fix

Organizations using any messenger for consequential decisions should add an independent verification step now. Confirm unusual or high-impact requests through a separately established channel, especially after a key change, device relink, group-membership change, unexpected gap, or repeated message. The second channel should be selected in advance rather than supplied inside the questionable conversation.

Security teams should also document which messenger versions and protocol generations are approved. Session says Protocol V2 is under development and is intended to add post-quantum support and restore perfect forward secrecy. That roadmap is relevant context, but the vendor page does not establish that V2 resolves the newly reported authentication and sequence-binding issues. Defenders should wait for explicit technical documentation, release evidence, and independent review before treating a future protocol generation as remediation.

For higher-risk deployments, ask the supplier how peers authenticate public keys, how clients detect rollback and replay, what happens when sequence state is lost, and how key or membership changes are surfaced. Record the answers as control evidence rather than relying on a general encryption claim.

## The proof defenders should require

A secure-messaging assessment should test confidentiality, authenticity, freshness, ordering, and completeness as distinct properties. It should also state the attacker model: an honest-but-curious relay is different from a malicious relay, and an outside observer is different from a legitimate group member abusing protocol privileges.

The practical takeaway is not that encryption has failed. It is that encryption is one component of a conversation’s trust. When people use messages to authorize real actions, defenders need proof not only that the words stayed secret, but also that the right party sent them and that the conversation arrived intact.
