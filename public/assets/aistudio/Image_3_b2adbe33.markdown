---
name: Monochrome Editorial Engine
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f7'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e6'
  on-surface: '#1b1b1e'
  on-surface-variant: '#47464a'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#78767b'
  outline-variant: '#c8c5ca'
  surface-tint: '#5f5e60'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1d'
  on-primary-container: '#858386'
  inverse-primary: '#c8c6c8'
  secondary: '#5d5e66'
  on-secondary: '#ffffff'
  secondary-container: '#e3e1ec'
  on-secondary-container: '#63646c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f1a1a'
  on-tertiary-container: '#8a8282'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e1e4'
  primary-fixed-dim: '#c8c6c8'
  on-primary-fixed: '#1c1b1d'
  on-primary-fixed-variant: '#474649'
  secondary-fixed: '#e3e1ec'
  secondary-fixed-dim: '#c6c5cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#46464e'
  tertiary-fixed: '#ebe0df'
  tertiary-fixed-dim: '#cec4c4'
  on-tertiary-fixed: '#1f1a1a'
  on-tertiary-fixed-variant: '#4c4545'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e6'
typography:
  display-doc-title:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-doc-title-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-h1:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-h2:
    fontFamily: Source Serif 4
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-h3:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-document:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  body-document-lead:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  ui-menu-title:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  ui-body:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  ui-body-medium:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-toolbar:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-code-inline:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-status:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sidebar: 1.5rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for deep focus, structured composition, and refined document authoring. It synthesizes the mechanical utility of classic word processor ribbons (MS Word) with the distraction-free purity of iA Writer and the modular spatial clarity of modern workspaces like Notion.

The target audience comprises authors, technical writers, editors, legal professionals, and knowledge workers who require uncompromising clarity and typographic discipline. The emotional tone is authoritative, quiet, and razor-sharp—eradicating visual noise to elevate the written word to primary status.

The visual direction employs an **Architectural Monochrome Minimalist** aesthetic:
- Pure structural precision utilizing 1px linear partitions instead of decorative fills.
- High-contrast typography ensuring effortless legibility across extensive editing sessions.
- An unmistakable physical boundary between the "application chrome" (dense, utilitarian, systemic) and the "document sheet" (open, breathable, literary).

## Colors

The color palette is rigorously monochromatic, using zero chromatic saturation to prevent cognitive fatigue and color bias during drafting. Contrast ratios meet strict WCAG AAA guidelines across all key interactions.

- **Primary (`#09090B`)**: Pitch zinc black. Used for high-impact affordances, active icon toggles, solid action buttons, and dominant document headings.
- **Secondary (`#71717A`)**: Mid-tone neutral gray. Serves as the functional hierarchy step for metadata, shortcuts, line numbers, word count tallies, and inactive action icons.
- **Neutral / Structural (`#18181B`)**: Charcoal black. Deployed for precise 1px hairpins, selected tool borders, and input focus rings.
- **Surface Canvas (`#FFFFFF`)**: Pure crisp white. Reserved for the central writing canvas to mimic physical bright-white heavy stock paper.
- **Chrome App Shell (`#FAFAFA`)**: Subtlest off-white backdrop framing the central sheet canvas.
- **Surface Muted / Hover Tints (`#F4F4F5`, `#E4E4E7`)**: Subdued grayscale tones reserved for button hover states, row selections, toolbar section separators, and subtle table gridlines.

## Typography

The type system is built on a clear dichotomy between Application Chrome and Document Content:

1. **Document Content (`Source Serif 4`)**: A robust, publication-grade serif with chiseled details and open counters that excels at long-form prose and academic reading. Generous body line-height (`28px` on `16px` font size) guarantees zero optical collisions across multi-line paragraphs.
2. **Interface Chrome (`Hanken Grotesk`)**: A contemporary grotesque sans-serif that governs application navigation, sidebars, modal dialogs, and inspector panels. Its neutral structure eliminates visual friction in data-heavy sidebars.
3. **Controls, Status, & Shortcuts (`Geist`)**: A mono-leaning, high-density sans chosen for toolbars, dropdown values, character counters, hotkey combinations, and inline monospace syntax.

Editorial rules:
- Paragraph indentation or block separation within documents should be explicit: use a single blank line or `1.5rem` paragraph-spacing.
- UI elements must never use faux-italics or loose kerning; use exact weights (`400`, `500`, `600`, `700`).

## Layout & Spacing

The layout model divides the screen into rigid chrome zones and a centered, fluid document workspace:

- **Desktop Layout (Primary)**:
  - **Left Rail (Document Tree / File Navigator)**: Fixed `260px` or collapsible to icon-only `48px`.
  - **Top Ribbon / Command Header**: Fixed `44px` height with segmented command groups separated by 1px vertical borders.
  - **Document Canvas**: Fixed or max-width container (`720px` for standard reading line length, `840px` for wide-page mode), centered horizontally with dynamic automatic margins.
  - **Right Inspector (Styles / Metadata)**: Collapsible `280px` drawer.
  - **Status Footer**: Fixed `28px` utility bar at the bottom containing line, column, and word counts.
- **Tablet / Split View**: Left navigation rail converts to an off-canvas drawer. Inspector folds into an overlay sheet. Document canvas remains centered with `1.5rem` outer margins.
- **Mobile Reflow**: Ribbon toolbar converts to a horizontally scrolling bottom action bar; margins compress to `1rem`.

