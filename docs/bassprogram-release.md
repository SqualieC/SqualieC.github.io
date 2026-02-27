# BassProgram Release Packaging

Use this workflow to publish a new downloadable package for the site.

## Command

```powershell
.\scripts\publish-bassprogram.ps1 -SourcePath "C:\Path\To\BassProgram.exe" -Version "0.1.0"
```

You can also pass a folder as `SourcePath` to package multiple files.

## Output

The script generates:

- `public/downloads/BassProgram-<version>.zip`
- `public/downloads/BassProgram.zip` (latest alias used by the site)

## Publish

1. Run the script.
2. Commit the changed zip files.
3. Push to `main`.
4. Cloudflare deploys automatically.
