---
title: "GCM Empty Nonces Need an API Boundary"
subtitle: "New research on a standards mismatch shows why cryptographic APIs must reject an empty nonce before authenticated encryption begins."
description: "A newly described GCM/GMAC weakness makes explicit nonce-length validation and cross-standard conformance testing defensive priorities."
date: 2026-08-08 07:10:58 +0400
layout: post
category: defense
tags: [cryptography, gcm, authentication, secure-development]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-08-gcm-empty-nonces-need-an-api-boundary.svg
image_alt: "Abstract cryptographic channel protected by layered blue rings while an empty amber ring is stopped at the validation boundary"
key_points:
  - "Reject zero-length nonces at every GCM and GMAC interface."
  - "Test deployed libraries against the exact standard and profile they claim to implement."
  - "Keep nonce validation separate from the rule that nonces must not repeat."
sources:
  - title: "A Note on the Influence of a Zero Length Nonce on GCM and GMAC"
    publisher: "arXiv · August 6, 2026"
    url: "https://arxiv.org/abs/2608.06061"
  - title: "Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC"
    publisher: "NIST · November 2007"
    url: "https://csrc.nist.gov/pubs/sp/800/38/d/final"
  - title: "ISO/IEC 19772:2020 — Information security — Authenticated encryption"
    publisher: "ISO · November 2020"
    url: "https://www.iso.org/standard/81550.html"
---

Authenticated encryption fails if its inputs fall outside the assumptions that make it secure. A newly listed cryptographic note identifies one such edge case: a zero-length nonce in particular GCM and GMAC specifications. The practical lesson is narrow and immediate. Empty nonces should be rejected explicitly, even when a library accepts them or a standards profile appears to permit them.

## The mismatch is at the input boundary

Galois/Counter Mode, or GCM, combines encryption with authentication. GMAC is its authentication-only specialization. Both take an initialization vector, commonly called a nonce, as an input. That value does not need to be secret, but its construction and permitted length are security conditions rather than formatting details.

The new preprint contrasts two specifications. Its author says the ISO/IEC version allows a nonce to be an empty string, while NIST Special Publication 800-38D requires at least one bit. The currently published ISO page confirms ISO/IEC 19772:2020 remains the current edition, but the detailed zero-length interpretation comes from the research note and should be treated as that author's analysis.

NIST's requirement is explicit. SP 800-38D sets the IV length between one and 2^64 minus one bits, requires supported inputs to be byte strings, and recommends restricting IVs to 96 bits for interoperability, efficiency and simpler design. These are separate ideas: an IV can be non-empty yet still be the wrong length for a deployment profile, and a correctly sized IV can still be unsafe if it repeats under the same key.

## An empty nonce changes the security claim

The paper reports a simple attack against the zero-length case that recovers GCM's authentication hash subkey. With that value, the author says an adversary can forge ciphertexts or messages. The paper also states that the attack applies to the ISO/IEC construction it analyzes and not to the NIST version, because NIST excludes the triggering input.

This is not evidence that GCM is generally broken. It is evidence that a prohibited or ambiguous edge case can invalidate the authentication guarantee. Defenders should preserve that distinction when triaging: the relevant question is whether a reachable implementation can actually process an empty nonce under the affected construction, not merely whether an application uses AES-GCM somewhere.

The finding also illustrates why input validation belongs outside the cryptographic primitive. If an application assumes its library will enforce the intended profile, while the library accepts a broader standard or a low-level byte string of any length, each layer can appear conformant on its own while their composition is unsafe.

## Inventory the implementations that can accept it

Start with the call sites that construct or receive nonces. Include protocol decoders, hardware-security interfaces, foreign-function bindings, compatibility layers and test utilities, not only the main encryption wrapper. Determine whether nonce length is fixed by the protocol, enforced by application code, checked by the library, or merely documented.

Then add an unconditional rejection for zero bytes before any GCM or GMAC operation. For profiles standardized on 96-bit nonces, enforce exactly 12 bytes unless a reviewed protocol specification requires another permitted length. Keep that check distinct from uniqueness controls, which may use counters, structured fields or approved random generation. Length validation cannot detect reuse, and reuse prevention does not necessarily reject an empty value.

Do not infer exposure from an API signature alone. Exercise the exact deployed library, provider, hardware module and configuration with a negative conformance test. The safe result is a deterministic error before cryptographic processing. Record the component version and backend because language wrappers may delegate to different providers across platforms.

## Make standards selection testable

Cryptographic requirements should identify the governing profile, not just the algorithm name. An engineering standard that says “use GCM” leaves nonce length, tag length, construction and invocation limits open to interpretation. Name the standard and protocol profile, translate its conditions into machine-checkable tests, and retain those tests with release evidence.

Cross-standard interoperability testing should include rejected inputs as well as successful vectors. Verify empty, undersized, expected and oversized nonce cases at every boundary where data changes representation. Also confirm that decryption rejects the same unsupported lengths as encryption.

Finally, treat the preprint as a prompt for targeted verification rather than proof of deployment-wide vulnerability. Reviewers should reproduce the standards interpretation applicable to their products and watch for responses from standards bodies and library maintainers. The durable control does not depend on that process: an empty nonce has no operational justification in a well-profiled GCM deployment, and rejecting it removes this edge case cleanly.