Component padding strictly adheres to the 4px baseline grid (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 12px, `space-lg` = 20px, `space-xl` = 32px).

## Elevation & Depth

Visual hierarchy does not rely on ambient blur or colorful diffusion. Instead, it relies on crisp optical layering, precise 1px lines, and a single, carefully calibrated physical document shadow:

- **Level 0 (App Base Chrome)**: `#FAFAFA` background. Flat, inert.
- **Level 1 (Document Sheet)**: `#FFFFFF` surface sitting atop the `#FAFAFA` canvas. It features a crisp, tactile double-edge offset shadow:
  `box-shadow: 0 0 0 1px rgba(9, 9, 11, 0.07), 0 4px 16px -2px rgba(9, 9, 11, 0.08), 0 12px 32px -4px rgba(9, 9, 11, 0.04);`
- **Level 2 (Popovers, Context Menus, Toolbars)**: Solid `#FFFFFF` background with a crisp border: `border: 1px solid #18181B`. Elevation is defined by a deep, sharp drop: `box-shadow: 0 8px 24px -4px rgba(9, 9, 11, 0.12)`.
- **Level 3 (Modal Dialogs & Command Palette)**: `#FFFFFF` sheet, `border: 1px solid #09090B`, overlaid against a translucent monochrome scrim (`background-color: rgba(9, 9, 11, 0.4)`).
- **Tooltips**: Solid inverted pill: `#09090B` background with `#FFFFFF` text and no shadow.

## Shapes

The design system maintains a structured, architectural aesthetic with controlled, conservative rounding (`roundedness: 1`):

- **Default Controls & Inputs**: `0.25rem` (4px). Small, deliberate corner softening that keeps the toolbars feeling precise and engineered rather than bubbly.
- **Cards, Panels, and Document Viewport**: `0.5rem` (8px). Used on popover containers, floating format ribbons, and dialogs.
- **Modals & Major Sheets**: `0.75rem` (12px).
- **Inline Badges & Keyboard Shortcut Caps**: `0.25rem` (4px) with inner paddings calibrated to maintain square geometry for key caps.
- **Buttons**: `0.25rem` (4px). Pure rectangular posture with minimum roundness.

## Components

### Buttons & Action Bars
- **Primary Button**: Solid `#09090B` fill, `#FFFFFF` text, `border: 1px solid #09090B`. On hover: `#18181B`. Active: `#27272A`.
- **Secondary Button**: `#FFFFFF` background, `#09090B` text, `border: 1px solid #E4E4E7`. On hover: `#F4F4F5`, `border-color: #18181B`.
- **Ghost / Ribbon Tool Buttons**: Borderless `#FFFFFF` or transparent base. `28px x 28px` target. Active/Toggled state: `#09090B` background with `#FFFFFF` icon. Hover state: `#F4F4F5` background with `#09090B` icon.

### Ribbon & Formatting Groupings
- Segmented command strips organized in functional clusters (Font, Paragraph, Insert, View).
- Groups are divided by a 1px vertical stroke (`#E4E4E7`) with `8px` vertical inset.
- Icon styles: 16px geometric outlines with 1.5px stroke weight.

### Text Inputs & Search Fields
- Base state: `#FFFFFF` background, `border: 1px solid #E4E4E7`, text `#09090B`, placeholder `#71717A`.
- Focus state: `border: 1px solid #09090B`, zero outline glow, optional subtle inset line.
- Monospace fields (e.g., Markdown mode, find & replace) utilize `Geist` at `13px`.

### Checkboxes, Radios, and Toggles
- **Checkbox**: `16px x 16px`, `2px` rounded border. Unchecked: `border: 1px solid #71717A`, `#FFFFFF` fill. Checked: solid `#09090B` fill with `#FFFFFF` check glyph.
- **Radio**: `16px x 16px`, circular. Selected: 1px outer ring in `#09090B` with an internal solid `#09090B` bullet separated by 2px white space.
- **Switch**: `32px x 18px` track. Inactive: `#E4E4E7` track with white thumb. Active: `#09090B` track with white thumb.

### Document Paper Sheet & Typography Canvas
- Centered sheet canvas with deliberate top margin (`32px` from ribbon).
- Continuous scroll format with explicit page-break delimiters: a dashed 1px horizontal rule (`#E4E4E7`) with centered pill page indicators (`Page 2`).
- Selection highlight: `#18181B` background with `#FFFFFF` inverted text, or subtle slate highlight tint (`rgba(9, 9, 11, 0.08)`) during mouse drag.

### Lists & Navigation Trees
- Left navigation file tree uses `24px` tall rows. Indent guides are 1px solid `#F4F4F5`. Active document is highlighted with a `2px` left border in `#09090B` and `#F4F4F5` row fill.

### Contextual Floating Bubble Menu
- Appears on text selection: miniature floating pill toolbar containing Bold, Italic, Strikethrough, Heading level, Link, and AI Assist.
- Styling: `#FFFFFF` background, `1px solid #18181B`, `8px` corner radius, with high-contrast active states.

### Status Bar & Micro-Indicators
- High-density `28px` bar anchored to the bottom.
- Displays line number, column count, word count, character count, zoom percentage, and encoding status in `Geist` `11px` (`#71717A`). Dividers are 1px solid `#E4E4E7`.