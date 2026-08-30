---
title: "cohttp Fix Needs One Normalized Path From Request to File"
subtitle: "A newly published traversal flaw shows why decoding, authorization, and file resolution must share one path representation."
description: "cohttp before 6.3.0 could escape a document root through encoded paths; defenders should upgrade and verify one normalization flow."
date: 2026-08-30 14:09:33 +0400
layout: post
category: defense
tags: [vulnerability-management, web-security, path-traversal, ocaml]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-30-cohttp-fix-needs-one-normalized-path.svg
image_alt: "Abstract layered web paths converging through a bright security boundary into a protected document root"
key_points:
  - "cohttp versions before 6.3.0 are affected by CVE-2026-82481."
  - "Version 6.3.0 decodes paths once before removing traversal segments."
  - "Applications must normalize before both authorization checks and file resolution."
sources:
  - title: "CVE-2026-82481"
    publisher: "CVE Project · 29 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82481.json"
  - title: "cohttp: urldecode before resolving path components for files"
    publisher: "mirage/ocaml-cohttp · 20 August 2026"
    url: "https://github.com/mirage/ocaml-cohttp/pull/1145"
---

A newly published vulnerability in cohttp turns an ordinary implementation detail—when a URL path is decoded—into a high-severity file boundary problem. The CVE record says versions before 6.3.0 of the OCaml HTTP package allow directory traversal. The maintainer’s fix gives defenders a more useful lesson than the label alone: every security decision about a request path must use the same normalized representation.

## What changed in cohttp 6.3.0

CVE-2026-82481 was published on 29 August and assigns a CVSS 4.0 base score of 8.7. The record describes a network-reachable, low-complexity issue requiring neither privileges nor user interaction, with a potential high confidentiality impact. It identifies cohttp versions earlier than 6.3.0 as affected and 6.3.0 as the fixed boundary.

The project’s merged change explains the mechanism more precisely. `Cohttp.Path.resolve_local_file` could be given percent-encoded traversal components that escaped the configured document root. Version 6.3.0 changes the order of operations: it percent-decodes the URI path exactly once, then removes dot segments. That sequence matters because filtering a still-encoded path can miss characters that acquire structural meaning only after decoding.

The release also adds `Cohttp.Path.normalise`, which produces a relative path that cannot ascend above its root. The project says the change affects cohttp-lwt, cohttp-mirage, and cohttp-async. It says cohttp-eio is not affected by this particular change because that backend uses a separate path-resolution mechanism. That distinction is important for inventory: a package name alone is not enough to determine the relevant code path.

## The hidden risk is representation drift

Path traversal is often treated as a narrow sanitization bug. Here, the broader defensive issue is representation drift. A reverse proxy, router, authorization check, and file-serving function may each see a slightly different form of one request. If one layer checks encoded text while another decodes it, the application can approve one path and open another.

The cohttp notes explicitly warn that applications making access-control decisions on path segments should normalize the request URI before inspecting those segments. Normalization is not applied to every request by default because existing applications may depend on current URI semantics; the unsafe combination arises when unnormalized input is used with local file resolution or path-based policy.

That means upgrading the library repairs the vulnerable resolver, but it does not automatically prove every application-level authorization flow is sound. A service can still make a policy decision on a raw URI and later hand the request to code that interprets it differently. The durable design is one canonical path produced once and carried through routing, authorization, logging, and resource lookup.

## What defenders should verify now

Start with dependency evidence. Find deployed OCaml services and images containing cohttp, then identify the exact package and backend versions in the running artifact rather than relying only on a source manifest. Upgrade affected cohttp packages to 6.3.0 or later and rebuild every service that vendors or statically links the dependency.

Next, review endpoints that map request paths to local files, object-store keys, or Mirage key-value entries. Pay special attention to static-file handlers and custom route guards. Confirm that decoding happens once, dot segments are removed afterward, and the resolved destination remains inside the intended root. Do not add a second decoder downstream; repeated decoding can recreate ambiguity.

Tests should compare what policy code authorizes with what storage code ultimately opens. Include encoded separators, dot segments, repeated separators, trailing slashes, and absolute-form request targets as non-destructive regression cases. The goal is not merely to reject a list of suspicious strings. It is to prove that every equivalent spelling resolves to one expected identity before access is granted.

## Turn the patch into lasting assurance

Record the fixed library version in the software inventory, but pair it with application-level proof. Capture the backend in use, the normalization function applied, and the boundary checked after resolution. Add structured logging for the normalized path alongside a safely handled request identifier; avoid logging secrets or treating raw attacker-controlled strings as trusted display content.

Finally, make canonicalization order a review requirement wherever external identifiers become filesystem paths or storage keys. Decode once, normalize, authorize, resolve, and verify containment—all against the same value. CVE-2026-82481 is specific to cohttp, but that sequence is the transferable control: security boundaries hold only when every layer agrees on what resource the request names.
