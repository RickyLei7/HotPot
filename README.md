# Centre Street Japanese Hotpot Website

Static restaurant website for Centre Street Japanese Hotpot.

## Preview

Open this file in a browser:

```text
public/index.html
```

The deployable static site lives in `public/`.

## GitHub Setup Without CLI

1. Go to GitHub and create a new repository.
2. Recommended repository name: `centrestjhotpot`.
3. Choose `Public`.
4. Do not add a README, `.gitignore`, or license on GitHub because this folder already has them.
5. Upload this project folder to the repository.

## GitHub Pages Setup

After the repository is uploaded:

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.
4. The workflow at `.github/workflows/pages.yml` will publish the `public/` folder.
5. Under `Custom domain`, enter:

```text
centrestjhotpot.ca
```

6. Save, then enable `Enforce HTTPS` after GitHub finishes checking the domain.

## DNS Records For CENTRESTJHOTPOT.CA

Set these records at the company where the domain was purchased.

### Apex Domain

For `centrestjhotpot.ca`, create four `A` records:

```text
Type: A
Name / Host: @
Value: 185.199.108.153

Type: A
Name / Host: @
Value: 185.199.109.153

Type: A
Name / Host: @
Value: 185.199.110.153

Type: A
Name / Host: @
Value: 185.199.111.153
```

### WWW Subdomain

For `www.centrestjhotpot.ca`, create one `CNAME` record:

```text
Type: CNAME
Name / Host: www
Value: YOUR-GITHUB-USERNAME.github.io
```

Replace `YOUR-GITHUB-USERNAME` with the GitHub account or organization that owns the repository.

## Notes

- DNS changes can take up to 24 hours.
- GitHub recommends setting up both the apex domain and the `www` subdomain.
- Do not create wildcard DNS records such as `*.centrestjhotpot.ca`.
