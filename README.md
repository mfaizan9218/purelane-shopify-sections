# Purelane — Shopify Sections (Dawn)

Production-ready Dawn sections for: Hero, Product Grid, Best-Selling Combos, Bundles, Reviews Rail.

## Install

1. Copy files into your theme, preserving folders:
   - `assets/purelane-base.css`
   - `assets/purelane-base.js`
   - `sections/purelane-hero.liquid`
   - `sections/purelane-product-grid.liquid`
   - `sections/purelane-combos.liquid`
   - `sections/purelane-bundles.liquid`
   - `sections/purelane-reviews-rail.liquid`

2. In `layout/theme.liquid`, inside `<head>`, **once**, after Dawn's own stylesheet tags:
   ```liquid
   {{ 'purelane-base.css' | asset_url | stylesheet_tag }}
   ```
   and before `</body>`:
   ```liquid
   <script src="{{ 'purelane-base.js' | asset_url }}" defer></script>
   ```
   These are shared by all 5 sections (design tokens + the `.pl-rv` scroll-reveal
   observer) so nothing is duplicated per-section.

3. Make sure `'Outfit'` and `'Inter'` are loaded (Dawn typically lets you set these
   as the heading/body font in Theme Settings → Typography; the sections fall back
   to `system-ui` if not present, so this is cosmetic, not required).

4. Add each section to a template (usually `templates/index.json`) via the theme
   editor's **Add section** picker — each ships a preset so it drops in with
   sensible starter content.

## Per-section data model & why

| Section | Data source | Notes |
|---|---|---|
| Hero | `product` setting per rotating slide | Price/compare-at pulled live; only the slide label ("Any 2 products") is merchant copy. |
| Product Grid | **Collection** setting (`section.settings.collection`) | Products pull automatically from a merchant-picked collection — add/remove/reorder in Shopify admin, no theme editor work needed. "Pill" badges (Best seller/New/Top rated) are derived from product tags (`bestseller`, `new`, `top-rated`), not typed in. Rating pulled from `product.metafields.reviews.rating.value`/`rating_count` (Judge.me's documented Shopify metafield namespace). Single-variant products get a real AJAX `/cart/add` form wired into Dawn's `<cart-drawer>`/`<cart-notification>`; multi-variant products link to the PDP instead of guessing a variant. |
| Combos | **Collection** setting + product **metafields** | Each product in the collection is a Shopify Bundles product — price/compare-at/url come from it directly. Card copy (flag label, description, the 3-item tray) comes from `custom.flag_label`, `custom.featured`, `custom.combo_description`, `custom.combo_items` (JSON) metafields — edit them in Shopify admin without touching the theme. Full metafield spec is in the code comments at the top of `purelane-combos.liquid`. |
| Bundles | **Collection** setting + product **metafields** | Same pattern as Combos: `custom.tier_tag`, `custom.featured`, `custom.product_count`, `custom.bundle_features` (list), `custom.bundle_preview_products` (list of product references). Spec in `purelane-bundles.liquid`'s code comments. |
| Reviews Rail | `shop.metafields.judgeme.all_reviews_rating`/`all_reviews_count` for the header; per-card **live** rating from `product.metafields.reviews.rating.value` when a product is linked | Quote/headline/author text is merchant-curated (standard practice for a homepage highlight reel), but the star rating shown is real and live per linked product — not typed in. An optional `judgeme_official_widget` block renders Judge.me's own sanctioned, fully-live review widget for one product if a zero-curation feed is ever required; see the long comment at the top of `purelane-reviews-rail.liquid` for why individual review *text* isn't pulled from Judge.me's undocumented internal JSON. |

### Metafield setup checklist (Shopify admin → Settings → Custom data → Products)

For Combos:
| Namespace | Key | Type |
|---|---|---|
| `custom` | `flag_label` | Single line text |
| `custom` | `featured` | Boolean |
| `custom` | `combo_description` | Multi-line text |
| `custom` | `combo_items` | JSON |

For Bundles:
| Namespace | Key | Type |
|---|---|---|
| `custom` | `tier_tag` | Single line text |
| `custom` | `featured` | Boolean |
| `custom` | `product_count` | Integer |
| `custom` | `bundle_features` | List of single line text |
| `custom` | `bundle_preview_products` | List of product references |

`combo_items` JSON shape (array, up to 3 entries):
```json
[
  { "product": "tap-cleaner-500ml", "benefit": "Melts hard water stains" },
  { "product": "kitchen-cleaner-foaming", "benefit": "Cuts grease instantly" }
]
```
`"product"` is the linked product's **handle**, resolved in Liquid via `all_products[item.product]`.

## Accessibility

- Real `alt` text sourced from product/image data, not decorative.
- Star ratings have visually-hidden text equivalents (`.pl-vh`) alongside the
  glyph rendering, so screen readers get "Rated 4.8 out of 5" instead of "★".
- Marquee and hero rotator both respect `prefers-reduced-motion` (marquee
  freezes to a static wrapped grid; rotator shows only the first slide/stops
  auto-advancing).
- Marquee pauses on hover/focus; combos rail and marquee are natively
  keyboard-scrollable (no custom JS scroll-jacking).
- All interactive elements (`Add to cart`, rotator dots, bundle CTAs) are real
  `<button>`/`<a>` elements with visible focus rings (`:focus-visible`).

## Performance

- All product imagery uses `srcset`/`sizes` with `image_url`, `width`/`height`
  attributes (prevents layout shift), and `loading="lazy"` except the first
  hero slide (`eager`).
- Reviews marquee is CSS-only (no JS animation loop).
- Combos/reviews rails use native `overflow-x:auto` + `scroll-snap`, not a JS
  carousel library.
- Shared CSS/JS loaded once globally rather than duplicated per section
  instance.

## What's out of scope (flag for the interviewer if relevant)

- The original prototype's full-page animated "water" background, scene
  crossfades, and floating ticker are page-level chrome outside the 5
  requested sections — not reimplemented here. Each section instead uses a
  solid brand-ink background so it looks correct as a standalone section.
- A true custom "pick any N products" bundle builder (beyond what Shopify
  Bundles' own product-page picker provides) would need its own app/section
  and is noted as a follow-up rather than guessed at.
