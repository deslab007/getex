# Getex Website — Hero B (Nature)

Approved homepage design, Hero B variant (Sydney bushland hero + leaf motif
in footer), for Getex Pty Ltd — ready for development in Claude Code.

## Project structure

```
getex-website-heroB/
├── index.html                    Homepage (Hero B - Sydney bushland)
├── css/
│   └── styles.css                All styles
├── js/
│   └── scripts.js                Selected Work carousel logic
└── images/
    ├── getex-logo.png
    ├── hero-bushland.jpg          Hero image (Sydney sandstone bushland)
    ├── sectors-naval-dockside.jpg Who We Work With section
    ├── consultant-reviewing-plans.jpg
    ├── field-consultant.jpg
    ├── accred-nata.png            NATA accreditation logo
    ├── accred-iso9001.png         ISO 9001 logo
    ├── accred-iso45001.png        ISO 45001 logo
    └── leaf-motif.png             Leaf watermark in footer (Hero B only)
```

## Brand

- Primary green: #71BE43
- Logo grey: #808080
- Dark text: #333333 / #1a1a1a
- Font: Arial / system sans-serif

## Difference from Hero A

- Hero image: Sydney bushland (sandstone + angophoras) instead of the
  fire trail / vehicle shot
- Leaf motif watermark in the footer bottom-right (client trialling this
  on Hero B only to compare with/without)

## Still to build (from client feedback)

- [ ] Inner pages: Services, Sectors, About, Contact, VENM
- [ ] Services mega-menu (fuller dropdown in main nav)
- [ ] Sectors page: each sector links to 2-3 relevant Selected Work
      examples (client to provide sector tagging per project)
- [ ] News & Insights: placeholder page + framework (article grid,
      category filtering, search) — structure only, no articles at launch
- [ ] Convert to custom WordPress theme (coordinate with Tyson)

## SEO requirements (per SEO Guide v2)

- One H1 per page
- LocalBusiness schema site-wide
- Service schema on Services page
- Person schema (Justin Thompson-Laing) on About
- FAQPage schema on Services (hidden structured data)
- All 301 redirects in place AT launch (critical — protects rankings)
- GTM container GTM-NHXZ4Z6D carried over
- Images compressed <200kb, WebP where possible
- VENM page at /venm-certificate/ — NOT in main nav

## Notes

- Two hero versions exist: Hero A (fire trail) and Hero B (this one).
  Client to choose final direction.
- Field photography reserved for hero + Selected Work; service cards are
  clean text-only to avoid a "trades directory" feel.
