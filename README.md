# Dynamic Environment Variable Generator

Generates environment variables based on the current branch, commit message, or issue title for dynamic deployments.

## Free
```yaml
- uses: walshd1/dynamic-environment-variable-generator@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

## Paid (cost + 4.75%)
```yaml
- uses: walshd1/dynamic-environment-variable-generator@v1
  with:
    service_token: ${{ secrets.ACTION_FACTORY_TOKEN }}
```
