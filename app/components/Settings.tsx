'use client';

interface SettingsProps {
  precision: number;
  onPrecisionChange: (n: number) => void;
  angleMode: 'DEG' | 'RAD';
  onAngleModeChange: (m: 'DEG' | 'RAD') => void;
  theme: string;
  onThemeChange: (t: string) => void;
  onClearHistory: () => void;
}

const THEMES = [
  {
    id: 'dark',
    name: 'Obsidian',
    desc: 'Default dark',
    previewClass: 'dark',
  },
  {
    id: 'light',
    name: 'Daylight',
    desc: 'Light mode',
    previewClass: 'light',
  },
  {
    id: 'lcd',
    name: 'LCD',
    desc: 'Retro green',
    previewClass: 'lcd',
  },
];

export default function Settings({
  precision,
  onPrecisionChange,
  angleMode,
  onAngleModeChange,
  theme,
  onThemeChange,
  onClearHistory,
}: SettingsProps) {
  return (
    <div className="settings-panel">
      {/* Precision */}
      <div className="settings-card">
        <div className="settings-card-header">Precision</div>
        <div className="settings-row">
          <div className="settings-slider-wrapper">
            <input
              type="range"
              min={5}
              max={15}
              value={precision}
              onChange={(e) => onPrecisionChange(Number(e.target.value))}
              className="settings-slider"
            />
            <span className="settings-value">{precision} digits</span>
          </div>
        </div>
      </div>

      {/* Angle Mode */}
      <div className="settings-card">
        <div className="settings-card-header">Angle Mode</div>
        <div className="settings-pills">
          <button
            className={`settings-pill ${angleMode === 'DEG' ? 'active' : ''}`}
            onClick={() => onAngleModeChange('DEG')}
          >
            DEG
          </button>
          <button
            className={`settings-pill ${angleMode === 'RAD' ? 'active' : ''}`}
            onClick={() => onAngleModeChange('RAD')}
          >
            RAD
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="settings-card">
        <div className="settings-card-header">Theme</div>
        <div className="settings-theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-card ${theme === t.id ? 'active' : ''}`}
              onClick={() => onThemeChange(t.id)}
              title={t.desc}
            >
              <div className={`theme-preview ${t.previewClass}`} />
              <span className="theme-name">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear History */}
      <div className="settings-card" style={{ padding: '12px 16px' }}>
        <button className="btn-danger" onClick={onClearHistory}>
          Clear History
        </button>
      </div>
    </div>
  );
}
