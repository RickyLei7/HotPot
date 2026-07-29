# Official Social Publisher Setup

The local publisher scripts only accept public restaurant-hosted image URLs and store credentials in local `.env.*.local` files. Those files are ignored by Git.

## What is ready

| Platform | Local publisher | One-time official setup still needed |
| --- | --- | --- |
| Instagram | `scripts/instagram-publisher.mjs` | Connected |
| Facebook Page | `scripts/facebook-publisher.mjs` | Create a Page access token with publishing permissions |
| Threads | `scripts/threads-publisher.mjs` | Add Threads API product and create a Threads OAuth token |
| Google Business Profile | `scripts/google-business-publisher.mjs` | Request Business Profile API access, then create Google OAuth credentials |

## Callback URLs

Add these exact URLs in the provider dashboard before authorizing. They are static confirmation pages only and do not retain credentials.

```text
https://centrestjhotpot.ca/facebook-auth/
https://centrestjhotpot.ca/threads-auth/
https://centrestjhotpot.ca/google-business-auth/
```

## Facebook Page

In Meta for Developers, add the Facebook Login / Facebook Login for Business product to the existing business app. Add the Facebook callback URL. Authorize the account that administers the Centre Street Japanese HotPot Page with `pages_show_list`, `pages_read_engagement`, and `pages_manage_posts`; then use the Page-specific access token, not the personal user token.

Create `.env.facebook.local`:

```text
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
```

Verify:

```bash
node scripts/facebook-publisher.mjs verify
```

## Threads

Add the Threads API product to the Meta app, set the Threads callback URL, and authorize the restaurant Threads account with `threads_basic` and `threads_content_publish`. Store the Threads account ID and the resulting access token.

Create `.env.threads.local`:

```text
THREADS_USER_ID=your_threads_user_id
THREADS_ACCESS_TOKEN=your_threads_access_token
```

Verify:

```bash
node scripts/threads-publisher.mjs verify
```

## Google Business Profile

Google requires a valid business reason and project access approval before the Business Profile APIs can be enabled. In Google Cloud, create a project, request Business Profile API access, enable the My Business and Account Management APIs, configure the OAuth consent screen, and create a Web application OAuth client. Add the Google callback URL and request `https://www.googleapis.com/auth/business.manage` with offline access.

After consent, store the access token, refresh token, OAuth client ID and secret, plus the account and location IDs.

Create `.env.google-business.local`:

```text
GOOGLE_BUSINESS_ACCESS_TOKEN=short_lived_access_token
GOOGLE_BUSINESS_REFRESH_TOKEN=refresh_token
GOOGLE_BUSINESS_CLIENT_ID=client_id.apps.googleusercontent.com
GOOGLE_BUSINESS_CLIENT_SECRET=client_secret
GOOGLE_BUSINESS_ACCOUNT_ID=account_id_without_accounts_prefix
GOOGLE_BUSINESS_LOCATION_ID=location_id_without_locations_prefix
```

The publisher refreshes the access token locally when refresh credentials exist.

Verify:

```bash
node scripts/google-business-publisher.mjs verify
```

## Preparing and publishing

All three scripts support a dry-run preview. Publishing needs an explicit `--confirm yes`.

```bash
node scripts/facebook-publisher.mjs prepare --image-url https://centrestjhotpot.ca/assets/social/example.png --caption-file marketing/captions/example.txt
node scripts/threads-publisher.mjs prepare --image-url https://centrestjhotpot.ca/assets/social/example.png --caption-file marketing/captions/example.txt
node scripts/google-business-publisher.mjs prepare --image-url https://centrestjhotpot.ca/assets/social/example.png --caption-file marketing/captions/example.txt --call-to-action-url https://centrestjhotpot.ca/ayce-hot-pot-calgary/
```

Never paste access tokens, OAuth client secrets, or Page tokens into chat or commit them to the repository.
