# Centre Street Japanese HotPot Six-Month Competitive Growth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a measured six-month growth program that raises Monday-Thursday traffic, protects weekend revenue, keeps the $28.99 AYCE price, and prepares a verified response to the expected Calgary Haidilao opening.

**Architecture:** Treat store operations, content preparation, digital acquisition, measurement, and competitor response as separate testable workstreams joined by one weekly scorecard. Execute only one material growth experiment at a time, use complete data periods, and require explicit approval before every external publication, promotion, price change, budget change, or account mutation.

**Tech Stack:** Markdown operating documents, CSV store scorecards, existing Node.js marketing scripts, Google Ads API, GA4 Data/Admin APIs, Google Search Console API, Google Business Profile when accessible, GitHub Pages website, and current social publishing workflows.

## Global Constraints

- Keep `$28.99 AYCE Hot Pot` as the hero offer during the initial program.
- Every primary acquisition surface must use these proof points: `$28.99 AYCE Hot Pot`, `Soup Base Included`, `Individual Hot Pot`, and `Unlimited AAA Beef`.
- Use `Add Unlimited Taiwanese Snacks for $3.99 per person` as the secondary value message.
- Keep the $19.99 personal hot pot, beef noodle soup, rice meals, and drinks available without displacing AYCE in paid acquisition.
- Do not claim `AAA Beef` unless supplier purchasing, menu wording, staff explanation, and actual service support the claim.
- Use English for Google Business Profile, Facebook, Instagram, Threads, and TikTok; use Simplified Chinese for Xiaohongshu.
- Do not lower the $28.99 price or activate a free-drink promotion without the trigger and approval defined in the design.
- Do not publish, reply, change a price, increase a budget, mutate a Google account, or use a competitor name without explicit approval for that exact action.
- Do not treat page views, menu views, directions, or general engagement as confirmed diners or revenue.
- Use qualified telephone actions as the primary Google Ads conversion; keep menu, AYCE interest, and directions as supporting signals.
- Keep Performance Max Final URL Expansion disabled unless a later approved experiment explicitly changes it.
- Use complete data periods: at least seven days for operations and 14 days for material advertising decisions.
- Request Google reviews neutrally from real customers; no incentives, positive-review gating, or selective solicitation.
- Preserve unrelated user changes in the dirty worktree; stage and commit only files listed by the active task.

---

## File Structure

### Existing Files to Update

- `marketing/revenue-growth-plan-2026.md`: replace pre-launch AYCE assumptions with the current live offer, revenue baseline, and six-month targets.
- `marketing/weekly-execution-checklist.md`: align weekly work with the Tuesday/Thursday/Saturday cadence and policy-safe review requests.
- `marketing/analytics-event-map.md`: align documentation with current phone-first conversion behavior and remove stale duplicate-lead guidance.
- `marketing/in-store-revenue-scripts.md`: replace old AYCE-coming-soon scripts with current offer and snack-upgrade scripts.

### New Program Files

- `marketing/competitive-growth/daily-scorecard.csv`: one row per open day with store and source data.
- `marketing/competitive-growth/weekly-scorecard.csv`: one row per complete Monday-Sunday week.
- `marketing/competitive-growth/competitor-monitor.csv`: dated verified Calgary Haidilao observations with source URLs.
- `marketing/competitive-growth/README.md`: operating rules, field definitions, ownership, and review cadence.
- `marketing/competitive-growth/2026-08-17-week-01-approval-package.md`: exact week-one English and Simplified Chinese content plus publication gates.
- `marketing/competitive-growth/2026-08-17-digital-baseline.md`: verified website, tracking, GA4, GSC, and Google Ads baseline.
- `marketing/competitive-growth/2026-08-17-store-brief.md`: one-page staff offer, upsell, review, and data-capture brief.
- `marketing/competitive-growth/weekly-reviews/YYYY-MM-DD.md`: one decision record per completed week.
- `marketing/competitive-growth/monthly-reviews/YYYY-MM.md`: one decision record per completed month.
- `marketing/competitive-growth/haidilao-response-kit.md`: pre-approved scenario drafts that remain unpublished until triggered.

### Existing Commands and Reports

- `npm run check:attribution`
- `node scripts/check-tracking-runtime.mjs`
- `npm run check:html`
- `npm run build`
- `npm run google:verify-data`
- `npm run google:audit`
- `npm run ads:audit`
- `node scripts/ga4-configure-tracking-dimensions.mjs`
- `node scripts/google-ads-long-term-optimize.mjs`
- `marketing/reports/google-marketing-audit-latest.json`
- `marketing/reports/google-ads-audit-latest.json`
- `marketing/reports/ga4-tracking-dimensions-latest.json`
- `marketing/reports/google-ads-long-term-optimization-latest.json`

---

### Task 1: Establish the Store and Digital Measurement Baseline

**Files:**
- Create: `marketing/competitive-growth/README.md`
- Create: `marketing/competitive-growth/daily-scorecard.csv`
- Create: `marketing/competitive-growth/weekly-scorecard.csv`
- Modify: `marketing/revenue-growth-plan-2026.md`
- Modify: `marketing/analytics-event-map.md`

