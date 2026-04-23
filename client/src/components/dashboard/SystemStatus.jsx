import React from 'react';
import './SystemStatus.css';

const SystemStatus = ({ systemHealth, lastUpdated }) => {
  const getStatusIcon = (connected) => {
    return connected ? '🟢' : '🔴';
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <div className="system-status">
      <h3 className="status-title">System Health</h3>
      
      <div className="status-grid">
        <div className={`status-card ${systemHealth.simulatorConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-icon">{getStatusIcon(systemHealth.simulatorConnected)}</div>
          <div className="status-info">
            <div className="status-label">Simulator</div>
            <div className="status-text">{systemHealth.simulatorConnected ? 'Connected' : 'Offline'}</div>
          </div>
        </div>

        <div className={`status-card ${systemHealth.serverConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-icon">{getStatusIcon(systemHealth.serverConnected)}</div>
          <div className="status-info">
            <div className="status-label">Backend</div>
            <div className="status-text">{systemHealth.serverConnected ? 'Running' : 'Down'}</div>
          </div>
        </div>

        <div className={`status-card ${systemHealth.databaseSync ? 'connected' : 'disconnected'}`}>
          <div className="status-icon">{getStatusIcon(systemHealth.databaseSync)}</div>
          <div className="status-info">
            <div className="status-label">Database</div>
            <div className="status-text">{systemHealth.databaseSync ? 'Synced' : 'Offline'}</div>
          </div>
        </div>

        <div className={`status-card ${systemHealth.blockchainSync ? 'connected' : 'disconnected'}`}>
          <div className="status-icon">{getStatusIcon(systemHealth.blockchainSync)}</div>
          <div className="status-info">
            <div className="status-label">Blockchain</div>
            <div className="status-text">{systemHealth.blockchainSync ? 'Synced' : 'Offline'}</div>
          </div>
        </div>
      </div>

      <div className="status-footer">
        <span className="last-update">Last update: {formatLastUpdated(lastUpdated)}</span>
      </div>
    </div>
  );
};

export default SystemStatus;
