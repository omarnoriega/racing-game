import { useState } from 'react';
import { GAME_PRESETS } from '../../constants/gameConstants';
import './GameConfigModal.css';

function GameConfigModal({ onConfirm, onCancel }) {
  const [selectedPreset, setSelectedPreset] = useState('NORMAL');
  const [customConfig, setCustomConfig] = useState({
    TRACK_LENGTH: 1000,
    TAP_POWER: 1,
    TAP_COOLDOWN_MS: 100,
    GAME_DURATION_MS: null,
  });

  const isCustom = selectedPreset === 'CUSTOM';

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (preset !== 'CUSTOM') {
      setCustomConfig(GAME_PRESETS[preset]);
    }
  };

  const handleCustomChange = (field, value) => {
    setCustomConfig(prev => ({
      ...prev,
      [field]: value === '' ? null : Number(value),
    }));
  };

  const validateConfig = (config) => {
  const errors = [];
  
  if (!config.TRACK_LENGTH || config.TRACK_LENGTH < 100) {
    errors.push('La longitud mínima del circuito es 100m');
  }
  
  if (!config.TAP_POWER || config.TAP_POWER < 1) {
    errors.push('La potencia mínima por tap es 1m');
  }
  
  if (!config.TAP_COOLDOWN_MS || config.TAP_COOLDOWN_MS < 50) {
    errors.push('El cooldown mínimo es 50ms');
  }
  
  if (config.GAME_DURATION_MS && config.GAME_DURATION_MS < 30000) {
    errors.push('La duración mínima es 30 segundos');
  }
  
  return errors;
};

const handleConfirm = () => {
  const config = isCustom ? customConfig : GAME_PRESETS[selectedPreset];
  
  const errors = validateConfig(config);
  
  if (errors.length > 0) {
    alert('Errores de validación:\n' + errors.join('\n'));
    return;
  }
  
  onConfirm(config);
};

  const currentConfig = isCustom ? customConfig : GAME_PRESETS[selectedPreset];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>⚙️ Configuración de la Partida</h2>

        <div className="preset-selector">
          <h3>Selecciona un Preset</h3>
          <div className="preset-buttons">
            {Object.keys(GAME_PRESETS).map((preset) => (
              <button
                key={preset}
                className={`preset-btn ${selectedPreset === preset ? 'active' : ''}`}
                onClick={() => handlePresetChange(preset)}
              >
                {GAME_PRESETS[preset].name}
              </button>
            ))}
          </div>
        </div>

        <div className="config-preview">
          <h3>Configuración Actual</h3>
          
          {isCustom ? (
            <div className="custom-inputs">
              <div className="input-field">
                <label>
                  🏁 Longitud del Circuito (metros)
                  <input
                    type="number"
                    value={customConfig.TRACK_LENGTH || ''}
                    onChange={(e) => handleCustomChange('TRACK_LENGTH', e.target.value)}
                    min="100"
                    max="10000"
                    step="100"
                  />
                </label>
              </div>

              <div className="input-field">
                <label>
                  ⚡ Potencia por Tap (metros)
                  <input
                    type="number"
                    value={customConfig.TAP_POWER || ''}
                    onChange={(e) => handleCustomChange('TAP_POWER', e.target.value)}
                    min="1"
                    max="10"
                  />
                </label>
              </div>

              <div className="input-field">
                <label>
                  ⏱️ Cooldown entre Taps (ms)
                  <input
                    type="number"
                    value={customConfig.TAP_COOLDOWN_MS || ''}
                    onChange={(e) => handleCustomChange('TAP_COOLDOWN_MS', e.target.value)}
                    min="50"
                    max="1000"
                    step="10"
                  />
                </label>
              </div>

              <div className="input-field">
                <label>
                  ⏳ Duración Máxima (segundos)
                  <input
                    type="number"
                    value={customConfig.GAME_DURATION_MS ? customConfig.GAME_DURATION_MS / 1000 : ''}
                    onChange={(e) => handleCustomChange('GAME_DURATION_MS', e.target.value ? e.target.value * 1000 : null)}
                    min="30"
                    max="600"
                    placeholder="Sin límite"
                  />
                  <small>Dejar vacío para sin límite de tiempo</small>
                </label>
              </div>
            </div>
          ) : (
            <div className="config-display">
              <div className="config-item">
                <span className="icon">🏁</span>
                <span className="label">Circuito:</span>
                <span className="value">{currentConfig.TRACK_LENGTH}m</span>
              </div>
              <div className="config-item">
                <span className="icon">⚡</span>
                <span className="label">Potencia:</span>
                <span className="value">{currentConfig.TAP_POWER}m por tap</span>
              </div>
              <div className="config-item">
                <span className="icon">⏱️</span>
                <span className="label">Cooldown:</span>
                <span className="value">{currentConfig.TAP_COOLDOWN_MS}ms</span>
              </div>
              <div className="config-item">
                <span className="icon">⏳</span>
                <span className="label">Duración:</span>
                <span className="value">
                  {currentConfig.GAME_DURATION_MS 
                    ? `${currentConfig.GAME_DURATION_MS / 1000}s` 
                    : 'Sin límite'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="btn-confirm">
            Crear Partida
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameConfigModal;