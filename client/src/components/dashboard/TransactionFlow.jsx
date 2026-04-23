import React from 'react';
import './TransactionFlow.css';

const TransactionFlow = ({ transaction }) => {
  const stages = [
    { id: 1, name: 'Request', status: transaction.status !== 'idle' ? 'completed' : 'pending' },
    { id: 2, name: 'Validated', status: transaction.status !== 'idle' ? 'completed' : 'pending' },
    { id: 3, name: 'Activated', status: transaction.status === 'active' || transaction.status === 'completed' ? 'active' : 'pending' },
    { id: 4, name: 'Settled', status: transaction.status === 'completed' ? 'completed' : 'pending' },
    { id: 5, name: 'Completed', status: transaction.status === 'completed' ? 'completed' : 'pending' }
  ];

  const energyPercent = transaction.energyRequested > 0 
    ? Math.round((transaction.energyDelivered / transaction.energyRequested) * 100)
    : 0;

  return (
    <div className="transaction-flow">
      <h3 className="transaction-title">Transaction Flow</h3>
      
      {transaction.orderId ? (
        <>
          <div className="transaction-order-id">Order: {transaction.orderId}</div>
          
          <div className="transaction-stages">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <div className={`stage ${stage.status}`}>
                  <div className="stage-number">{stage.id}</div>
                  <div className="stage-name">{stage.name}</div>
                </div>
                {index < stages.length - 1 && <div className="stage-connector" />}
              </React.Fragment>
            ))}
          </div>

          <div className="transaction-progress">
            <div className="progress-label">
              Energy Delivered
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <div className="progress-stats">
              <span>{transaction.energyDelivered.toFixed(2)} kWh</span>
              <span>/</span>
              <span>{transaction.energyRequested.toFixed(2)} kWh</span>
              <span>({energyPercent}%)</span>
            </div>
          </div>

          <div className="transaction-status">
            <span className={`status-badge ${transaction.status}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
            {transaction.completionTime && (
              <span className="completion-time">
                Completed: {new Date(transaction.completionTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="no-transaction">
          No active transaction
        </div>
      )}
    </div>
  );
};

export default TransactionFlow;
