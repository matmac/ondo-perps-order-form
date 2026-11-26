# QA

Last pass before submission. Run it again after any change to the form.

| Check | How | Result |
|---|---|---|
| Example orders | `npm test`, and each one from the prototype controls | All 6 land on their expected status |
| Accessibility scan | axe-core 4.10 on every state, desktop (1500) and mobile (390), plus /components and /tokens | No real violations. Two reports are known false positives: the selected Long label (axe cannot see the sliding indicator behind it; measured 8.3:1) and the disabled Input text (disabled controls are exempt from contrast) |
| Keyboard | Tab through the page from the top | Order follows the layout: order type, margin, side, amount, unit, slider, %, quick size, toggles, review, CTA, details. Every stop shows the focus ring. Radio groups and tabs take one stop and move with the arrows |
| Screen reader names | Accessibility tree of the form | Every control has a name; the summary is one `<dl>`; errors are linked with `aria-describedby`; the disabled CTA stays focusable |
| Touch targets | Hit area of every control in the form | At least 24 px on desktop, 44 px on mobile |
| Layout modes | Desktop, and 375 / 390 phones | No sideways scroll; the decision bar sticks to the bottom on mobile |
| Motion modes | `prefers-reduced-motion` on and off | Travel drops to 0 ms, colour fades stay at 100 ms, the spinner keeps turning |
| Themes | Classic and Modern | Only radius and the number font change |
| Tokens | `npm run tokens`, `npm run lint` | Tier rules pass; no unknown tokens; no raw lengths, times, colours or curves in CSS; Figma and the JSON both hold 357 variables |
