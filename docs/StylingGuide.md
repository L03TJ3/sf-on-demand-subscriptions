## Tamagui Design-System & Motion Guidelines

Make sure to review https://tamagui.dev/ui/intro for the latest documentation.
always verify and keep below instructions up to date.

### 1. Component Preference Order

1. **Use Finnie’s pre-styled design-system components** (e.g. `PrimaryButton`, `Card`, `TitleUnderline`).
2. If no pre-styled component exists, create one with **`styled()`** (see §4) and add it to `src/components/`.
3. Fall back to raw HTML / React-Native elements **only** when Tamagui has no equivalent — explain the reason in a comment.

---

### 2. Core UI Primitives to Favour

| Purpose           | Tamagui component            | Quick guideline                                                                                |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| Icons             | `@tamagui/lucide-icons`      | Pass the icon via the `icon` prop on Tamagui buttons or render directly: `<Plus size="$4" />`. |
| Scroll containers | `ScrollView`                 | Accepts all Tamagui style props and theme tokens — always use for scrollable areas.            |
| Gradients         | `LinearGradient`             | Provide `colors` array with theme tokens and `start`/`end` coords for direction.               |
| Dividers          | `Separator`                  | Horizontal by default; add `vertical` for side-by-side layouts.                                |
| Shapes            | `Square`, `Circle`           | `size` accepts numbers or `$token` values — great for avatars/badges.                          |
| Links             | `Anchor`                     | Cross-platform external links (`<a>` web / `Linking.openURL` native).                          |
| Layout            | `XStack`, `YStack`, `ZStack` | Primary flexbox primitives; prefer over raw `View`/`div`.                                      |

> **Rule of thumb:** If you write the same inline style twice (`borderRadius`, `padding`, etc.), stop and extract a `styled()` component.

---

### 3. Animation Recipe

1. **Define presets** once in `tamagui.config.ts`

   ```ts
   animations: createAnimations({
     fast: "ease-in 150ms",
     medium: "ease-out 300ms",
     slow: "ease-out 450ms",
   });
   ```

2. **Animate with the `animation` prop**

   ```tsx
   <YStack animation="medium" x={open ? 0 : -100} opacity={open ? 1 : 0} />
   ```

3. **Mount / unmount motion**

   - **Enter:** `onEnter={{ opacity: 0 }}` → fades in.
   - **Exit:** Wrap conditional UI in `<AnimatePresence>` and set `exitStyle`, e.g. `exitStyle={{ opacity: 0, scale: 0.9 }}`.

4. **Performance guardrails**

   - Prefer animating **transform & opacity**.
   - For heavy gesture-driven motion, switch the driver to Reanimated in config; component code stays unchanged.

---

### 4. `styled()` Convention Checklist

| Rule                                                                                         | Why                                    |
| -------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Use tokens** (`$color`, `$size`, etc.) – never hard-code values.                           | Automatic theming & dark-mode support. |
| Provide **variants** (`size`, `tone`, `pin`, …) + `defaultVariants`.                         | Predictable API across components.     |
| If wrapping a non-Tamagui component that supports `className`, set `acceptsClassName: true`. | Enables compiler optimisation.         |
| Place new styled components in `src/components/` and export via an index barrel.             | Clean imports & tree-shaking.          |

**Example – `RoundedSquare.tsx`**

```tsx
import { View, styled } from "@tamagui/core";

export const RoundedSquare = styled(View, {
  borderRadius: 20,

  variants: {
    size: {
      "...size": (val, { tokens }) => ({
        width: tokens.size[val] ?? val,
        height: tokens.size[val] ?? val,
      }),
    },
    centered: {
      true: { alignItems: "center", justifyContent: "center" },
    },
  },

  defaultVariants: {
    size: "$4",
    centered: true,
  },
});
```

---

### 5. Interaction & Accessibility

- Pair `hoverStyle` / `pressStyle` **with** an `animation` preset for tactile feedback.
- Use `VisuallyHidden` for screen-reader labels when an icon has no text.
- Apply Tamagui’s `role`, `asChild`, and `themeInverse` props where semantic or theme context requires.

---

### 6. Sanity Checks for Every PR

1. **Design-system compliance** – all new UI uses an existing styled component or adds one.
2. **No inline callbacks** inside render trees (global rule).
3. **Motion audit** – components that appear/disappear have a subtle animation.
