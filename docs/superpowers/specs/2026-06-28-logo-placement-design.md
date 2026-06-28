# Galaxy Constellation Logo Placement Design

## Decision

Add the Galaxy Macau and Mastercard logos as a compact top-bar partnership badge. Keep the left sidebar as the product identity for `Galaxy Constellation`; use the logos to prove the Galaxy Macau x Mastercard CDE data partnership beside the existing CDE status context.

Selected direction: **B. Top-bar partnership badge**.

## Context

The app already has a restrained luxury shell:

- `src/components/shell/co-brand-lockup.tsx` renders the product name and text-only `Galaxy Macau x Mastercard CDE` line in the sidebar.
- `src/components/shell/top-bar.tsx` renders CDE metric count, coverage, snapshot metadata, lens switching, and quarter selection.
- The provided source assets are `Galaxy-Macau-logo.png` and `mastercard_logo.png` at the repo root.

The logos should improve client/demo credibility without making the navigation feel crowded or changing the analytics-first visual hierarchy.

## Scope

In scope:

- Copy the two logo PNGs into `public/brand/` and reference only those public assets from app code.
- Add a reusable `BrandPartnershipBadge` shell component.
- Render the badge in `TopBar`, near the existing CDE metric and coverage chips.
- Keep the current sidebar `CoBrandLockup` copy intact.
- Add tests for rendering, accessibility, CDE-safe copy, and responsive fit.

Out of scope:

- No new route.
- No landing-page or hero redesign.
- No change to methodology wording.
- No use of the logos inside charts, cards, or route content in this pass.
- No dependency changes.

## Placement

The badge should live in the top bar’s left metadata group, directly after `Coverage 63%` and before the `2026 Q2 snapshot` / `Quarterly CDE refresh` chips. This makes the logos read as data-partnership context rather than a replacement for the product name.

Desktop and iPad layout:

- Badge text: `Data partnership`
- Galaxy Macau square logo first.
- Mastercard horizontal logo second.
- Small bordered pill treatment matching existing top-bar chips.
- Height should align visually with the current CDE chip and snapshot pills.

iPhone layout:

- Keep the badge visible but compact.
- Hide the `Data partnership` text below the `sm` breakpoint.
- Preserve both logos with constrained dimensions.
- Allow the top-bar metadata row to wrap naturally without causing horizontal body overflow.

## Component Design

Create `src/components/shell/brand-partnership-badge.tsx`.

Responsibilities:

- Render the two image assets with stable dimensions.
- Provide meaningful accessible names:
  - Galaxy Macau logo: `Galaxy Macau`
  - Mastercard logo: `Mastercard`
- Expose one concise wrapper label such as `Galaxy Macau and Mastercard data partnership`.
- Avoid currency text or CDE metric values in the component.
- Accept optional `className` only if needed for top-bar layout flexibility.

`TopBar` should import and render this component. The component should not depend on app state.

## Asset Handling

Use:

- `public/brand/galaxy-macau-logo.png`
- `public/brand/mastercard-logo.png`

Use Next.js `Image` with explicit width and height. The implementation must preserve aspect ratio:

- Galaxy Macau source: square logo.
- Mastercard source: horizontal wordmark/logo.

The original root-level source images should not be referenced by runtime app code after implementation.

## Responsive Requirements

The badge must support:

- iPhone width around `390px`: no horizontal body overflow, quarter selector remains accessible, lens switch remains reachable.
- iPad width around `820px`: badge, status chips, lens switch, and quarter selector are readable.
- Desktop width around `1440px`: badge appears as a polished part of the top-bar status system.

The badge should use fixed image dimensions with responsive maximum widths, not viewport-scaled font sizing.

## Accessibility

- Images must have useful alt text or accessible labels.
- The badge wrapper should have a concise accessible label.
- Decorative borders/backgrounds must not reduce contrast for the logos.
- Keyboard focus behavior should not change, because the badge is informational and non-interactive.

## Testing

Unit/component tests:

- Extend `TopBar` tests to assert the partnership badge renders.
- Assert the two logos have accessible names.
- Assert the top bar still renders CDE metric count, coverage, lens switch, and quarter selector.
- Assert rendered text does not include banned currency patterns.

E2E/responsive tests:

- Extend existing rendered compliance checks to verify the badge is present on desktop.
- Confirm iPhone and iPad checks still pass with no horizontal overflow.
- Keep the existing `npm run verify` gate as the final acceptance check.

## Acceptance Criteria

- The top bar shows Galaxy Macau and Mastercard logos as a compact data partnership badge.
- The sidebar product lockup still reads clearly as `Galaxy Constellation`.
- Mobile, iPad, and desktop top bars remain usable and free of horizontal overflow.
- No CDE compliance rules are weakened.
- `npm run verify` passes.