**Interfaces:**
- Consumes: owner-provided baseline of CA$500 and approximately 17 guests Monday-Thursday, CA$1,500 and approximately 50 guests Friday-Sunday, and CA$30 average spend.
- Produces: one canonical daily scorecard schema and one weekly decision schema used by Tasks 5-9.

- [ ] **Step 1: Create the competitive-growth directory and operating README**

Create `marketing/competitive-growth/README.md` with these exact operating rules:

```markdown
# Competitive Growth Operating System

Baseline: Monday-Thursday CA$500 and 17 guests per day; Friday-Sunday CA$1,500 and 50 guests per day; CA$30 average spend.

Weekly review period: Monday-Sunday, America/Edmonton.

Record store data every open day. Review digital data only after its latest complete date. Do not infer diners or revenue from website events.

Change one material variable at a time. Store operations use seven complete days; advertising uses 14 complete days after a material conversion or bidding change.

External publishing, account mutations, budget changes, price changes, promotions, and public replies require explicit approval.
```

- [ ] **Step 2: Create the daily scorecard schema**

Create `marketing/competitive-growth/daily-scorecard.csv` with this header and the August baseline reference rows:

```csv
date,day_of_week,revenue,guest_count,table_count,average_spend_per_guest,ayce_guest_count,personal_hotpot_count,snack_upgrade_count,drink_attachment_count,new_guest_count,returning_guest_count,heard_google,heard_social,heard_friend_family,heard_passing_by,heard_delivery,heard_repeat,heard_other,phone_calls_known,phone_calls_became_visits,service_issue,stock_issue,quality_issue,notes
2026-08-baseline,Monday-Thursday,500,17,,30,,,,,,,,,,,,,,,,,,,Owner-provided average daily baseline
2026-08-baseline,Friday-Sunday,1500,50,,30,,,,,,,,,,,,,,,,,,,Owner-provided average daily baseline
```

- [ ] **Step 3: Create the weekly scorecard schema**

Create `marketing/competitive-growth/weekly-scorecard.csv` with:

```csv
week_start,week_end,weekday_revenue,weekend_revenue,total_revenue,weekday_guests_per_day,weekend_guests_per_day,total_guests,average_spend_per_guest,ayce_guests,snack_upgrade_rate,drink_attachment_rate,google_attributed_guests,phone_calls,phone_calls_became_visits,ads_spend,qualified_ads_calls,cost_per_qualified_call,ga4_phone_clicks,ga4_directions_clicks,ga4_menu_clicks,new_google_reviews,google_rating,experiment,result,decision,notes
2026-08-17,2026-08-23,,,,,,,,,,,,,,,,,,,,,,AYCE four-proof-point message,,,First complete program week
```

- [ ] **Step 4: Update the revenue plan to current facts**

Modify `marketing/revenue-growth-plan-2026.md` so it states AYCE is live at $28.99, soup base is included, personal pots are used, AAA beef/lamb/pork/chicken are included as approved, and the snack upgrade is +$3.99. Replace old `coming soon` and `late June` language with the current six-month baseline and targets.

- [ ] **Step 5: Correct the analytics event documentation**

Modify `marketing/analytics-event-map.md` to match `public/site-events.js`:

- `phone_click` records phone intent.
- `generate_lead` accompanies a qualifying phone action.
- Reservation wording is represented through `cta_intent=reservation`; there is no separate reservation system.
- `directions_click` is a supporting visit-intent event and must not create a duplicate lead.
- Direct Google Ads phone conversion remains primary; GA4 phone and lead events remain reporting-only in Google Ads.

- [ ] **Step 6: Validate the documentation and CSV files**

Run:

```bash
rg -n "coming soon|expected late June|AYCE is expected" marketing/revenue-growth-plan-2026.md marketing/analytics-event-map.md
node -e "const fs=require('fs'); for (const f of ['marketing/competitive-growth/daily-scorecard.csv','marketing/competitive-growth/weekly-scorecard.csv']) { const rows=fs.readFileSync(f,'utf8').trim().split(/\n/).map(r=>r.split(',').length); if (!rows.every(n=>n===rows[0])) throw new Error(f+' has inconsistent column counts: '+rows.join(',')); console.log(f, rows[0]+' columns'); }"
git diff --check -- marketing/competitive-growth marketing/revenue-growth-plan-2026.md marketing/analytics-event-map.md
```

Expected:

- `rg` returns no stale pre-launch wording.
- Both CSV files report consistent column counts.
- `git diff --check` exits zero.

- [ ] **Step 7: Commit the baseline system**

```bash
git add marketing/competitive-growth/README.md marketing/competitive-growth/daily-scorecard.csv marketing/competitive-growth/weekly-scorecard.csv marketing/revenue-growth-plan-2026.md marketing/analytics-event-map.md
git commit -m "Add competitive growth measurement baseline"
```

