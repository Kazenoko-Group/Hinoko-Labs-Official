# Hinoko Labs design QA

Date: 2026-09-16

## Scope and visual evidence

- Source visual truth: https://x.ai/ (light theme), plus the supplied xAI Refero reference.
- Implementation: http://127.0.0.1:8796/.
- Source and implementation screenshots were captured and displayed together in the task using the in-app browser. Screenshot files were not persisted to disk; the paired captures are in the task history.
- Desktop comparison: 1440 × 1000 CSS px and image px, device pixel ratio 1, page top, light theme, closed navigation. No density rescaling required.
- Mobile comparison: 390 × 844 CSS px and image px, page top, light theme, closed navigation. Additional implementation coverage: 320 × 800, open menu, recruitment destination, full desktop page.
- Focused evidence: menu open/closed screenshots, recruitment screenshot, and 320px heading/card reflow screenshots. Text and controls are legible at the captured scale.

## Intentional adaptations

The user requested an organization introduction close to x.ai, explicitly rejecting the generated concepts and substantial product promotion. The implementation therefore adopts the centered typographic hero, announcement pill, restrained black/gray buttons, warm neutral surfaces, aligned content width, and spacious two-column sections. It does not reproduce xAI product demos or marketing claims. Homu and Kairo appear only in one small row. Existing local brand assets and Geist/Hiragino fonts are used; the source's proprietary font is not bundled.

## Findings and fixes

1. [P2, resolved] Desktop hero initially placed the first content row about 60px below the reference. Shortened the organization description, tightened the heading line height and bottom padding. The revised paired 1440px capture places the first row at approximately the same vertical position as the source.
2. [P2, resolved] Engineering heading wrapped mid-phrase at 390px. Reduced mobile card heading size from 27px to 24px. The revised 390px screenshot shows the intended two-line title.
3. [P2, resolved] At 320px the hero and split-card headings wrapped awkwardly. Set the narrow hero to 22px and switched the cards to a single column. The subsequent 320px screenshot shows intact heading lines with no horizontal overflow.

## Required fidelity surfaces

- Typography: normal-weight sans serif, compact tracking, explicit Japanese line breaks, locally hosted Latin fonts. Japanese line height intentionally accommodates Japanese text rather than mechanically copying English dimensions.
- Layout: 1232px content width, centered hero, 14px grid gaps, 16px content radii, pill-shaped controls. Mobile content stacks cleanly.
- Color: white page, #0a0a0a text and primary buttons, #f9f8f6 surfaces, muted gray copy and fine dividers. No decorative generated imagery.
- Images: existing brand/product PNGs only, correctly loaded and proportioned. Product images are subordinate to organization content.
- Copy: organization and activities lead; recruitment retains the unpaid participation disclosure and original application URL. Removed empty social links and lengthy product claims.

## Verification

- Browser: desktop about anchor, mobile menu toggle, Escape close and focus return, mobile recruitment anchor with destination focus, navigation dismissal after link selection.
- DOM: no broken internal anchors, no empty hash links, all displayed images loaded.
- No horizontal overflow at 1440px, 390px or 320px.
- Application links retain https://forms.gle/MGa2NQpNaHNPS29Q9 with new-tab protection; mail links retain the original address. External form submission and delivery of email are outside this check.
- Browser console: no warning or error entries during local page checks.
- `node --check main.js`: passed.
- `git diff --check`: passed.
- Reduced-motion preference disables smooth scrolling and transitions through CSS; this preference was reviewed in code rather than emulated in the browser.

## Remaining limitations

Visual fidelity is an adaptation to the user's organization and Japanese copy, not a pixel-identical xAI clone. No cross-browser or physical-device testing was performed.

final result: passed

## Hero shape update — 2026-09-16

User requested a designed hero with a shape and a more modern xAI-like appearance. Added a monochrome sculptural orbital ribbon beneath the hero copy; maintained the organization-first content and restrained product row.

- Asset reference: `assets/hero-orbit.png` (1942 × 809), generated and visually inspected.
- Implementation evidence: `screenshot-hero-v2.png` (1440 × 1100) and `screenshot-hero-mobile-v2.png` (390 × 844); browser screenshots at DPR 1. Additional 320 × 800 screenshot checked in the task.
- Shape retains intrinsic aspect ratio, has no text or controls embedded, is excluded from accessibility output, and does not intercept pointer events.
- Typography and spacing updated in the hero only. White/black/warm-neutral tokens remain unchanged. The large sculpture intentionally adds height relative to the earlier typography-only hero.
- At 1440, 390 and 320px: no heading/button overlap; image loaded; no horizontal overflow. Mobile buttons remain at least 44px tall.
- No browser warning/error entries. JavaScript syntax and git whitespace checks passed.
- No new actionable P0/P1/P2 findings.

final result: passed

## Live 3D hero — 2026-09-16

Supersedes the raster hero above. User explicitly requested actual animation and an integrated modern design.

- Implemented local WebGL ribbon geometry in `hero-scene.js`, with rotation, changing studio reflections, smoothed pointer tilt and a pause/resume control. No raster image is used by the hero.
- Visual hierarchy: dark first headline line, gray second line, compact centered actions and a full-width live scene. Replaced filled activity cards with a simple divided editorial row.
- Evidence: `screenshot-hero-live.png` (1440 × 1000); `screenshot-hero-live-mobile.png` (390 × 844). A 320 × 800 capture is in the task. CSS dimensions match screenshot dimensions; the canvas is internally supersampled at 1.5–2× for smoother edges.
- [P2, resolved] Initial projection clipped the rotating ribbon at the canvas edges. Added aspect-aware projection bounds and increased desktop scene height. Subsequent desktop and mobile captures show the full object.
- [P2, resolved] Initial mobile canvas extended beyond the hero. Changed it to 100% width. 390px and 320px DOM measurements show no horizontal overflow.
- Motion verified with different running screenshots; after the pause state settled, two screenshots across separate tool calls were byte-identical. Resume control returned to its running state. An initial pause comparison differed during viewport/focus settling and was repeated at a stable viewport.
- Browser console reported no warnings/errors. JS syntax and git whitespace checks passed.
- Reduced motion, visibility suspension, pointer response and WebGL failure fallback are implemented. Reduced-motion OS emulation and context-loss injection were not exercised through browser tooling; those paths were code-reviewed.
- Raster art has been replaced by procedural geometry in response to the user's instruction. This is an intentional change to the visual source, not a pixel-identical image match.

final result: passed

## 2026-09-16 — Homu reference refinement (current)

Replaced the metallic ring with full-bleed, procedurally animated copper light folds. The supplied Homu screenshot informs the dark palette, quiet center, fine header rule, typography and button proportions. The site remains an organization introduction; Homu and Kairo appear in one compact row.

Rebuilt styles.css without accumulated overrides. All sections now use the same dark palette and editorial spacing. Mobile-specific light placement keeps the background visible on narrow screens. No external rendering dependencies or generated background image.

Verified in the local browser:
- Desktop 1440×900 hero and full-page visual review.
- Mobile 390×844 visual review; 320px document width equals viewport width. Tight heading wrap corrected below 380px.
- Animation screenshots change while running; stable screenshots match exactly while paused. Resume control changes back to running state.
- Mobile menu expands; Escape closes it and returns focus.
- No browser errors or warnings.
- JavaScript syntax and git whitespace checks pass.

Reduced-motion preference and offscreen/hidden suspension are implemented and code-reviewed; OS preference switching and physical-device GPU performance were not tested. WebGL failure leaves readable content on a static dark background.

Current screenshots: screenshot-hinoko-refined.png, screenshot-hinoko-refined-mobile.png.
