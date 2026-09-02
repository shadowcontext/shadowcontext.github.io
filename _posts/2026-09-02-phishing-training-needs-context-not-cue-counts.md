---
title: "Phishing Training Needs Context, Not Cue Counts"
subtitle: "New NIST research challenges the idea that one category of warning sign can predict whether employees click."
description: "A large NIST phishing study shows why defenders should measure message context, reporting and control outcomes—not just clicks or obvious cues."
date: 2026-09-02 17:11:49 +0400
layout: post
category: defense
tags: [phishing, security-awareness, human-factors, email-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-02-phishing-training-needs-context-not-cue-counts.svg
image_alt: "Abstract email cards with varied warning cues moving toward a protected reporting channel"
key_points:
  - "Preliminary results found no difference in clicking behavior between the five tested cue types."
  - "Click rates need context from message difficulty, reporting behavior and the recipient's work."
  - "Training should be paired with technical controls and a fast, low-friction reporting path."
sources:
  - title: "Phish Out of Water: A Large-Scale Study of Phishing Email Cues"
    publisher: "NIST · September 1, 2026"
    url: "https://www.nist.gov/publications/phish-out-water-large-scale-study-phishing-email-cues"
  - title: "NIST Phish Scale User Guide"
    publisher: "NIST · November 2023"
    url: "https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2276.pdf"
---

A newly published NIST study offers a useful warning for security-awareness teams: the visible warning signs in a simulated phishing message do not, by themselves, explain who clicks. The practical response is not to abandon training, but to stop treating a single click rate as a complete measure of people or program quality.

## What the study found

NIST says the study was conducted with Walmart's information-security research team and tested 26 distinct phishing cues across five cue types with more than 50,000 employees. Nearly 3,000 participants completed a follow-up survey. Across the simulated campaign, NIST reports a 16.81% reporting rate and a 7.22% click rate.

The headline result is deliberately limited: preliminary survey findings suggest there were no differences in clicking behavior between the five cue types. That does not establish that every cue is equally visible, that cues never matter, or that the findings will transfer unchanged to every workforce. The NIST page describes a conference poster and labels the results preliminary, so defenders should resist turning one large study into a universal rule.

It does undermine a common shortcut. A training team cannot assume that adding an obvious language error, suspicious visual treatment or technical anomaly will create a predictable level of difficulty. People evaluate messages inside a work context, where timing, role, expected tasks and perceived consequences can make an otherwise suspicious request feel plausible.

## Why click rate needs context

The NIST Phish Scale already treats human detection difficulty as a combination of observable message cues and premise alignment with the target audience. Its user guide groups cues into errors, technical indicators, visual-presentation indicators, language and content, and common tactics. Premise alignment asks whether the scenario resembles workplace processes, matters to the recipient's role, fits current events, creates a consequence for inaction, or has been covered in prior training.

That framework changes how a campaign result should be read. A low click rate on an implausible message with many obvious warnings does not prove that employees will recognize a well-timed request that fits their duties. A higher click rate on a strongly aligned scenario may expose a difficult business workflow rather than individual carelessness.

Reporting deserves equal attention. A report can give the security team an early signal, support message removal and protect colleagues who have not yet interacted with the lure. Programs should therefore measure reporting rate, time to first report and the interval from report to containment alongside clicks. Repeat behavior and performance by scenario difficulty are more informative than a leaderboard built from one campaign.

## Build exercises around decisions

Awareness teams should design exercises from real decision points: a request to change payment details, share a document, approve access, reset credentials or act outside a normal workflow. Before sending a simulation, document the intended audience, why the premise fits that group, which cues are present and what safe action employees are expected to take.

Use varied cue combinations rather than teaching a fixed visual checklist. A suspicious display name or mismatched destination remains worth noticing, but employees also need a reliable way to verify the request through a known channel. Make the reporting control visible and easy to use, acknowledge reports quickly, and give corrective feedback without public blame. Simulations should test and improve the surrounding process, not manufacture a trap.

Segment results by role and scenario only where privacy rules and sample sizes make the comparison responsible. The goal is to find workflows that repeatedly create risky decisions, then redesign those workflows with stronger approval, verification or identity controls.

## Training is one layer

No awareness result makes a malicious message safe. Email authentication, attachment and link analysis, protected browsers, least-privilege access and phishing-resistant authentication should reduce what a click can accomplish. High-risk financial or administrative changes should require independent verification that does not rely on contact details supplied in the original message.

The new NIST result is best used as a measurement correction. Cue categories can structure an exercise, but they should not become a theory of employee behavior. Defenders need to connect message difficulty, work context, reporting and technical outcomes. That produces a program capable of improving systems as well as testing people.