---

### Task 2: Prepare the First-Week Content and Staff Package

**Files:**
- Create: `marketing/competitive-growth/2026-08-17-week-01-approval-package.md`
- Create: `marketing/competitive-growth/2026-08-17-store-brief.md`
- Modify: `marketing/in-store-revenue-scripts.md`
- Modify: `marketing/weekly-execution-checklist.md`

**Interfaces:**
- Consumes: primary and secondary messages from the approved design.
- Produces: exact owner-reviewable content and staff wording; Task 5 may publish only after explicit approval.

- [ ] **Step 1: Write the exact week-one approval package**

Create `marketing/competitive-growth/2026-08-17-week-01-approval-package.md` with this schedule and copy:

```markdown
# Week 1 Approval Package: August 17-23, 2026

Nothing in this file is approved for publication until the owner confirms the final asset and platform copy.

## Tuesday 11:30 AM: AYCE Value Proof

English:
Calgary AYCE hot pot for $28.99. Soup base is included, everyone gets an individual pot, and AAA beef, lamb, pork, and chicken are unlimited. Available during our regular dinner hours at Centre Street Japanese HotPot. Call (403) 455-3188 for today's table availability.

Simplified Chinese:
卡尔加里 $28.99 火锅自助，锅底已经包含，一人一锅，AAA 牛肉、羊肉、猪肉和鸡肉无限量。正常晚餐时间就可以吃。想确认今天座位，可以致电 (403) 455-3188。

Required asset: restaurant-owned video or photo showing real meat, one personal pot, broth, and a full table.

## Wednesday Story: Real Food Proof

On-screen text:
$28.99 AYCE
Soup Base Included
Individual Pot
Unlimited AAA Beef

Required clips: AAA beef close-up, meat entering a personal pot, bubbling broth, and one refill.

## Thursday 11:30 AM: Individual Pot

English:
Your broth. Your spice level. Your own pot. Enjoy $28.99 AYCE hot pot with the soup base included and unlimited AAA beef, lamb, pork, and chicken.

Simplified Chinese:
每个人选自己的锅底和辣度，不用迁就别人，也不用共用一锅。$28.99 火锅自助，锅底已包含，AAA 牛肉、羊肉、猪肉和鸡肉无限量。

Required asset: two or more different personal soup bases at the same table.

## Friday 3:30-4:30 PM Story

English:
Planning hot pot this weekend?
$28.99 AYCE
Soup base included
Call (403) 455-3188

## Saturday 10:30 AM: Taiwanese Snack Upgrade

English:
Make AYCE even better. Add unlimited Taiwanese snacks for $3.99 per person, including Taiwanese fried chicken, takoyaki, crispy chicken cutlet, golden fried buns, crispy squid legs, and more.

Simplified Chinese:
火锅自助每人加 $3.99，就可以升级台湾小吃无限量。盐酥鸡、章鱼小丸子、香酥鸡排、黄金炸馒头、炸鱿鱼须等都可以选。

Required asset: restaurant-owned Taiwanese fried chicken hero image with four supporting snack images.
```

- [ ] **Step 2: Write the one-page store brief**

Create `marketing/competitive-growth/2026-08-17-store-brief.md` with:

```markdown
# Store Brief: August 17-23, 2026

Primary message: $28.99 AYCE, soup base included, individual pot, unlimited AAA beef.

Snack script: You can add unlimited Taiwanese snacks for $3.99 per person, including fried chicken, takoyaki, and more.

Phone opening: Thank you for calling Centre Street Japanese HotPot. We are open Monday to Friday from 5:00 PM to 10:30 PM, and Saturday and Sunday from 12:00 PM to 10:30 PM. Our $28.99 AYCE includes the soup base and individual pots. How can I help you?

Review request: If you would like to share your honest experience, you can scan this Google Review QR code. Reviews are optional and receive no incentive.

Record every day: revenue, guests, tables, AYCE guests, snack upgrades, drink attachments, how guests heard about us, and service/stock/quality issues.
```

- [ ] **Step 3: Replace outdated staff wording**

Modify `marketing/in-store-revenue-scripts.md` to remove all AYCE-coming-soon language and use the store brief wording. Change review guidance from asking only satisfied customers to a neutral, consistent invitation for real guests.

- [ ] **Step 4: Align the weekly checklist**

Modify `marketing/weekly-execution-checklist.md` so:

- Monday confirms current AYCE facts and starts the scorecard.
- Tuesday/Thursday/Saturday use the approved program cadence.
- Review requests are neutral and non-incentivized.
- Sunday closes the scorecard but does not judge incomplete Google data.

- [ ] **Step 5: Validate wording and approval gates**

Run:

