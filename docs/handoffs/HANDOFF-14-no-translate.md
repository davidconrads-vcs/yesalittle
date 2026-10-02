# Handoff 14 — Suppress Browser Translation App-Wide

**Scope:** One change — mark the entire app `translate="no"` so browser translation can't alter any
part of it. Plus verification of what Chrome actually does.

**No content changes, no audio, no new prompts.** Single attribute plus testing.

**Branch:** `no-translate` from `main`.

---

## The problem

With the UI language set to Spanish, Chrome detects a Spanish page (correctly — `documentElement.lang`
is set to `es` since Handoff 11) and offers to translate it to the browser's configured language. If
the user accepts, everything unprotected gets machine-translated.

Handoff 7 protected only the **learning content** (target phrase and response). Everything else is
exposed:
- the **native reference lines** (the Spanish translations beneath the target text)
- the **context hints**
- the **gloss**
- all **UI chrome**

Accepting the translate prompt therefore turns the Spanish scaffolding into English, producing
English-over-English — which reads as the app having lost its native-language support entirely. This
was mistaken for an app bug in real use.

**Why the broad fix is now correct:** before Handoff 8 the chrome was English-only, so leaving it
translatable was arguably a feature. Now the app localizes itself through the i18n system, so browser
translation can only degrade it. There is no element where machine translation adds value.

---

## Part 1 — The change

Apply `translate="no"` to the whole app.

**Preferred placement:** the `<html>` element in `index.html`. Broadest coverage, includes anything
added later, and can't drift as components are added.

```html
<html lang="en" translate="no">
```

**CC should determine and report:** whether the `<html>`-level attribute is sufficient, or whether
Chrome also requires/honors `class="notranslate"` on the same element (both are recognized by Google's
translation stack; belt-and-suspenders may be warranted). Apply whichever combination actually works,
based on the Part 2 testing — not on documentation alone.

**Leave existing protection in place.** The `translate="no"` attributes added in Handoff 7 on the
learning content are now redundant but harmless. Do NOT remove them — they're defense in depth if the
root-level attribute is ever lost, and removing them is churn with no benefit.

**Do NOT change `documentElement.lang`.** It updates with the UI language (Handoff 11, Part 7) and is
correct for screen readers. It's the reason Chrome offers to translate, but the right fix is
suppressing translation, not lying about the page language.

---

## Part 2 — Verification (testing is the deliverable here)

The docs and the behavior may differ, so **test in a real Chrome instance** and report what actually
happens:

1. **Does the translate prompt still appear?** Load the app with UI language set to Spanish, in a
   Chrome configured for English. Report whether Chrome offers to translate.
   - Ideal: no offer at all.
   - Acceptable: offer appears but accepting it changes nothing.
   - Report which of these occurs.

2. **If the prompt appears and you accept it, does anything change?** Check specifically:
   - target phrase and response (should be unchanged — already protected)
   - **native reference lines** (the Spanish beneath the English, in ES→EN)
   - **context hint**
   - **gloss** (check `groc-025` or `cafe-006`)
   - **UI chrome** (buttons, labels, mode names)
   All should be unchanged.

3. **Test both directions that matter:** ES→EN (Spanish chrome, English targets) and EN→ES (English
   chrome, Spanish targets). The translate offer may behave differently depending on which language
   dominates the page.

4. **Confirm no visual or functional regression** — the attribute shouldn't affect rendering at all,
   but confirm the app looks and behaves identically.

5. **Build clean, no console errors.**

---

## Part 3 — Report

- Which attribute/class combination was applied and why.
- Whether Chrome still offers to translate, and whether accepting it has any effect.
- Confirmation that native reference lines, context, gloss, and chrome are all unaffected by an
  accepted translation.
- If the prompt still appears despite the attribute: note it as a known limitation rather than
  attempting workarounds (e.g. do NOT suppress `documentElement.lang` to hide the page's language —
  that trades an accessibility property for a cosmetic one).
