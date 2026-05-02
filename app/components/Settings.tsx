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
      <h2 className="settings-title">Settings</h2>
      
      <div className="settings-group">
        <label className="settings-label">Precision</label>
        <div className="settings-row">
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

      <div className="settings-group">
        <label className="settings-label">Angle Mode</label>
        <div className="settings-toggle">
          <button
            className={`toggle-btn ${angleMode === 'DEG' ? 'active' : ''}`}
            onClick={() => onAngleModeChange('DEG')}
          >
            DEG
          </button>
          <button
            className={`toggle-btn ${angleMode === 'RAD' ? 'active' : ''}`}
            onClick={() => onAngleModeChange('RAD')}
          >
            RAD
          </button>
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">Theme</label>
        <div className="settings-theme-grid">
          {['dark', 'light', 'lcd'].map((t) => (
            <button
              key={t}
              className={`theme-card ${t} ${theme === t ? 'active' : ''}`}
              onClick={() => onThemeChange(t)}
            >
              <div className="theme-preview" />
              <span className="theme-name">{t.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <button className="btn btn-danger" onClick={onClearHistory}>
          Clear History
        </button>
      </div>
    </div>
  );
}