```bash
rg -n "coming soon|expected late June|satisfied customers|five-star|5-star|free.*review" marketing/in-store-revenue-scripts.md marketing/weekly-execution-checklist.md marketing/competitive-growth/2026-08-17-week-01-approval-package.md marketing/competitive-growth/2026-08-17-store-brief.md
rg -n "Nothing in this file is approved for publication" marketing/competitive-growth/2026-08-17-week-01-approval-package.md
git diff --check -- marketing/in-store-revenue-scripts.md marketing/weekly-execution-checklist.md marketing/competitive-growth/2026-08-17-week-01-approval-package.md marketing/competitive-growth/2026-08-17-store-brief.md
```

Expected:

- No stale or policy-unsafe wording.
- The publication gate is present.
- Diff check exits zero.

- [ ] **Step 6: Commit the first-week preparation**

```bash
git add marketing/competitive-growth/2026-08-17-week-01-approval-package.md marketing/competitive-growth/2026-08-17-store-brief.md marketing/in-store-revenue-scripts.md marketing/weekly-execution-checklist.md
git commit -m "Prepare first competitive growth week"
```

---

### Task 3: Verify Website, Tracking, and Google Ads Alignment

**Files:**
- Create: `marketing/competitive-growth/2026-08-17-digital-baseline.md`
- Refresh: `marketing/reports/google-marketing-audit-latest.json`
- Refresh: `marketing/reports/google-ads-audit-latest.json`
- Refresh: `marketing/reports/ga4-tracking-dimensions-latest.json`
- Refresh: `marketing/reports/google-ads-long-term-optimization-latest.json`

**Interfaces:**
- Consumes: live website, current OAuth/API credentials, existing audit scripts, and Global Constraints.
- Produces: a dated verified baseline and a go/no-go decision for week-one acquisition.

- [ ] **Step 1: Run local website and runtime checks**

Run:

```bash
npm run check:attribution
node scripts/check-tracking-runtime.mjs
npm run check:html
npm run build
```

Expected:

- Attribution check exits zero.
- Runtime tracking check reports paid landing, session attribution, phone lead, privacy, and directions separation as passed.
- HTML validation exits zero.
- Production build exits zero; non-fatal Vinext asset-resolution warnings may remain documented.

- [ ] **Step 2: Refresh read-only Google data**

Run:

```bash
npm run google:verify-data
npm run google:audit
npm run ads:audit
node scripts/ga4-configure-tracking-dimensions.mjs
node scripts/google-ads-long-term-optimize.mjs
```

Expected:

- GA4 Admin/Data and Search Console verification succeeds.
- The marketing audit writes `marketing/reports/google-marketing-audit-latest.json`.
- The Ads audit writes `marketing/reports/google-ads-audit-latest.json`.
- GA4 tracking dimensions report no missing desired dimensions.
- Long-term Ads script runs in validate mode and reports no budget mutation.
- Final URL Expansion remains disabled and requested negatives remain present.

- [ ] **Step 3: Create the digital baseline report**

Create `marketing/competitive-growth/2026-08-17-digital-baseline.md` containing:

1. Latest complete GA4 and GSC dates.
2. Seven-day and previous-seven-day users, sessions, qualified calls, phone clicks, directions, menu clicks, and AYCE interest.
3. Current Google Ads campaign names, budgets, schedules, landing pages, spend, clicks, qualified calls, and primary conversion actions.
4. Confirmation that Search and Performance Max land on the AYCE page.
5. Confirmation that Final URL Expansion is disabled.
6. Confirmation that phone is primary and browsing/directions remain supporting signals.
7. `GO` only when all website, tracking, and account checks pass; otherwise `NO-GO` with the exact failed command and no external publishing.

- [ ] **Step 4: Validate baseline provenance**

Run:

```bash
rg -n "Latest complete|GA4|GSC|Google Ads|Final URL Expansion|qualified call|GO|NO-GO" marketing/competitive-growth/2026-08-17-digital-baseline.md
git diff --check -- marketing/competitive-growth/2026-08-17-digital-baseline.md marketing/reports/google-marketing-audit-latest.json marketing/reports/google-ads-audit-latest.json marketing/reports/ga4-tracking-dimensions-latest.json marketing/reports/google-ads-long-term-optimization-latest.json
```

Expected: all required sections are present and diff check exits zero.

- [ ] **Step 5: Commit only the baseline and refreshed reports**

```bash
git add marketing/competitive-growth/2026-08-17-digital-baseline.md marketing/reports/google-marketing-audit-latest.json marketing/reports/google-ads-audit-latest.json marketing/reports/ga4-tracking-dimensions-latest.json marketing/reports/google-ads-long-term-optimization-latest.json
git commit -m "Record competitive growth digital baseline"
```

---

### Task 4: Review and Approve the First External Actions

**Files:**
- Review: `marketing/competitive-growth/2026-08-17-week-01-approval-package.md`
- Review: `marketing/competitive-growth/2026-08-17-digital-baseline.md`
- Review: restaurant-owned media selected for each scheduled item

**Interfaces:**
- Consumes: Tasks 2 and 3.
- Produces: explicit per-platform publishing approval and, separately, explicit approval for any Google Ads copy or setting mutation.

- [ ] **Step 1: Present the owner approval package**

Show the owner:

