# JSAL — JavaScript Static Analysis Tool

A single self-contained HTML file that performs **client-side static analysis** on JavaScript code to extract security-relevant findings. Zero dependencies, zero server requirements — just open in a browser.

Originally inspired by the [JSAnalyzer](https://github.com/aspect-security/JSAnalyzer) Burp Suite extension, rebuilt as a standalone web tool.

## Features

- **Endpoints** — API routes, REST paths, GraphQL endpoints
- **URLs** — Full URLs including Firebase, S3 buckets, CDN links
- **Secrets** — API keys (Google, AWS, Stripe, GitHub, etc.), tokens, credentials
- **Emails** — Email addresses found in source code
- **Files** — References to config files, backups, sensitive paths
- **Sensitive Data** — SSNs, credit cards, private keys, internal IPs
- **Vulns** — DOM XSS sinks, `eval()` usage, insecure patterns

## Usage

### Option 1: Open directly

Just open `jsal.html` in any modern browser. Paste JavaScript code or drag & drop `.js` files.

### Option 2: With CORS proxy (for URL scanning)

```bash
node cors-server.js
```

Then open `http://localhost:8765/jsal.html` and use the **Fetch & Scan** feature to analyze remote JavaScript URLs.

### Option 3: Standalone CORS proxy

```bash
node cors-proxy.js
```

Runs a lightweight CORS proxy on port 9090 for use with the file opened directly.

## Input Methods

| Method | Description |
|--------|-------------|
| **Paste** | Paste JS code into the textarea and click Analyze |
| **File Upload** | Click Upload or drag & drop `.js/.mjs/.cjs/.jsx/.ts/.tsx` files |
| **URL Fetch** | Enter a URL and click Fetch & Scan (requires CORS proxy) |
| **URL Scanner** | Bulk-scan a website by entering its URL with proxy enabled |

## Detection Rules

### Secrets (28 patterns)
Google API Key, AWS Access Key, AWS Secret Key, GitHub Token, Stripe Keys, JWT Tokens, Private Keys, Slack Tokens, Twilio Keys, SendGrid Keys, Firebase Keys, Heroku API Key, MailGun Key, Basic Auth Headers, Bearer Tokens, and more.

### Endpoints (21 patterns)
REST API paths, GraphQL endpoints, WebSocket URLs, path assignments, route definitions, AJAX calls, and template literal URLs.

### URLs (7 patterns)
Standard HTTP/HTTPS URLs, Firebase URLs, S3 bucket URLs, CloudFront distributions, and API gateway endpoints.

## Security

- All analysis runs **100% client-side** in a Web Worker — no data leaves your browser
- Content Security Policy (CSP) headers enforced
- URL output is sanitized to prevent XSS
- No external dependencies or CDN loads

## Accessibility

- WCAG 2.2 compliant: semantic landmarks, ARIA roles, keyboard navigation
- Responsive design tested on desktop, tablet (768px), and mobile (375px)
- Skip navigation, focus indicators, screen reader support

## Screenshots

### Desktop
![Desktop view](https://raw.githubusercontent.com/watch-dog-man/JSAL/main/screenshots/desktop.png)

### Analysis Results
![Analysis results](https://raw.githubusercontent.com/watch-dog-man/JSAL/main/screenshots/results.png)

## Tech Stack

- Single HTML file with inline CSS + JavaScript
- Web Worker for non-blocking analysis
- Zero external dependencies
- ~99KB total size

## License

MIT
