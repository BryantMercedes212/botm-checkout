// Demo controls: switch the fake API response via ?scenario=
// (mock/fakeCheckout.ts reads it from the Referer header).
// Shown on the live demo too so reviewers can try each state. Wouldn't ship in a real app.
const SCENARIOS = [
  { id: 'success', label: 'Success' },
  { id: 'slow', label: 'Slow (5s)' },
  { id: 'error', label: 'API error' },
  { id: 'server-error', label: '502, HTML body' },
  { id: 'timeout', label: 'Timeout (15s)' },
] as const;

export function ScenarioSwitcher() {
  const current = new URLSearchParams(window.location.search).get('scenario') ?? 'success';

  return (
    <nav className="dev-switcher" aria-label="Mock API scenario (demo only)">
      <span className="dev-switcher__label">Mock API:</span>
      {SCENARIOS.map((s) => (
        <a
          key={s.id}
          href={`?scenario=${s.id}`}
          aria-current={current === s.id ? 'true' : undefined}
        >
          {s.label}
        </a>
      ))}
      <style>{`
        .dev-switcher {
          display: flex; flex-wrap: wrap; gap: 4px; align-items: center; justify-content: center;
          padding: 8px 16px; background: #1d1b18; color: #fff; font-size: 12px;
        }
        .dev-switcher__label { padding: 0 6px; opacity: .7; }
        .dev-switcher a { color: #fff; text-decoration: none; padding: 4px 10px; border-radius: 999px; }
        .dev-switcher a:hover { background: rgb(255 255 255 / .12); }
        .dev-switcher a[aria-current='true'] { background: #fff; color: #1d1b18; font-weight: 600; }
      `}</style>
    </nav>
  );
}
