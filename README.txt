CHAIRSIDE SUPPORT SUMMARY - NETLIFY SETUP

1. Put this folder in a GitHub repo (e.g. alantbanks-del/chairside).
2. Netlify > Add new site > Import from GitHub > pick the repo. No build command needed.
3. Site settings > Environment variables, add:
     ANTHROPIC_API_KEY  = your Anthropic API key (reads receipts)
     APP_PIN            = a short PIN Rachael types once per device
     CLAUDE_MODEL       = optional, defaults to claude-sonnet-5-5
4. Redeploy. Optional: set a custom domain like chairside.guidedsmile.com.

Jobs save to Netlify Blobs, so phone and PC stay in sync.
Receipt photos are read, not stored.
