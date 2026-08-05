# theme.liquid integration

No `theme.liquid` was uploaded, so here's the exact snippet to drop in
rather than a diff against your real file. In stock Dawn, `theme.liquid`
looks roughly like this — add the two marked lines in the same spots:

```liquid
<!doctype html>
<html class="no-js" lang="{{ request.locale.iso_code }}">
  <head>
    ...
    {{ 'base.css' | asset_url | stylesheet_tag }}
    {{ 'component-cart-notification.css' | asset_url | stylesheet_tag }}
    ...
    {{ settings.type_header_font | font_face: font_display: 'swap' }}
    {{ settings.type_body_font | font_face: font_display: 'swap' }}

    {# --- ADD: Purelane shared design tokens, once, globally --- #}
    {{ 'purelane-base.css' | asset_url | stylesheet_tag }}

  </head>
  <body class="gradient">
    ...
    {% sections 'header-group' %}

    <main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
      {{ content_for_layout }}
    </main>

    {% sections 'footer-group' %}

    {# Dawn's own cart notification / cart drawer live somewhere around here
       depending on your theme's cart type setting — leave as-is, the
       product grid section detects <cart-drawer>/<cart-notification> at
       runtime and uses whichever exists. #}

    {{ content_for_header }}

    {# --- ADD: Purelane shared reveal-on-scroll utility, once, deferred --- #}
    <script src="{{ 'purelane-base.js' | asset_url }}" defer></script>

  </body>
</html>
```

## Notes

- Order matters only in that `purelane-base.css` should load **after** Dawn's
  own base stylesheet (so nothing Purelane-specific gets overridden by Dawn
  defaults) — placing it right before `</head>` as shown is the safe spot.
- The deferred JS tag can go anywhere before `</body>`; keeping it near
  `content_for_header` (where Dawn already loads its own deferred scripts)
  keeps script tags grouped together for readability, but it has no
  functional dependency on that position.
- If your theme is a **heavily customized fork of Dawn** rather than stock
  Dawn, search `theme.liquid` for the existing `stylesheet_tag` calls in
  `<head>` and the existing `<script ... defer>` calls near the closing
  `</body>` and add these two lines alongside them — the exact surrounding
  markup doesn't matter, only that each loads once, globally, not per-section.
- The product grid's add-to-cart JS looks for `<cart-drawer>` then
  `<cart-notification>` custom elements at submit time and re-fetches their
  sections via `?sections=...` — this only works if those elements already
  exist somewhere in the page from Dawn's own header/cart markup (they do in
  stock Dawn regardless of which cart type — drawer, notification, or page —
  is selected in Theme Settings → Cart, except "Page" mode, in which case
  the script's fallback just leaves the button showing "Added ✓" and the
  merchant's cart-icon count updates on next navigation).
