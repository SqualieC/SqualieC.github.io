# BassProgram Release Packaging

Use this workflow to publish a new downloadable package for the site.

## Command

```powershell
.\scripts\publish-bassprogram.ps1 -SourcePath "C:\Path\To\BassProgramFolder" -Version "0.1.0"
```

You can pass either an `.exe` path or a folder path as `SourcePath`.

## Output

The script generates:

- `artifacts/BassProgram-<version>.zip`
- `artifacts/BassProgram-Alpha-0.1-Lite.zip` (latest lite alias used by the site)

## Publish

1. Run the script.
2. Commit the changed zip files.
3. Push to `main`.
4. Cloudflare deploys automatically.
