/**
 * USDCPaymentComponent.jsx
 * React component for USDC payment interface
 */

import React, { useState, useContext, useEffect } from 'react';
import { USDCPaymentContext } from '../../context/USDCPaymentContext';
import './USDCPayment.css';

const USDCPaymentComponent = () => {
  const {
    usdcBalance,
    loading,
    error,
    userAddress,
    fetchUSDCBalance,
    approveUSDC,
    transferUSDC,
    switchToAvalanche
  } = useContext(USDCPaymentContext);

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState('idle');

  // Fetch balance on component mount
  useEffect(() => {
    fetchUSDCBalance();
    const interval = setInterval(fetchUSDCBalance, 5000);
    return () => clearInterval(interval);
  }, [fetchUSDCBalance]);

  const handleApprove = async () => {
    if (!amount || !recipient) {
      alert('Please enter amount and recipient');
      return;
    }

    try {
      setTransactionStatus('approving');
      await approveUSDC(recipient, amount);
      setTransactionStatus('approved');
      alert('USDC approval successful');
    } catch (err) {
      setTransactionStatus('error');
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleTransfer = async () => {
    if (!amount || !recipient) {
      alert('Please enter amount and recipient');
      return;
    }

    try {
      setTransactionStatus('transferring');
      const receipt = await transferUSDC(recipient, amount);
      setTxHash(receipt.transactionHash);
      setTransactionStatus('success');
      setAmount('');
      setRecipient('');
      alert('USDC transfer successful');
    } catch (err) {
      setTransactionStatus('error');
      alert(`Transfer failed: ${err.message}`);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToAvalanche();
      alert('Switched to Avalanche network');
    } catch (err) {
      alert(`Network switch failed: ${err.message}`);
    }
  };

  return (
    <div className="usdc-payment-container">
      <div className="usdc-header">
        <h2>💳 USDC Payment Portal</h2>
        <p>Pay for energy using USDC on Avalanche</p>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="usdc-card">
        <div className="balance-section">
          <h3>Your USDC Balance</h3>
          <div className="balance-display">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <span className="balance-amount">{parseFloat(usdcBalance).toFixed(2)}</span>
                <span className="balance-currency">USDC</span>
              </>
            )}
          </div>
          <button 
            onClick={fetchUSDCBalance}
            disabled={loading}
            className="refresh-btn"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="network-section">
          <h4>Network</h4>
          <p>Avalanche C-Chain</p>
          <button onClick={handleSwitchNetwork} className="network-btn">
            Switch Network
          </button>
        </div>

        <div className="address-section">
          <h4>Connected Wallet</h4>
          <p className="address-text">
            {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Not connected'}
          </p>
        </div>
      </div>

      <div className="usdc-card payment-form">
        <h3>Send USDC</h3>

        <div className="form-group">
          <label htmlFor="recipient">Recipient Address</label>
          <input
            id="recipient"
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (USDC)</label>
          <input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            max={parseFloat(usdcBalance)}
            className="form-input"
          />
          <span className="max-amount" onClick={() => setAmount(usdcBalance)}>
            Max: {parseFloat(usdcBalance).toFixed(2)}
          </span>
        </div>

        <div className="button-group">
          <button
            onClick={handleApprove}
            disabled={loading || !amount || !recipient}
            className="btn btn-approve"
          >
            {transactionStatus === 'approving' ? '⏳ Approving...' : '✓ Approve'}
          </button>
          <button
            onClick={handleTransfer}
            disabled={loading || !amount || !recipient || transactionStatus !== 'approved'}
            className="btn btn-transfer"
          >
            {transactionStatus === 'transferring' ? '⏳ Transferring...' : '📤 Send'}
          </button>
        </div>

        {transactionStatus === 'success' && txHash && (
          <div className="success-message">
            ✓ Transfer successful!
            <a 
              href={`https://snowtrace.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              View on Snowtrace
            </a>
          </div>
        )}

        {transactionStatus === 'error' && (
          <div className="error-message">
            ✗ Transaction failed. Please try again.
          </div>
        )}
      </div>

      <div className="info-section">
        <h4>ℹ️ About USDC Payments</h4>
        <ul>
          <li>Fast: Transactions confirmed in seconds</li>
          <li>Safe: Stablecoin backed by real USD reserves</li>
          <li>Low Fees: Avalanche's $0.01 gas fees</li>
          <li>Global: Available on multiple chains</li>
        </ul>
      </div>
    </div>
  );
};

export default USDCPaymentComponent;
