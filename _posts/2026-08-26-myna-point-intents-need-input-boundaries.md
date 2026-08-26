---
title: "Myna Point Flaw Makes Android Intents a Trust Boundary"
subtitle: "A newly disclosed app vulnerability shows why cross-app navigation must never inherit trust from the receiving application."
description: "A Myna Point Android flaw shows why defenders must patch mobile apps and developers must validate every intent and deep-link parameter."
date: 2026-08-26 15:10:23 +0400
layout: post
category: defense
tags: [android, mobile-security, vulnerability-management, application-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-26-myna-point-intents-need-input-boundaries.svg
image_alt: "Abstract smartphone receiving luminous data paths through a guarded boundary before they reach a protected application core"
key_points:
  - "Myna Point 2.0.6 and earlier contain an authorization flaw in a custom URL scheme handler."
  - "JVN says a malicious app on the same Android device could trigger JavaScript execution inside the affected app."
  - "Users should update, while app teams should validate every intent and prefer verified links for web destinations."
sources:
  - title: "JVN#67155805: Android App \"Myna Point\" vulnerable to improper access restriction"
    publisher: "JPCERT/CC and IPA · August 26, 2026"
    url: "https://jvn.jp/en/jp/JVN67155805/"
  - title: "マイナポイント"
    publisher: "Google Play · updated August 5, 2026"
    url: "https://play.google.com/store/apps/details?id=jp.go.soumu.mkpf.mkpfmypage&hl=en"
  - title: "Unsafe use of deep links"
    publisher: "Android Developers · October 24, 2024"
    url: "https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks?hl=en"
---

A newly disclosed Android vulnerability is a useful reminder that an app boundary is not automatically an input boundary. Japan Vulnerability Notes reported on August 26 that the Myna Point app’s custom URL scheme handler could accept an unsafe request from another application on the same device.

The immediate action is straightforward: update the app. The longer-lived lesson is for every mobile service that turns a link or intent into an in-app action. The receiving app must treat that request as untrusted, even when the destination screen itself is legitimate.

## What the advisory establishes

JVN identifies CVE-2026-73335 as an improper-authorization weakness affecting Myna Point for Android versions 2.0.6 and earlier. The coordinated advisory assigns it a CVSS 3.0 base score of 5.3 and a CVSS 4.0 base score of 4.6. Those scores reflect important preconditions: exploitation requires a malicious application to be installed on the same device and user interaction is involved.

According to JVN, that application could send an Android Intent that abuses functionality exposed by the affected custom URL scheme handler. The result could be arbitrary JavaScript execution within the Myna Point application. JVN does not report active exploitation, identify affected users, or claim that an organizational compromise occurred. Defenders should keep those limits intact rather than turning a bounded vulnerability disclosure into an unsupported incident narrative.

JVN’s remedy is to update to the latest version provided by the developer. The Google Play listing says the app requires a My Number card and shows an update dated August 5, but the store page does not expose enough version detail to prove a device is fixed. For users and administrators, the useful evidence is the version installed on the device, not merely the existence of a recent store update.

## Why cross-app input needs its own controls

Android intents let applications request actions from one another. Deep links and custom URL schemes make that interaction convenient by routing a URI into a particular application or screen. Convenience, however, does not authenticate the sender or make the URI’s parameters safe.

Android’s own security guidance warns that weak deep-link validation can enable unauthorized actions or script execution in the receiving app’s permission context. It recommends strict validation and sanitization of incoming values, checking authentication and authorization state before sensitive actions, and using verified Android App Links where a web domain can be associated with its legitimate application.

That distinction matters. A valid destination is not proof that the request is valid. The handler still needs to reject unexpected schemes, hosts, paths, parameters, and state transitions. It should not pass an incoming value into a WebView, file operation, account action, or navigation decision simply because Android delivered the intent to the expected application.

The same principle applies beyond this one app. Mobile teams often test deep links as a navigation feature: does the link open the right screen? Security testing must ask a second question: what can any other installed app cause that screen to do? That is the trust boundary exposed by this disclosure.

## What defenders and app teams should verify

Individuals who use Myna Point on Android should update it through the official store and confirm that automatic updates have not been paused. If the app is no longer needed, removing it reduces unnecessary mobile attack surface. Users should not install an application from an unsolicited link or an unofficial package source in response to a security warning.

Organizations managing Android fleets should search their mobile application inventory for Myna Point versions 2.0.6 and earlier, enforce the approved update, and verify compliance from device telemetry. A policy that merely permits the newest release is weaker than evidence that managed devices actually installed it. Administrators should also review whether devices allow unapproved or sideloaded applications, because JVN’s stated attack path begins with a malicious app already present on the device.

Application owners should inventory every exported activity, intent filter, custom scheme, and WebView entry point. Test each handler with missing, malformed, duplicated, and unexpected parameters, without turning those tests into production exploitation. Sensitive actions should re-check the user’s authenticated state and authorization at the point of use. Where links represent owned web content, verified App Links can bind routing to a controlled domain; input validation is still required after routing succeeds.

Closing CVE-2026-73335 requires an app update. Preventing the next variation requires a design rule: every intent is external input until the receiving code has validated both its structure and the authority behind the requested action.
