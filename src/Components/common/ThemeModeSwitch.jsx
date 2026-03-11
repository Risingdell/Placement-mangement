function ThemeModeSwitch({ theme = 'dark', onChange, className = '' }) {
  const isLight = theme === 'light';

  const baseShell = isLight
    ? 'border-[#d1d5db] bg-[#f9fafb]'
    : 'border-[#3a3a40] bg-[#202026]';

  const activeOption = isLight
    ? 'bg-white text-[#111827] shadow-sm'
    : 'bg-[#2a2a2e] text-white shadow-sm';

  const inactiveOption = isLight
    ? 'text-[#6b7280] hover:text-[#111827]'
    : 'text-[#9ca3af] hover:text-[#f4f4f5]';

  return (
    <div
      className={`inline-flex h-9 items-center rounded-md border p-1 ${baseShell} ${className}`.trim()}
      role="group"
      aria-label="Theme switch"
    >
      <button
        type="button"
        onClick={() => onChange?.('light')}
        aria-pressed={isLight}
        className={`rounded px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] transition-colors ${
          isLight ? activeOption : inactiveOption
        }`}
      >
        LIGHT
      </button>
      <button
        type="button"
        onClick={() => onChange?.('dark')}
        aria-pressed={!isLight}
        className={`rounded px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] transition-colors ${
          !isLight ? activeOption : inactiveOption
        }`}
      >
        DARK
      </button>
    </div>
  );
}

export default ThemeModeSwitch;
