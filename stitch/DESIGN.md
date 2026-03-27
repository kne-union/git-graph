# Design System Strategy: The Semantic Architect

## 1. Overview & Creative North Star
### Creative North Star: "The Semantic Architect"
The vision for this design system is to transform the complex, often chaotic world of version control into a structured, architectural experience. We are moving away from the cluttered "dashboard" aesthetic of traditional Git clients and toward an **Editorial Technical Workspace**. 

This system prioritizes the "Information Layer" by using high-contrast typography and intentional negative space. By breaking the standard grid with varying column widths and asymmetrical focal points (such as the visual Git graph), we create a sense of rhythm and flow. The interface should feel like a high-end architectural blueprint: precise, authoritative, and sophisticated.

## 2. Colors & Surface Logic

### The "No-Line" Rule
To achieve a premium, editorial feel, **1px solid borders are strictly prohibited for sectioning.** Structural boundaries must be defined through tonal shifts. 
- A sidebar uses `surface-container-low` (#f6f3f4) against the main `background` (#fcf8f9).
- Active states and hovered items are defined by a shift to `surface-container-high` (#e9e7ea).

### Surface Hierarchy & Nesting
Think of the UI as a series of physical, stacked layers of varying density.
*   **Base:** `surface` (#fcf8f9) - The primary canvas.
*   **Lateral Navigation (Sidebar):** `surface-container-low` (#f6f3f4) - Subtle recession to push focus to the center.
*   **Search/Input Wrappers:** `surface-container-lowest` (#ffffff) - High-visibility zones for interaction.
*   **Active Commit Selection:** `secondary-container` (#d3e4fe) with `on-secondary-container` (#435368) text.

### The Glass & Gradient Rule
Floating elements, such as context menus or branch pickers, should utilize **Glassmorphism**: 
- Background: `surface` at 80% opacity.
- Effect: `backdrop-blur` (12px).
- CTAs: Use a subtle linear gradient from `primary` (#006398) to `primary-dim` (#005785) to add "soul" and depth to the interaction points.

## 3. Typography
The system utilizes a dual-font strategy to balance human readability with technical precision.

*   **Display & Headlines (Manrope):** Chosen for its geometric clarity and modern "tech-editorial" feel.
    *   *Headline-sm:* Used for section titles like "Commit History" or "Changed Files" to provide an authoritative anchor.
*   **UI & Body (Inter):** The workhorse of the system. 
    *   *Body-md:* Standard for commit messages and file names.
    *   *Label-sm:* Used for metadata (dates, authors) to maintain a clean hierarchy without overwhelming the primary message.
*   **Technical Monospace:** For SHAs, paths, and diffs. This font is never used for UI labels, only for raw data, creating a clear semantic distinction between "The Tool" and "The Code."

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering**. For example, a "Changed Files" list item should not have a border; instead, it sits on `surface-container` and transitions to `surface-container-high` on hover. This creates a soft, natural lift.

### Ambient Shadows
When a floating element (like a filter dropdown) is required:
- **Color:** A tinted version of `on-surface` (#323235) at 6% opacity.
- **Blur:** 24px - 32px for a diffused, ambient light effect that avoids the "dirty" look of standard grey shadows.

### The "Ghost Border" Fallback
If contrast is insufficient (e.g., in accessibility-critical components), use a **Ghost Border**:
- Token: `outline-variant` (#b2b1b4) at **15% opacity**. This provides a hint of structure without interrupting the visual flow.

## 5. Components

### Search & Filters
- **Container**: `surface-container-lowest` (#ffffff) background.
- **Shape**: `sm` (0.125rem) or `none` for a sharp, professional look.
- **Interactions**: On focus, the border-alternative is a subtle `primary` (#006398) glow at 20% opacity.

### Commit History List
- **Separation**: Strictly no dividers. Use `Spacing-4` (0.9rem) between items.
- **Git Graph**: Utilize the `tertiary` (#006d4a) and `primary` (#006398) palettes for branch lines. Lines should have a stroke-width of 2px and rounded "elbows" for a modern, fluid feel.
- **Status Icons**: 
    - *Added*: `tertiary` (#006d4a).
    - *Modified*: `secondary` (#506076).
    - *Deleted*: `error` (#9f403d).

### Buttons & Chips
- **Primary Button**: `primary` (#006398) background with `on-primary` (#f4f8ff) text. Corner radius: `md` (0.375rem).
- **Filter Chips**: `surface-container-highest` (#e3e2e4) background. On selection, transition to `primary-container` (#cce5ff).

### Commit Details (The Info Panel)
- **Metadata Layout**: Use `label-md` for keys (e.g., "SHA:") and monospace for values. 
- **File List**: Use `surface-container-low` background to distinguish the file list from the commit description area.

## 6. Do's and Don'ts

### Do
*   **Do** use vertical whitespace (`Spacing-6` to `Spacing-8`) to separate major functional groups instead of lines.
*   **Do** use `primary-dim` for secondary technical information that still needs to be legible.
*   **Do** ensure the Git Graph colors have sufficient contrast against the `surface` backgrounds.
*   **Do** use the `xl` (0.75rem) roundedness for large-scale containers to soften the "industrial" feel.

### Don't
*   **Don't** use 100% black (#000000) for text. Use `on-surface` (#323235) to maintain a premium, ink-on-paper feel.
*   **Don't** use standard "drop shadows" on cards; stick to Tonal Layering.
*   **Don't** mix the Monospace font into the UI navigation or header elements.
*   **Don't** use high-saturation reds or greens for "Add/Delete" indicators; use the `tertiary` and `error` tokens provided to ensure they harmonize with the blue/grey palette.