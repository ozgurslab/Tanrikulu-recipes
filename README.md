# Tanrikulu Recipes

A mobile-friendly family recipe app for GitHub Pages with Supabase as the shared database.

## Family login
- Username: `Tanrikulu`
- Password: `1943`

This is intentionally a simple family login gate. Because GitHub Pages is a public static host, it should be treated as casual access control, not protection for sensitive information. The recipe database itself contains only family recipes.

## Supabase setup
1. Go to the Supabase dashboard and create a free project. Name it `Tanrikulu Recipes`.
2. Wait for the project/database to finish provisioning.
3. In the left menu open **SQL Editor**, create a new query, paste all of `supabase.sql`, and click **Run**. This creates the `categories` and `recipes` tables, adds the starting categories, enables Row Level Security, and adds the policies the app needs.
4. Open the project's **Connect** dialog, or **Settings → API Keys**. Copy the **Project URL** and **Publishable key** (`sb_publishable_...`). Do not use or publish the Secret key.
5. Open `config.js` and replace the two placeholders with your Project URL and Publishable key.
6. Upload `index.html`, `styles.css`, `app.js`, `config.js`, `supabase.sql`, and this README to the root of a GitHub repository.
7. In GitHub open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

## Notes
Supabase's publishable key is designed to be present in browser code; database permissions are controlled by Row Level Security. Never put a Supabase Secret key in this repository.