- Final English and Simplified Chinese copy.
- Exact platform and publication time.
- Exact restaurant-owned image/video for each item.
- Current prices, hours, phone number, and AYCE inclusions.
- Digital baseline `GO` or `NO-GO` result.

- [ ] **Step 2: Record bounded approval**

Add an approval section to the package recording only actions the owner explicitly confirms:

```markdown
## Approval Record

Approved platforms:
Approved copy items:
Approved assets:
Approved publication dates and times:
Approved Google Ads changes, if any:
Not approved:
Owner confirmation date:
```

The values must reflect the owner's actual response; do not infer approval from silence or from approval of a different platform.

- [ ] **Step 3: Stop on NO-GO or missing approval**

If the digital baseline says `NO-GO`, or an item lacks exact approval, do not publish or mutate. Report the blocker and retain the prepared files.

- [ ] **Step 4: Commit the approval record**

```bash
git add marketing/competitive-growth/2026-08-17-week-01-approval-package.md
git commit -m "Record week one publishing approval"
```

---

### Task 5: Execute and Measure the First Seven Days

**Files:**
- Modify daily: `marketing/competitive-growth/daily-scorecard.csv`
- Modify after Sunday: `marketing/competitive-growth/weekly-scorecard.csv`
- Create: `marketing/competitive-growth/weekly-reviews/2026-08-23.md`
- Refresh after complete data is available: `marketing/reports/google-marketing-audit-latest.json`
- Refresh after complete data is available: `marketing/reports/google-ads-audit-latest.json`

**Interfaces:**
- Consumes: approved actions from Task 4 and scorecards from Task 1.
- Produces: first measured result and exactly one continue/adjust/stop decision.

- [ ] **Step 1: Perform only approved publications**

Publish the approved Tuesday, Thursday, Saturday, Wednesday Story, and Friday Story items only on the explicitly approved platforms. After each publication, verify the live post, copy, asset, phone number, price, and link.

- [ ] **Step 2: Keep paid media stable**

During the first seven days:

- Do not change price, total budget, bidding, schedule, targeting, landing page, or primary conversion.
- Add no Haidilao brand terms.
- If an obviously irrelevant search term appears and is spending repeatedly, document it; obtain approval before adding a negative keyword.

- [ ] **Step 3: Append store data after each open day**

Add one complete row to `daily-scorecard.csv`. Use blank cells only for information that was genuinely unavailable; never estimate Google-attributed guests or calls that became visits.

- [ ] **Step 4: Refresh digital data after the latest complete date advances**

Run:

```bash
npm run google:audit
npm run ads:audit
```

Do not compare an incomplete date with a full prior day.

- [ ] **Step 5: Calculate the first weekly result**

Populate the `2026-08-17` row in `weekly-scorecard.csv`. Create `marketing/competitive-growth/weekly-reviews/2026-08-23.md` with:

```markdown
# Weekly Review: August 17-23, 2026

Experiment: AYCE four-proof-point message.
Baseline: 17 weekday guests and CA$500 weekday revenue per day; 50 weekend guests and CA$1,500 weekend revenue per day.
Target: 20-22 weekday guests and CA$600-660 weekday revenue per day; protect weekend baseline; average spend at least CA$30.

Store result:
Digital result:
Data-quality limits:
Operational issues:
Decision: Continue, adjust one variable, or stop.
Next approved experiment:
```

Replace each result line with actual measured values and evidence. Do not infer revenue from GA4.

- [ ] **Step 6: Apply the decision rule**

- If weekday guests reach 20-22 and average spend remains at least CA$30: continue unchanged for a second week.
- If reach/menu interest rises but calls/directions do not: change only CTA clarity in the next content package.
- If calls rise but store traffic does not: change only phone handling or availability wording.
- If store traffic rises but average spend falls: change only snack/drink attachment execution.
- If repeated quality or service issues appear: fix operations before increasing ads.

- [ ] **Step 7: Validate and commit week one**

Run:

```bash
git diff --check -- marketing/competitive-growth/daily-scorecard.csv marketing/competitive-growth/weekly-scorecard.csv marketing/competitive-growth/weekly-reviews/2026-08-23.md marketing/reports/google-marketing-audit-latest.json marketing/reports/google-ads-audit-latest.json
```

Then:

```bash
git add marketing/competitive-growth/daily-scorecard.csv marketing/competitive-growth/weekly-scorecard.csv marketing/competitive-growth/weekly-reviews/2026-08-23.md marketing/reports/google-marketing-audit-latest.json marketing/reports/google-ads-audit-latest.json
git commit -m "Review first competitive growth week"
```

---

### Task 6: Run the 30-Day Weekday Growth Cycle

**Files:**
- Modify weekly: `marketing/competitive-growth/daily-scorecard.csv`
- Modify weekly: `marketing/competitive-growth/weekly-scorecard.csv`
- Create weekly: `marketing/competitive-growth/weekly-reviews/2026-08-30.md`
- Create weekly: `marketing/competitive-growth/weekly-reviews/2026-09-06.md`
- Create weekly: `marketing/competitive-growth/weekly-reviews/2026-09-13.md`
- Create: `marketing/competitive-growth/monthly-reviews/2026-09.md`
- Create one owner-approval package per publication week under `marketing/competitive-growth/`

