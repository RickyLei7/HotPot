# Dining assistant release and operations

The website stays on GitHub Pages. `assistant/wrangler.jsonc` defines a separate `hotpot-dining-assistant` Worker at `assistant.centrestjhotpot.ca`. Do not deploy or change `seat-manager` for this feature.

## Verify before publishing

```sh
npm run check:assistant
node --test tests/dining-assistant.test.mjs tests/dining-helper-client.test.mjs tests/source-attribution.test.mjs
npm run check:seo
npm run check:bilingual
npm run check:price
npm run check:html
npx wrangler deploy --dry-run --config assistant/wrangler.jsonc --outdir /tmp/hotpot-assistant-bundle-20261029
node scripts/check-assistant-runtime.mjs
```

The local runtime check uses real SQLite Durable Objects with a synthetic provider response. It does not verify OpenAI availability or routing quality. Once the dedicated key has been provisioned to the ignored, owner-only `.env.local`, run the 15-case real routing evaluation:

```sh
node --env-file=.env.local scripts/eval-dining-assistant.mjs --live
```

This makes billable API requests with synthetic restaurant questions. It prints case IDs and pass/fail only. Do not put real customer details in eval cases.

## Deploy the backend first

Verify Wrangler authentication and the selected account's ownership of `centrestjhotpot.ca`. Set `CLOUDFLARE_ACCOUNT_ID` only to that verified HotPot account. Deploy the independent Worker, then upload the dedicated key through stdin:

```sh
npx wrangler whoami
npx wrangler deploy --config assistant/wrangler.jsonc
node --env-file=.env.local scripts/upload-assistant-secret.mjs --upload
```

The upload helper refuses to run without a key, an explicit verified account ID, and `--upload`. It cannot target the reservation Worker. Do not place the key in `public/`, client code, Git, shell command arguments, screenshots or issue reports.

Check `/health` for the expected knowledge version and configuration state, then make a real `/ask` request from the website origin. Configuration readiness alone does not prove an upstream response. Verify an English price answer, Chinese answer, dietary handoff and Book Online link. Only publish the static pages after those pass.

## Browser acceptance

Check English and Chinese menu/contact pages at 320, 390, 768 and 1440 px, keyboard use, the optional collapsed panel, textarea sizing, response links and loading/error states. No model request may occur on page load, opening the panel, or clicking a quick question. Ask is the explicit send action.

Verify Book Online opens the existing reservation flow, including from a newly rendered answer. Confirm in real iPhone Safari that the existing security verification still allows proceeding. Stop before submitting an actual reservation. Check anonymous events without sending question text or inventing completed-booking events.

## Limits and failure behavior

- 500 characters / 4096 bytes per request; no raw conversation history.
- Up to three approved fact IDs as context; no customer records or booking tools.
- Provider timeout: 12 seconds. Browser timeout: 18 seconds. No automatic retry.
- Six requests per client per rolling minute, 20 per UTC day. Shared-IP guests share those limits.
- Global default: 200 requests per UTC day; configuration is capped at 500. Failed provider requests also consume quota. These are request limits, not a guaranteed dollar cap.
- State persists across Worker restarts. The next active UTC day replaces counters, salted client identifiers and timestamps. Request/answer text is not saved by the application. Provider retention is explained in the privacy policy.
- Unknown inputs, quota outage, provider refusal, invalid outputs and upstream failures leave menu, Book Online and phone links available.

Change prices in the authoritative published menu first. Run `npm run build:assistant`, review the bilingual facts and resulting knowledge version, then deploy matching backend and frontend revisions. Contact hours, phone or address changes require explicit copy review. Never publish a frontend that points to an unconfigured backend.

## Rollback

Revert the feature's static-page commit to remove the optional helper while retaining the original booking links. Backend and reservation data are independent. Do not delete Durable Objects or reservation records as a rollback step. Revoke a dedicated API key only when retiring the integration, or if the key is compromised, and verify it has no other consumers.
