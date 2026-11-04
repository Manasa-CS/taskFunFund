# assets/

Source files for the app logo, icon and splash screen (the jar + falling task cards + coins mark).

- `taskfunfund-icon.svg` / `taskfunfund-logo.svg` — the master vector artwork (square icon, and
  icon + wordmark lockup). Mirrored into `src/assets/` for in-app use.
- `icon-source.html` / `icon.png` — 1024×1024 icon source, full bleed
- `icon-maskable-source.html` / `icon-maskable.png` — same artwork scaled into the ~80% maskable
  safe zone, for Android adaptive icons and the PWA maskable manifest entry
- `splash-source.html` / `splash.png` — 2732×2732 splash source, on the `#2E9BE6` splash background

Regenerate platform assets after editing these with:

```
npx @capacitor/assets generate --android --ios --iconBackgroundColor "#2E9BE6" --splashBackgroundColor "#2E9BE6"
```

PWA icons (`public/icons/*.webp`, `public/icons/icon-512-maskable.png`) and `public/favicon.svg` are
rasterized separately from the same `icon-source.html` / `icon-maskable-source.html` files.