**Interfaces:**
- Consumes: Task 5 decision and four weekly complete data periods.
- Produces: 30-day result against 22-25 weekday guests, CA$660-750 weekday revenue, and CA$30 average spend.

- [ ] **Step 1: Prepare each weekly package with the fixed cadence**

Use:

- Tuesday 11:30 AM: $28.99 and soup-base value.
- Thursday 11:30 AM: individual pot and unlimited AAA beef.
- Saturday 10:30 AM: Taiwanese snacks and milk tea.
- Optional Wednesday and Friday Stories using fresh restaurant-owned footage.

Each package repeats the exact publication approval gate from Task 2.

- [ ] **Step 2: Rotate content without changing the offer**

Across the month, keep the approved mix:

- 50% AYCE value proof.
- 20% individual-pot choice.
- 15% +$3.99 snack upgrade.
- 10% milk tea, beef noodle, or supporting meals.
- 5% honest local social proof.

- [ ] **Step 3: Review Google Ads every complete week but mutate only at 14-day gates**

Run weekly:

```bash
npm run google:audit
npm run ads:audit
```

At the first 14-day gate, a 10-20% budget increase may be proposed only when the campaign uses approximately 80% or more of budget, search terms remain relevant, and qualified calls or reconciled store visits support growth. Proposal is not approval.

- [ ] **Step 4: Close each weekly scorecard**

For each weekly review, state actual store result, digital result, data-quality limits, one decision, and one next experiment. Never change more than one material variable.

- [ ] **Step 5: Create the 30-day review**

Create `marketing/competitive-growth/monthly-reviews/2026-09.md` with:

- Baseline and four weekly rows.
- Average weekday guests and revenue.
- Weekend protection result.
- Average spend.
- AYCE guest volume.
- Snack and drink attachment baselines.
- Google-attributed guests known from store responses.
- Google Ads spend and qualified-call result.
- Review growth and recurring review themes.
- One selected next-month priority.

- [ ] **Step 6: Apply the 30-day decision**

- If weekday traffic is 22-25 and average spend is at least CA$30: continue value-led growth.
- If traffic is below 22 but digital intent rises: improve store conversion and phone handling before budget.
- If both digital intent and store traffic are flat: propose one approved creative or keyword test.
- Do not activate the free-drink fallback during this phase unless the design's verified-competitor and two-week decline conditions are already met.

- [ ] **Step 7: Commit each weekly review and the monthly review separately**

Use commit messages:

```bash
git commit -m "Review competitive growth week two"
git commit -m "Review competitive growth week three"
git commit -m "Review competitive growth week four"
git commit -m "Complete first competitive growth month"
```

Stage only the scorecards, current approval package, refreshed reports, and corresponding review file for each commit.

---

### Task 7: Build the 90-Day Operational and Reputation Moat

**Files:**
- Modify: `marketing/competitive-growth/README.md`
- Create monthly: `marketing/competitive-growth/monthly-reviews/2026-10.md`
- Create monthly: `marketing/competitive-growth/monthly-reviews/2026-11.md`
- Modify continuously: `marketing/competitive-growth/daily-scorecard.csv`
- Modify continuously: `marketing/competitive-growth/weekly-scorecard.csv`

**Interfaces:**
- Consumes: 30-day baselines for service issues, snack attachment, drink attachment, review themes, and acquisition.
- Produces: measurable service standards and 90-day readiness for the expected competitor opening.

- [ ] **Step 1: Convert observed service baselines into internal standards**

Add to `marketing/competitive-growth/README.md` the measured and owner-approved standards for:

- Greeting and menu explanation.
- First food delivery.
- Meat and vegetable refills.
- Soup-base consistency.
- Sauce-station, floor, table, entrance, and washroom checks.
- Telephone availability response.

Use actual first-month measurements; do not publish internal service times as customer promises.

- [ ] **Step 2: Track repeat operating failures**

Classify every issue as meat quality, broth, refill delay, missing item, communication, cleanliness, payment, stock, or other. An issue repeated in two weeks becomes an operating task before additional ad spend.

- [ ] **Step 3: Maintain policy-safe review growth**

Ask all real tables through the same neutral QR process, reply weekly, and summarize recurring positive and negative themes monthly. Never connect a discount or free product to a review.

- [ ] **Step 4: Measure the 90-day target**

Target:

- 25-27 weekday guests per day.
- CA$750-810 weekday revenue per day.
- 50-55 weekend guests per day.
- At least CA$30 average spend.
- Approximately CA$7,500-8,190 weekly revenue before seasonality.

- [ ] **Step 5: Complete and commit October and November monthly reviews**

Each review records target versus actual, operating issues, review themes, ads/GA4/GSC/Business Profile evidence, and one next-month priority.

