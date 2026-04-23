import React, { useEffect } from 'react';
import { useHardwareStatus } from '../../hooks/useHardwareStatus';
import HardwareMeters from '../../components/dashboard/HardwareMeters';
import RelayIndicator from '../../components/dashboard/RelayIndicator';
import TransactionFlow from '../../components/dashboard/TransactionFlow';
import EventFeed from '../../components/dashboard/EventFeed';
import SystemStatus from '../../components/dashboard/SystemStatus';
import './Dashboard.css';

const Dashboard = () => {
  const { state } = useHardwareStatus();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Hardware Status Dashboard</h1>
        <div className="dashboard-mode-badge">
          {state.systemMode}
        </div>
      </div>

      <div className="dashboard-content">
        {/* Top row: Relay Indicator */}
        <RelayIndicator 
          relayState={state.relay.state}
          timeElapsed={state.relay.timeElapsed}
          timeRemaining={state.relay.timeRemaining}
          power={state.output.power}
        />

        {/* Hardware Metrics */}
        <div className="dashboard-section">
          <h2 className="section-title">Live Hardware Metrics</h2>
          <HardwareMeters 
            battery={state.battery}
            output={state.output}
          />
        </div>

        {/* Transaction & Events Row */}
        <div className="dashboard-row">
          <div className="dashboard-column">
            <div className="dashboard-section">
              <TransactionFlow transaction={state.transaction} />
            </div>
          </div>
          
          <div className="dashboard-column">
            <div className="dashboard-section">
              <EventFeed events={state.events} />
            </div>
          </div>
        </div>

        {/* System Health Footer */}
        <SystemStatus 
          systemHealth={state.systemHealth}
          lastUpdated={state.lastUpdated}
        />
      </div>
    </div>
  );
};

export default Dashboard;
