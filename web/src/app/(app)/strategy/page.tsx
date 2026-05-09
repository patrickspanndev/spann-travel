import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Award strategy · Spann Travel",
  description: "Playbook-style guidance for transfers and partners.",
};

const cards = [
  {
    title: "Europe",
    body:
      "SkyTeam via Flying Blue (AMEX transfers, Promo Rewards) often beats Delta-metal pricing; Star Alliance via Aeroplan or United; Oneworld via Avios for short hops. Compare partner pricing before moving points.",
  },
  {
    title: "Japan & Asia",
    body:
      "JAL Mileage Bank and Alaska partners feature heavily for premium cabins; Avios distance bands; consider Aeroplan for Star Alliance carriers. Plan Tokyo/Osaka routes against multiple programs.",
  },
  {
    title: "Hotels",
    body:
      "Hyatt via Chase (after Sapphire) — high cents-per-point on tiers; Hilton with AMEX transfer bonuses; Marriott as existing Bonvoy asset — use promos, avoid airline conversions.",
  },
  {
    title: "When to use AMEX Membership Rewards",
    body:
      "International premium cabins, transfer bonuses, Delta and Flying Blue top-ups, Hilton when bonuses run. Poor value: statement credits.",
  },
  {
    title: "When to use Chase Ultimate Rewards",
    body:
      "After Sapphire: United domestic and partners, Hyatt stays, simple 1:1 transfers. Freedom alone earns but does not transfer.",
  },
  {
    title: "When to use United / Aeroplan",
    body:
      "Star Alliance coverage, United hubs, Aeroplan partner sweet spots — compare both before booking the same award.",
  },
  {
    title: "When to use Flying Blue",
    body:
      "SkyTeam awards, AF/KL metal, Promo Rewards. Attach Flying Blue to AF reservations unless chasing Delta elite elsewhere.",
  },
  {
    title: "When to use Hyatt",
    body:
      "Category 1–4 bargains, aspirational resorts with Chase 1:1 — prioritize once Sapphire unlocks transfers.",
  },
];

export default function StrategyPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Award strategy</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
        Condensed from your{" "}
        <code className="rounded bg-white/10 px-1 text-xs text-teal-200">Travel_Points_Playbook.docx</code> and{" "}
        <code className="rounded bg-white/10 px-1 text-xs text-teal-200">app_prompt.txt</code>. For execution steps use{" "}
        <Link className="text-teal-400 hover:text-teal-300" href="/checklists">
          Checklists
        </Link>{" "}
        and for balances use{" "}
        <Link className="text-teal-400 hover:text-teal-300" href="/loyalty-programs">
          Loyalty
        </Link>
        .
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-lg shadow-black/20"
          >
            <h2 className="text-base font-semibold text-teal-200">{c.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{c.body}</p>
          </article>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-200/90">Transfer discipline</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-rose-100/90">
          <li>Do not buy miles speculatively.</li>
          <li>Do not transfer points until award space is confirmed.</li>
          <li>Watch for transfer bonuses — but only when a specific booking is in motion.</li>
        </ul>
      </section>
    </>
  );
}