```bash
git add marketing/competitive-growth/README.md marketing/competitive-growth/daily-scorecard.csv marketing/competitive-growth/weekly-scorecard.csv marketing/competitive-growth/monthly-reviews/2026-10.md
git commit -m "Review second competitive growth month"

git add marketing/competitive-growth/README.md marketing/competitive-growth/daily-scorecard.csv marketing/competitive-growth/weekly-scorecard.csv marketing/competitive-growth/monthly-reviews/2026-11.md
git commit -m "Review pre-opening competitive readiness"
```

---

### Task 8: Build and Maintain the Haidilao Response Kit

**Files:**
- Create: `marketing/competitive-growth/competitor-monitor.csv`
- Create: `marketing/competitive-growth/haidilao-response-kit.md`
- Modify with evidence: `marketing/competitive-growth/competitor-monitor.csv`

**Interfaces:**
- Consumes: official or directly verified opening date, location, menu, price, restrictions, hours, promotions, and reviews.
- Produces: an evidence-backed scenario recommendation; no public competitor response without owner approval.

- [ ] **Step 1: Create the competitor monitor schema**

Create `marketing/competitive-growth/competitor-monitor.csv`:

```csv
checked_at,source_type,source_url,opening_date,location,business_hours,ayce_available,ayce_price,ayce_hours,soup_base_charge,meat_inclusions,time_limit,party_rules,reservation_waitlist,opening_promotion,promotion_end_date,review_theme,evidence_status,notes
```

Allowed `evidence_status` values are `official`, `directly_verified`, `unverified`, and `superseded`.

- [ ] **Step 2: Create the response kit with six scenario drafts**

Create `marketing/competitive-growth/haidilao-response-kit.md` containing:

1. No competitor AYCE: keep $28.99 and emphasize inclusions.
2. Lunch/late-night AYCE only: prepare `AYCE Available During Dinner Hours` copy.
3. All-day AYCE clearly above $28.99: keep price and communicate value.
4. All-day AYCE around $29.99-33.99: keep price initially and evaluate the fallback trigger.
5. Heavy opening queues: communicate phone availability checks without unverifiable wait-time claims.
6. Temporary deep opening discount: maintain current price and re-evaluate after the temporary offer ends.

Every scenario must include `Status: Draft only; not approved for publication`.

- [ ] **Step 3: Set the monitoring cadence**

- Weekly until official Calgary information appears.
- Daily during the 14 days before a verified opening.
- Daily for 30 days after opening.
- Weekly thereafter through the six-month horizon.

- [ ] **Step 4: Require two-source verification for material reaction**

A price, hours, or AYCE response requires either an official source or direct menu/store evidence. Social comments and third-party posts remain `unverified` until corroborated.

- [ ] **Step 5: Validate and commit the response kit**

Run:

```bash
node -e "const fs=require('fs'); const f='marketing/competitive-growth/competitor-monitor.csv'; const rows=fs.readFileSync(f,'utf8').trim().split(/\n/).map(r=>r.split(',').length); if (!rows.every(n=>n===rows[0])) throw new Error('inconsistent competitor monitor columns'); console.log(rows[0]+' columns');"
rg -c "Status: Draft only; not approved for publication" marketing/competitive-growth/haidilao-response-kit.md
git diff --check -- marketing/competitive-growth/competitor-monitor.csv marketing/competitive-growth/haidilao-response-kit.md
```

Expected: consistent CSV columns, six draft-only status markers, and zero diff errors.

Then:

```bash
git add marketing/competitive-growth/competitor-monitor.csv marketing/competitive-growth/haidilao-response-kit.md
git commit -m "Add verified competitor response framework"
```

---

### Task 9: Operate the Opening-Period Decision Tree

**Files:**
- Modify: `marketing/competitive-growth/competitor-monitor.csv`
- Create: `marketing/competitive-growth/monthly-reviews/2026-12.md`
- Create only if the trigger is met and approved: `marketing/competitive-growth/free-drink-test.md`

**Interfaces:**
- Consumes: verified competitor evidence, two complete weeks of store scorecards, and the response kit.
- Produces: a keep/adjust/test decision and, only when approved, a 14-day Mon-Thu free-drink experiment.

- [ ] **Step 1: Select the verified scenario**

Record the evidence row, mark superseded observations, and identify exactly one response-kit scenario. Do not combine multiple competitor reactions in one test.

- [ ] **Step 2: Check the fallback trigger**

The free-drink test is eligible only when all are true:

- Relevant Calgary competitor offer is verified.
- Monday-Thursday revenue is below CA$400 per day or traffic is below 13-14 guests per day for two complete weeks.
- Weather, holidays, closures, tracking delays, stock, and quality failures do not explain the decline.
- The owner has reviewed actual drink cost and service capacity.

- [ ] **Step 3: Keep $28.99 when the trigger is not met**

Use the selected value message, keep price and budget stable, and continue weekly measurement.

- [ ] **Step 4: Create the test document only when eligible**

Create `marketing/competitive-growth/free-drink-test.md` with:

