# Menu and booking assistant — implementation plan

## First release

Offer an opt-in English/Traditional Chinese assistant on the menu and contact pages. It answers dining questions using the current published menu, explains booking, and links to the existing booking flow. Book Online remains directly available. The assistant cannot create, cancel, change, confirm or look up reservations.

Use OpenAI only to match questions to approved facts and identify explicit adult-price comparisons. Render restaurant facts and calculate amounts in application code. Do not allow model-written prices, invented availability, arbitrary links, or allergy-safety assurances. Unknown questions go to staff. Generate the assistant knowledge file from the published menu schema and checked-in bilingual facts, and fail verification on drift.

## Architecture

- Existing static GitHub Pages site stays in place. Add a small progressively enhanced inline component; no homepage takeover, floating overlay, or extra booking step.
- A separate Cloudflare Worker handles POST /ask. Keep it independent of the reservation Worker and database.
- Strict request/body/history validation, exact CORS origins, server-held API key, provider timeout, no retry loops, output schema and validation.
- A separate SQLite Durable Object enforces an atomic shared daily request cap and rolling per-client limits before each model call. Store daily counters and salted daily client identifiers with request timestamps, not question or reservation text. Fail closed when safeguards are unavailable.
- Responses API with store:false and a small model. Ask only for fact ids, topic, language and optional explicit adult/plan selections. No tools with reservation/customer access.
- Visible AI/privacy notice before sending; reject obvious phone numbers and email addresses and direct customers to the booking form. An outage must leave menu, contact and booking links usable.

## Work and release gates

1. Verify source branch, approved credential destination and current official API docs.
2. Generate grounded bilingual knowledge and deterministic price calculator.
3. Implement and test backend, quota controls, refusal paths, provider failures and prompt-injection resilience.
4. Implement accessible inline client, original booking handoff, privacy notice, bilingual app/static parity and anonymous analytics events.
5. Run repository tests/SEO/bilingual/price/HTML checks, Wrangler dry run, local HTTP integration and visual checks where browser access is available.
6. With the API key created and deployment authentication available, test real English/Chinese model routing against representative questions and adversarial prompts. Upload the key only as a server secret, verify the public backend, then publish the website and verify persisted public behavior.
7. Record exact deployment/test evidence, limits and remaining blockers. Do not describe fixtures or an unconfigured backend as a working live AI feature.

## Deployment prerequisites

- Provision a dedicated HotPot API key through the approved secure flow. Keep it in an ignored local env file and upload only to the independent assistant Worker as a server secret.
- Authenticate Wrangler and verify the Cloudflare account owns centrestjhotpot.ca before deployment. Keep the reservation Worker and its data untouched.
- Complete browser verification with an available, authorized browser before launch. Preserve user browser settings.

## Success measurement

Record opt-in opens, question topics, successful answers, fallback rates and clicks to Book Online without sending raw questions to analytics. Existing trusted booking lifecycle events remain the source for pending versus confirmed results. Do not label a chat answer or booking-link click as a completed reservation. Compare confirmed booking rates with a control when traffic allows.
