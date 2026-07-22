# ShadowContext

[ShadowContext](https://shadowcontext.com) is an independent cybersecurity
publication and operational threat-intelligence site. It turns primary-source
security reporting and government-published data into concise analysis for
analysts, engineers, security leaders, and other defenders.

The site is designed around one editorial idea: **signal over noise, context
over panic**.

## What the website provides

- Source-linked security briefings explaining what changed, why it matters,
  and what defenders can do next.
- Dedicated coverage of AI security, identity and threat activity, software
  vulnerabilities, resilience, and defense engineering.
- A daily Threat Intel Dashboard built from allowlisted government sources.
- Downloadable TLP:CLEAR IOC data in CSV and type-specific text feeds for file
  hashes, IP addresses, domains, and URLs.
- RSS, topic archives, category desks, a canonical XML sitemap, structured
  metadata, and original article artwork.

ShadowContext does not provide incident-response, legal, compliance, or other
professional advice. IOC data must be validated and contextualized before use
in production controls. See the site's [disclaimer](https://shadowcontext.com/disclaimer/)
for the complete limitations.

## Coverage desks and important routes

| Area | URL | Purpose |
| --- | --- | --- |
| Home | [shadowcontext.com](https://shadowcontext.com/) | Latest analysis and featured briefing |
| AI Security | [/category/ai-security/](https://shadowcontext.com/category/ai-security/) | Models, agents, AI-enabled research, and defensive implications |
| Threat Intel Dashboard | [/category/threat-intelligence/](https://shadowcontext.com/category/threat-intelligence/) | Exploited vulnerabilities, government advisories, actors, platforms, and IOC feeds |
| Defense Engineering | [/category/defense/](https://shadowcontext.com/category/defense/) | Architecture, controls, resilience, and security operations |
| Topic index | [/tags/](https://shadowcontext.com/tags/) | Articles grouped by security topic |
| RSS | [/feed.xml](https://shadowcontext.com/feed.xml) | Recent articles in RSS 2.0 format |
| Privacy | [/privacypolicy/](https://shadowcontext.com/privacypolicy/) | Site data-handling practices |
| Disclaimer | [/disclaimer/](https://shadowcontext.com/disclaimer/) | Use limitations for articles, dashboards, and feeds |

The machine-readable IOC endpoints are:

- `https://shadowcontext.com/assets/data/daily-iocs.csv`
- `https://shadowcontext.com/assets/data/daily-file-hashes.txt`
- `https://shadowcontext.com/assets/data/daily-ip-addresses.txt`
- `https://shadowcontext.com/assets/data/daily-domains.txt`
- `https://shadowcontext.com/assets/data/daily-urls.txt`

These feeds are append-only and can contain historical or expired
infrastructure. They are inputs for enrichment and review, not automatic block
lists.

## Editorial standard

Articles prioritize primary sources such as vendor advisories, government
notices, standards, and direct security research. Secondary reporting may help
with discovery, but source-specific claims should trace back to the original
material wherever possible.

Every briefing aims to answer:

1. **What actually changed?** Facts are separated from forecasts, assumptions,
   and marketing claims.
2. **Why does it matter?** Technical developments are connected to real
   architecture, operations, identity, and risk decisions.
3. **What should defenders do next?** Recommendations are practical, bounded,
   and safe to apply with appropriate testing.

The automated editorial workflow excludes organizational-breach stories,
including an explicit no-exceptions rule for breaches involving Middle Eastern
organizations. It also rejects exploit payloads, credential-theft procedures,
evasion instructions, unsupported attribution, invented impact, and other
operational abuse guidance.

## How the site is built

ShadowContext is a static [Jekyll](https://jekyllrb.com/) site published from
the `main` branch through GitHub Pages.

Important paths:

- `_posts/` — published articles and their front matter.
- `_layouts/` and `_includes/` — page structure, metadata, and reusable UI.
- `category/` — the three primary coverage desks and legacy archive routes.
- `_data/threat_dashboard.json` — normalized dashboard data.
- `assets/data/` — downloadable IOC snapshots and typed feeds.
- `assets/img/editorial/` — original article and homepage artwork.
- `automation/` — guarded publishing, SEO, validation, and dashboard jobs.
- `sitemap.xml`, `robots.txt`, and `feed.xml` — crawler and syndication output.

The site includes unique page titles and descriptions, self-referencing
canonicals, JSON-LD for the site and articles, `noindex` rules for utility or
thin pages, and a sitemap limited to canonical indexable URLs.

## Local development

Requirements:

- Ruby and Bundler
- The gems declared in `Gemfile`

Install dependencies and start the development server:

```sh
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000`.

Build the production site:

```sh
bundle exec jekyll build
```

The generated site is written to `_site/` and is not committed.

Run the full technical SEO audit after building:

```sh
ruby automation/validate_seo.rb . _site
```

## Publishing and maintenance automation

The local automation uses isolated temporary Git worktrees, validates every
candidate change, and pushes directly to `main` only after the relevant checks
pass. It uses the machine's saved Codex login and existing GitHub SSH access;
the repository does not contain an OpenAI API key.

Three user-level systemd timers maintain the site:

- **Hourly editorial run** — researches timely cybersecurity developments and
  publishes at most one eligible, source-grounded article with unique artwork.
- **Daily SEO run** — audits rendered and live technical SEO, then applies at
  most one high-confidence change within a strict file allowlist.
- **Daily threat-dashboard run** — refreshes normalized government-sourced
  intelligence, the IOC CSV, and all typed feeds.

The jobs fail closed when validation, source retrieval, file scope, build,
remote synchronization, or publishing checks do not pass. Detailed schedules,
guardrails, commands, and service operations are documented in
[`automation/README.md`](automation/README.md).

## Contact and corrections

Corrections, source concerns, and non-sensitive correspondence can be sent to
[shadowcontext@gmail.com](mailto:shadowcontext@gmail.com). Do not send secrets,
credentials, unnecessary personal data, or active exploit material.
