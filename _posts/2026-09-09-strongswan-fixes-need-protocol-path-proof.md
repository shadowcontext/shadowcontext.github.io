---
title: "strongSwan 6.1.0 Fixes Need Protocol-Path Proof"
subtitle: "Eleven fixes make enabled IKE versions, plugins, and authentication paths central to VPN gateway assurance."
description: "strongSwan 6.1.0 fixes eleven vulnerabilities; defenders should verify gateway versions, enabled protocols, plugins, and authentication paths."
date: 2026-09-09 06:12:47 +0400
layout: post
category: defense
tags: [strongswan, vpn-security, vulnerability-management, network-defense]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-09-strongswan-fixes-need-protocol-path-proof.svg
image_alt: "Abstract encrypted network tunnel passing through layered blue and amber gateway rings"
key_points:
  - "strongSwan 6.1.0 fixes eleven vulnerabilities across IKE, certificate, and EAP processing."
  - "Two flaws affect security boundaries directly: pre-authentication Child SA creation and EAP identity binding."
  - "Closure requires proof of the running version plus enabled protocols, plugins, and peer configurations."
sources:
  - title: "Multiples vulnérabilités dans strongSwan"
    publisher: "CERT-FR · 8 September 2026"
    url: "https://www.cert.ssi.gouv.fr/avis/CERTFR-2026-AVI-1129/"
  - title: "strongSwan 6.1.0 Released"
    publisher: "strongSwan Project · 7 September 2026"
    url: "https://www.strongswan.org/blog/2026/09/07/strongswan-6.1.0-released.html"
  - title: "strongSwan Vulnerability (CVE-2026-78135)"
    publisher: "strongSwan Project · 7 September 2026"
    url: "https://www.strongswan.org/blog/2026/09/07/strongswan-vulnerability-%28cve-2026-78135%29.html"
  - title: "strongSwan Vulnerability (CVE-2026-78133)"
    publisher: "strongSwan Project · 7 September 2026"
    url: "https://www.strongswan.org/blog/2026/09/07/strongswan-vulnerability-%28cve-2026-78133%29.html"
---

CERT-FR has warned of multiple strongSwan vulnerabilities following the release of version 6.1.0. The update fixes eleven flaws spanning IKE state handling, certificate parsing, EAP authentication, and logging. Their consequences are not uniform: the vendor describes denial-of-service conditions, an authorization bypass, a pre-authentication security-association flaw, and one use-after-free that might permit remote code execution by an authenticated peer.

For defenders, the correct response is not simply to search for the product name. A useful assessment must connect the running strongSwan build to the IKE versions, plugins, authentication methods, and peer behavior actually permitted on each gateway.

## Two flaws cross trust boundaries

CVE-2026-78135 is the clearest reason to treat this as more than a routine parser update. The strongSwan advisory says versions from 5.9.7 can accept a `CREATE_CHILD_SA` request while the parent IKE security association is not yet established. Under those conditions, an unauthenticated peer could potentially create a usable Child SA before authentication completes. Version 6.1.0 fixes the behavior.

CVE-2026-78134 addresses a different trust decision. The affected EAP-PEAP and EAP-TTLS plugins can fail to propagate authentication details from the inner EAP method correctly, creating a mismatch between the presented identity and the identity that actually authenticated. The vendor characterizes the result as incorrect identity binding and a potential authorization bypass.

These findings point to two tests after maintenance: an unauthenticated exchange must never produce usable tunnel state, and the identity attached to an authorized session must be the identity proven by the inner authentication method. A successful service restart does not establish either property.

## Exposure follows features, not one score

The remaining fixes reinforce why gateway triage needs configuration context. CVE-2026-78133 affects strongSwan 6.0.0 and newer when multiple key exchanges are accepted. The vendor says an authenticated peer can trigger a use-after-free during certain IKEv2 rekeying collisions; remote code execution might be possible, although exploitation requires the peer to be authenticated and to satisfy additional conditions.

Other corrected flaws involve PKCS#7 containers, X.509 attribute certificates, EAP-AKA messages, and IKE message logging. Several can cause crashes, infinite processing, or gradual memory exhaustion. The release announcement provides the affected-version starting point for each CVE, while the individual advisories identify relevant plugins or protocol paths.

That distinction changes priority. An internet-reachable responder accepting IKE traffic has a different exposure profile from an internal gateway with a narrow peer allowlist. An installation that does not load a named plugin may not expose that plugin's path, but it still needs review for the other fixes. Feature absence is useful evidence only when defenders verify the live process and its effective configuration.

## Build an evidence-based rollout

Start with every place strongSwan may run: dedicated VPN gateways, cloud images, remote-access concentrators, embedded appliances, containers, and lab systems promoted into production. Record the package source, installed and running versions, service owner, reachable interfaces, accepted IKE versions, loaded plugins, EAP methods, and whether multiple key exchanges are enabled.

Upgrade to 6.1.0 where the release is supported in the local deployment path, or follow the vendor's linked patch guidance for maintained older branches. Test configuration compatibility before broad rollout. The release disables IKEv1 by default and changes the default configured protocol version to IKEv2, so an upgrade can expose undocumented legacy-peer dependencies even when the security fixes work as intended.

After deployment, confirm that the active daemon is the updated binary, then exercise representative connection, rekey, certificate, and failure paths. Check that expected peers reconnect, rejected peers stay rejected, identity-to-policy mapping remains correct, and resource use stays stable under malformed or incomplete exchanges. Preserve the results with the gateway's configuration record.

## Close on the running gateway

CERT-FR directs users to vendor guidance for remediation and lists versions earlier than 6.1.0 as affected. That is the baseline, not the closure artifact. Package installation can coexist with an old process, a missed secondary node, or a configuration that quietly re-enables a legacy path.

A defensible closure record should therefore pair version evidence with effective protocol and plugin state, successful negative authentication tests, and confirmation from every gateway node. The central lesson from this release is precise: VPN assurance lives in the complete negotiation path, not in a package inventory row alone.