- Exact eligible days: Monday-Thursday.
- Exact start and end dates: 14 calendar days.
- One approved eligible drink per AYCE guest.
- Eligible size and flavours.
- Actual unit cost and maximum test cost.
- Baseline 14-day weekday guests, revenue, average spend, and snack attachment.
- Success: at least three additional weekday guests per day or equivalent verified revenue improvement without unacceptable margin loss.
- Stop conditions: service capacity failure, stock failure, price confusion, or margin result outside the owner-approved limit.
- `Status: Not active until separately approved.`

- [ ] **Step 5: Obtain exact promotion approval**

Present dates, eligible drinks, creative, channels, total estimated cost, and stop conditions. Do not activate from the design approval alone.

- [ ] **Step 6: Run and close the opening-period review**

Create `marketing/competitive-growth/monthly-reviews/2026-12.md` comparing pre-opening baseline, opening weeks, verified competitor facts, store outcomes, digital outcomes, and the selected next action.

- [ ] **Step 7: Commit the opening-period decision**

```bash
git add marketing/competitive-growth/competitor-monitor.csv marketing/competitive-growth/monthly-reviews/2026-12.md
git commit -m "Review Haidilao opening-period response"
```

If a separately approved free-drink test exists, add and commit its document in a separate commit.

---

### Task 10: Complete the Six-Month Review and Next Strategy

**Files:**
- Create: `marketing/competitive-growth/monthly-reviews/2027-01.md`
- Create: `marketing/competitive-growth/monthly-reviews/2027-02.md`
- Create: `marketing/competitive-growth/six-month-review-2027-02-15.md`
- Modify: `marketing/competitive-growth/daily-scorecard.csv`
- Modify: `marketing/competitive-growth/weekly-scorecard.csv`
- Modify: `marketing/competitive-growth/competitor-monitor.csv`

**Interfaces:**
- Consumes: six months of store scorecards, complete Google reporting, review themes, competitor evidence, and experiment records.
- Produces: evidence-backed decision to keep, refine, expand, or replace the strategy.

- [ ] **Step 1: Close January and the first half of February**

Create the monthly reviews with the same store/digital/operations/decision structure used in Task 7.

- [ ] **Step 2: Calculate six-month outcomes**

Compare with the August baseline:

- Weekday guests per day: baseline 17; target at least 25.
- Weekend guests per day: baseline 50; target at least 50.
- Average spend: baseline CA$30; target at least CA$30.
- Weekly revenue: baseline CA$6,500; target at least CA$7,500 before seasonality.
- Monthly revenue: baseline approximately CA$28,100; target at least CA$32,500 before seasonality.
- Snack and drink attachment change.
- Review count, rating, recency, and themes.
- Google Ads qualified calls and reconciled store visits.
- Organic and Business Profile local-intent growth.

- [ ] **Step 3: Create the six-month review**

Create `marketing/competitive-growth/six-month-review-2027-02-15.md` with:

1. Executive result.
2. Baseline versus final 30-day period.
3. What drove weekday traffic.
4. What protected weekend traffic.
5. Product, service, and reputation outcomes.
6. Google Ads and organic search contribution with attribution limits.
7. Competitor impact based on verified evidence.
8. Promotion tests and margin result.
9. Exactly three recommendations for the next six months, ordered by impact and effort.

- [ ] **Step 4: Apply the final decision rules**

- If weekday traffic is at least 25 and average spend is at least CA$30: retain the value moat and optimize the best-performing acquisition source.
- If traffic is healthy but average spend is below CA$30: prioritize snack and drink attachment.
- If digital intent grows without visits: repair phone, availability, and store conversion.
- If verified competitor pressure causes a sustained decline: design one new bounded offer rather than a permanent price reduction.
- If operations repeatedly fail: prioritize product/service remediation before more acquisition spend.

- [ ] **Step 5: Validate and commit the six-month close**

Run:

```bash
git diff --check -- marketing/competitive-growth
rg -n "Executive result|Baseline versus final|three recommendations" marketing/competitive-growth/six-month-review-2027-02-15.md
```

Then:

```bash
git add marketing/competitive-growth/daily-scorecard.csv marketing/competitive-growth/weekly-scorecard.csv marketing/competitive-growth/competitor-monitor.csv marketing/competitive-growth/monthly-reviews/2027-01.md marketing/competitive-growth/monthly-reviews/2027-02.md marketing/competitive-growth/six-month-review-2027-02-15.md
git commit -m "Complete six-month competitive growth review"
```

---

## Program Verification Checklist

At every task boundary:

- Confirm only files listed by the task are staged.
- Run `git diff --check` on those files.
- Confirm prices, hours, phone number, and offer inclusions match current store operations.
- Confirm all external actions have an exact approval record.
- Confirm reports use each platform's latest complete date.
- Confirm no website event is called a diner, sale, revenue, or ROAS without store/POS reconciliation.
- Confirm only one material experiment changed.
- Confirm the next review date and responsible party are recorded.
