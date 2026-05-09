# Loyalty tracking — household best practices

Companion to **`Travel_Points_Playbook.docx`** and the in-app **Loyalty** screen. Spann Travel keeps **manual** balances and notes; there is no automated login or scrape.

---

## Rhythm

- Set **Last reviewed** when you refresh balances or verify tier — it is your “as of” signal without a separate ledger.
- Use **Monthly** checklist items (or your own rhythm) so reviews don’t slip during busy travel months.
- Treat **Balance** as free text you understand (`48k FB`, `125k MR in Amex`, etc.); consistency matters more than format.

## Credentials

- Prefer a **password manager** for real secrets; optional stored website password in the app is **household-visible** to anyone who can edit Loyalty under your RLS rules.
- **Login URL** should point at the real **sign-in** page you use (bookmark-quality); regional URLs are fine.
- **Login email hint** is a reminder only (which inbox), not proof of identity.

## Data you store

- **Member ID**: mask (last digits or partial), not full account numbers in notes intended for screenshots or sharing.
- **Notes**: good for promo end dates, companion certs, status-qualifying plans, or “do not transfer until booked.”
- One row per **traveler × program** so household strategy matches separate real-world accounts.

## Roles

- **`viewer`** can see cards but not edit — useful if you want someone to see the board without changing rows.
- **`admin` / `member`** can add and change data; treat that as **full trust** inside the household.

## Strategy alignment

- Before moving transferable points, follow your playbook: **confirm award space**, watch **transfer bonuses**, avoid **speculative** buys. The in-app **Strategy** page is the short reminder; the Word playbook stays authoritative.

## When manual isn’t enough

- If you later want **imports** (CSV), **history** (snapshots over time), or **reminder automations**, spec them explicitly — they stay separate from automated “log in as the user” flows for policy and fragility reasons.
