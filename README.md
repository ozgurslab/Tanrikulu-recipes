# Tanrikulu Recipes V6

Family recipe web app for GitHub Pages + Supabase.

## V6 changes

- Fixed iPhone login form alignment. The background image no longer contains fake username/password controls; the live form inputs are the only controls on the screen.
- Replaced the home hero with a larger, clean high-resolution food image with no text baked into the picture, so the overlay copy appears only once.
- Added one-tap Turkish ↔ English recipe translation on the recipe detail screen.
  - The app detects whether the recipe is primarily Turkish or English.
  - `Translate to English` appears for Turkish recipes; `Türkçeye çevir` appears for English recipes.
  - Tap `Original` to return to the stored recipe.
  - The original recipe in Supabase is never changed.
  - Translations are cached locally on the device for speed.
- Existing V5 features remain: recipe link, contributor name, photos, favorites, permanent recipe numbers, custom categories, editing and deleting recipes.

## Translation service

V6 uses the MyMemory public translation API from the browser. It is suitable for light family use, but it is a third-party service and may have usage limits. Recipe text is sent to that service only when a user taps Translate. For a more robust/private setup later, the translation call can be moved behind a Supabase Edge Function or a paid translation API.

## GitHub update

Upload all files in this folder to the root of the existing `Tanrikulu-recipes` repository, replacing files with the same names, then commit. GitHub Pages will redeploy automatically.

No new Supabase SQL is required for V6 if V5's contributor-name upgrade has already been run.
