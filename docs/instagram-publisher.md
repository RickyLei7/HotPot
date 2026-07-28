# Instagram Publisher

This local tool publishes an approved single-image Instagram feed post through the official Instagram API. It runs on the restaurant Mac; access tokens never go into GitHub Pages or the public website.

## One-time setup

1. Generate the Instagram token in Meta for Developers.
2. Save it locally:

   ```zsh
   cd ~/Documents/HotPot && ./scripts/save-instagram-token.sh
   ```

3. Verify the connection:

   ```zsh
   node scripts/instagram-publisher.mjs verify
   ```

## Publishing flow

The image must be a current restaurant-owned image already deployed under `https://centrestjhotpot.ca/assets/social/`.

1. Store the caption in a local `.txt` file.
2. Preview the exact publish payload:

   ```zsh
   node scripts/instagram-publisher.mjs prepare \
     --image-url https://centrestjhotpot.ca/assets/social/example.png \
     --caption-file marketing/captions/example.txt
   ```

3. Publish only after reviewing the preview:

   ```zsh
   node scripts/instagram-publisher.mjs publish \
     --image-url https://centrestjhotpot.ca/assets/social/example.png \
     --caption-file marketing/captions/example.txt \
     --confirm yes
   ```

The tool only accepts HTTPS assets hosted on the restaurant domain. It does not publish video, Stories, Reels, comments, or messages.
# Instagram OAuth Login

The first-time setup uses the official Instagram Business Login OAuth flow. In
Meta, set the Redirect URL to exactly:

```
https://centrestjhotpot.ca/instagram-auth/
```

After approving the authorization, copy the complete redirected URL from the
browser address bar. Run this command locally and paste the app secret and that
redirected URL only into the prompts:

```zsh
cd ~/Documents/HotPot && ./scripts/complete-instagram-login.sh
```

Both prompts are hidden. The script exchanges the one-time authorization code for a long-lived token,
verifies the connected Instagram account, and saves the token only in the
gitignored, owner-readable `.env.instagram.local` file. It never prints the
token or app secret.
