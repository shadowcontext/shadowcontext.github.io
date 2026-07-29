# Google Analytics 4

ShadowContext has a consent-first Google Analytics 4 integration. It is
disabled when `_config.yml` has a blank `google_analytics` value.

## Activate analytics

Create or select a GA4 web data stream for `https://shadowcontext.com`, copy its
Measurement ID, and set it in `_config.yml`:

```yaml
google_analytics: "G-XXXXXXXXXX"
```

The Measurement ID is a public site identifier, not an API secret. Commit the
configuration change so GitHub Pages rebuilds the site.

## Consent behavior

When a valid `G-` ID is configured in a production build:

- no Google script or analytics request is loaded before visitor consent;
- the visitor can allow or decline analytics in a branded site panel;
- the choice is persisted in local storage;
- analytics settings can be reopened from the footer;
- analytics storage is granted only after consent;
- advertising storage, advertising user data, ad personalization, Google
  signals, and ad-personalization signals remain disabled;
- withdrawing consent disables further collection and removes accessible GA
  cookies.

The consent panel and analytics code are not rendered in development builds or
when the Measurement ID is blank.

## Validation

Validate the normal disabled build:

```sh
JEKYLL_ENV=production bundle exec jekyll build
node automation/analytics/validate.mjs
```

Validate the enabled integration with the non-production test ID:

```sh
JEKYLL_ENV=production bundle exec jekyll build \
  --config _config.yml,automation/analytics/_config.test.yml \
  --destination .artifacts/analytics-site
node automation/analytics/validate.mjs \
  --build-directory .artifacts/analytics-site \
  --measurement-id G-TEST123456
```
