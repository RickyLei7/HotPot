# Centre Street inventory order tracker

This is a separate Cloudflare Worker for the restaurant's internal ordering history. It does not read or change the public restaurant application. It records order dates and estimates reorder timing; it does **not** know actual stock levels.

## Local development

Run the automated tests from the repository root:

```bash
node --test inventory/test/*.test.mjs
```

Create and migrate the local-only D1 database:

```bash
npx --yes wrangler@4.131.1 d1 migrations apply centre-street-order-tracker --local --config inventory/wrangler.jsonc
```

First verify that `inventory/.dev.vars` is ignored, then create it exclusively. The prompt does not echo the PIN, the session secret is generated without being printed, and the command fails rather than overwriting an existing file:

```bash
git check-ignore -q inventory/.dev.vars &&
/bin/zsh -c 'read -s "INVENTORY_PIN?Enter a new four-digit PIN: "; printf "\n"; INVENTORY_PIN="$INVENTORY_PIN" node -e '\''const { randomBytes } = require("node:crypto"); const { writeFileSync } = require("node:fs"); const pin = process.env.INVENTORY_PIN; if (!/^\d{4}$/.test(pin)) throw new Error("PIN must contain exactly four digits"); writeFileSync("inventory/.dev.vars", `INVENTORY_PIN=${pin}\nSESSION_SECRET=${randomBytes(32).toString("hex")}\n`, { mode: 0o600, flag: "wx" })'\'''
```

Start the local Worker:

```bash
npx --yes wrangler@4.131.1 dev --config inventory/wrangler.jsonc
```

Wrangler stores local D1 state under `inventory/.wrangler/`. Both that directory and `.dev.vars` are ignored.

The repository currently installs Wrangler 4.92.0, whose local runtime only supports compatibility dates through `2026-05-22`. The pinned one-off version above supports this Worker's required `2026-09-13` date without changing the public application's shared dependencies.

## Deployment (requires separate approval)

Do not run these commands until deployment is explicitly approved.

Create the production D1 database:

```bash
npx --yes wrangler@4.131.1 d1 create centre-street-order-tracker --location wnam
```

Replace `local-order-tracker` in `inventory/wrangler.jsonc` with the UUID returned above. Then set production secrets interactively so neither value appears in shell history:

```bash
npx --yes wrangler@4.131.1 secret put INVENTORY_PIN --config inventory/wrangler.jsonc
npx --yes wrangler@4.131.1 secret put SESSION_SECRET --config inventory/wrangler.jsonc
```

Use a randomly generated secret of at least 32 bytes for `SESSION_SECRET`. Apply migrations remotely, deploy, and attach the custom domain:

```bash
npx --yes wrangler@4.131.1 d1 migrations apply centre-street-order-tracker --remote --config inventory/wrangler.jsonc
npx --yes wrangler@4.131.1 deploy --config inventory/wrangler.jsonc --domain inventory.centrestjhotpot.ca
```

The four-digit PIN is suitable only for this low-sensitivity internal list. It is not appropriate for customer data, payment information, employee records, or other sensitive systems.

## Operations

Export the complete order history after signing in by selecting **导出 CSV**, or request `/api/export.csv` with an authenticated browser session. Keep exported files private because they describe restaurant purchasing patterns.

Rotate the PIN by replacing the local value in `inventory/.dev.vars` and restarting Wrangler. For production, run the secret command and enter the new PIN at the prompt:

```bash
npx --yes wrangler@4.131.1 secret put INVENTORY_PIN --config inventory/wrangler.jsonc
```

Existing signed sessions remain valid after a PIN-only rotation. To invalidate every session, rotate the session secret too:

```bash
npx --yes wrangler@4.131.1 secret put SESSION_SECRET --config inventory/wrangler.jsonc
```

List deployments and roll the Worker code back to a known version:

```bash
npx --yes wrangler@4.131.1 deployments list --config inventory/wrangler.jsonc
npx --yes wrangler@4.131.1 rollback <VERSION_ID> --config inventory/wrangler.jsonc
```

A Worker rollback does not reverse D1 migrations or delete order history. Back up exported CSV data before schema changes and use a separately reviewed forward migration to repair database schema or data.
