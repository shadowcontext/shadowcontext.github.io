---
title: "Excelize flaw makes spreadsheet intake a compute boundary"
subtitle: "An unpatched CPU-exhaustion path shows why workbook parsing needs admission controls and disposable workers."
description: "A new Excelize advisory warns that crafted encrypted-workbook metadata can consume CPU. Defenders should isolate parsing while awaiting a fix."
date: 2026-09-07 03:09:53 +0400
layout: post
category: defense
tags: [excelize, spreadsheet-security, denial-of-service, application-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-07-excelize-flaw-makes-spreadsheet-intake-a-compute-boundary.svg
image_alt: "Abstract spreadsheet cells entering an isolated processing chamber while an amber computation spiral is contained behind a cyan boundary"
key_points:
  - "Excelize 2.3.1 through 2.11.0 is affected, with no patched version listed at publication."
  - "A file can trigger costly key derivation before password verification, even when no password was supplied."
  - "Reject unneeded encrypted inputs and run required parsing in bounded, replaceable workers."
sources:
  - title: "Unbounded spinCount in agile decryption burns CPU during OpenFile"
    publisher: "qax-os/excelize via GitHub · September 6, 2026"
    url: "https://github.com/qax-os/excelize/security/advisories/GHSA-jrfj-fhj2-jjvm"
---

A high-severity Excelize advisory published September 6 turns spreadsheet intake into an availability boundary. A small, specially structured input can make the Go library spend substantial CPU time in password-key derivation before it decides that the workbook is invalid.

There is no patched version listed in the advisory. Defenders using Excelize to process files from customers, partners, mailboxes or automated feeds therefore need compensating controls now, followed by a library update when the project publishes a fix.

## What the advisory establishes

The project lists Excelize versions 2.3.1 through 2.11.0 as affected and rates the issue high severity, with availability as the stated impact. The vulnerable behavior sits in the file-opening path used for agile encryption. Metadata inside the input supplies a `spinCount` value that controls how many key-derivation iterations the library performs, but the affected code does not impose an upper bound.

Crucially, the expensive loop runs before the password verifier is checked. The advisory says Excelize selects the decryption path from the file header alone, including when an application did not provide a password. A service cannot assume it is safe simply because its product does not advertise encrypted-workbook support.

The reporter verified the behavior across several released versions and describes CPU use growing with the attacker-controlled count while memory remains comparatively stable. The affected call also lacks a cancellation context. An HTTP timeout may end the client response, but it does not necessarily stop the work continuing inside the server process.

The advisory does not claim exploitation in the wild, identify victims or describe confidentiality or integrity loss. This is a resource-consumption flaw whose consequence depends on whether untrusted files can reach Excelize.

## Find every path that opens a workbook

Start with dependency evidence: identify services, command-line tools, background jobs and serverless functions that load `github.com/xuri/excelize/v2`. Then trace actual file origins. Upload endpoints are obvious, but email attachment processors, import queues, document previews, reporting tools and object-storage events can create equally important paths.

Record the loaded module version in deployed artifacts rather than relying only on a development manifest. Include old container images, scheduled jobs and dormant import features. The vulnerable range begins with 2.3.1, so a long-lived service may be affected even if it has not adopted recent releases.

Next, decide whether each workflow genuinely needs encrypted workbooks or legacy compound-file input. Where it does not, reject that class before Excelize receives it and return a controlled error. Do not rely on a filename extension or a browser-provided content type; both are caller-controlled. Make the policy explicit and test legitimate uploads against it.

## Contain the work that must remain

Some workflows must accept password-protected spreadsheets. Put those operations in a separate worker process or tightly isolated job, not in the request-serving process. Apply wall-clock and CPU limits outside the library, cap concurrent parsing jobs, bound queue depth and terminate a worker that exceeds its budget. Process replacement matters because ending an upstream request alone may leave the key-derivation loop running.

Rate limits can reduce repeated submissions, but they are not sufficient by themselves: the advisory describes one input creating disproportionate work. Admission controls should combine authenticated quotas, file-size limits and a strict ceiling on concurrent spreadsheet jobs. If a worker is killed, retries must also be capped so the same file does not recreate the condition indefinitely.

Monitor per-file processing time, worker CPU, forced terminations, queue age and repeated failures tied to the same object. Keep enough correlation data to locate the source and affected workflow without logging workbook contents or passwords.

## Define proof while waiting for a fix

Because the advisory currently names no patched release, “upgrade to latest” is not a complete remediation statement: 2.11.0 remains in the affected range. Track the advisory and project releases, but retain compensating controls after a fix because spreadsheet parsers continue to handle complex, attacker-influenced formats.

For each intake path, document one of two outcomes: unsupported encrypted inputs are rejected before parsing, or required inputs run inside a measured CPU and time budget with reliable worker replacement. Validate ordinary spreadsheets and approved encrypted files so the safeguard does not silently break business processing.

When a fixed version appears, verify the running build and repeat safe boundary tests in a controlled environment. The durable lesson is that parser completion is never guaranteed; services should be designed so one document cannot own their compute indefinitely.
