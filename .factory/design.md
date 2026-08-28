# Dose Count Compass — visual thesis

## Direction

**Paper-cut diorama.** The interface looks like a small medicine cabinet made
from layered, cut paper. A counted device sits on a shelf, its remaining doses
shown by a physical paper gauge. This makes the abstract number feel like a
finite object without pretending to be clinical advice.

## Tokens

- Ink: `#19362e` (main text)
- Paper: `#fbf7ed` (warm page)
- Shelf: `#e7e0cf` (surfaces)
- Moss: `#2c684d` (primary action)
- Sun: `#e6a93d` (attention)
- Coral: `#b84f3e` (urgent)
- Night: `#102821` (dark treatment)
- Mint: `#c8e0c6` (dark surface accent)

The paired type is `Georgia` for the quiet, human display voice and a
self-hosted system UI fallback stack for controls and numbers. Numbers use
tabular figures. Space follows an 8px scale with generous 24–48px paper
margins. Cards have clipped corners and layered offset shadows, not floating
glass effects.

## Interaction and motion

Logging a dose moves a small paper counter downward over 180ms; refill status
changes use a brief opacity and outline transition. Nothing loops. Under
`prefers-reduced-motion: reduce`, all transitions are effectively instant.

## Asset plan and provenance

`public/hero-diorama.webp` is an original generated paper-cut illustration:
a rescue inhaler, nasal spray, injector, paper dose rings and a small cabinet
shelf, viewed straight-on. It contains no text, logos, people, or brand
devices. Generated on 2026-08-28 with the factory image deployment using:

> Paper-cut diorama illustration for an offline medicine dose counter: a teal
> generic inhaler, a small nasal spray, and a generic injector standing on
> layered warm cream paper shelves; circular paper count gauges; flat cut
> cardstock, visible paper edges, soft daylight, forest green, coral, ochre
> and warm ivory palette; frontal composition with empty space; no text, no
> letters, no watermark, no logos, no people, no brands.

It is product-specific artwork, generated with the factory image model, then
converted to WebP for the site. The social image is composed from this visual
language as SVG, authored in this repository.
