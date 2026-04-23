import React from 'react';
import './RelayIndicator.css';

const RelayIndicator = ({ relayState, timeElapsed, timeRemaining, power }) => {
  const isOn = relayState === 'ON' || power > 100;
  const durationMins = Math.round(timeElapsed / 60);

  return (
    <div className={`relay-indicator ${isOn ? 'relay-on' : 'relay-off'}`}>
      <div className="relay-header">
        <h3>Relay Status</h3>
        <div className={`relay-badge ${isOn ? 'on' : 'off'}`}>
          {isOn ? '🟢 ON' : '🔴 OFF'}
        </div>
      </div>

      {isOn && (
        <div className="relay-active">
          <div className="relay-pulse"></div>
          <div className="relay-timer">
            <span className="relay-time">{durationMins}m</span>
            <span className="relay-label">Elapsed</span>
          </div>
          {timeRemaining > 0 && (
            <div className="relay-remaining">
              {Math.round(timeRemaining / 60)}m remaining
            </div>
          )}
        </div>
      )}

      <div className="relay-info">
        <div className="relay-state-text">
          {isOn 
            ? 'Power delivery in progress' 
            : 'No active power delivery'}
        </div>
        {isOn && (
          <div className="relay-power">
            {Math.round(power || 0)}W active
          </div>
        )}
      </div>
    </div>
  );
};

export default RelayIndicator;
