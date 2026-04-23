/**
 * SolanaPayComponent.jsx
 * React component for Solana Pay QR code and payment interface
 */

import React, { useState, useContext, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SolanaPaymentContext } from '../../context/SolanaPaymentContext';
import './SolanaPay.css';

const SolanaPayComponent = () => {
  const { publicKey } = useWallet();
  const {
    solanaBalance,
    usdcBalance,
    loading,
    error,
    generateSolanaPayLink,
    sendUSDC
  } = useContext(SolanaPaymentContext);

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [txStatus, setTxStatus] = useState('idle');

  // Generate QR code
  const handleGenerateQR = () => {
    if (!amount) {
      alert('Please enter an amount');
      return;
    }

    try {
      const reference = Math.random().toString(36).substring(7);
      const solanaPayUrl = generateSolanaPayLink(amount, reference);
      setQrCode(solanaPayUrl);
      setShowQR(true);
    } catch (err) {
      alert(`QR generation error: ${err.message}`);
    }
  };

  const handleSendUSDC = async () => {
    if (!amount || !recipient) {
      alert('Please enter amount and recipient');
      return;
    }

    try {
      setTxStatus('sending');
      await sendUSDC(recipient, amount);
      setTxStatus('success');
      setAmount('');
      setRecipient('');
      alert('USDC sent successfully on Solana!');
    } catch (err) {
      setTxStatus('error');
      alert(`Transfer error: ${err.message}`);
    }
  };

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      alert('Solana Pay link copied!');
    }
  };

  if (!publicKey) {
    return (
      <div className="solana-pay-container">
        <div className="solana-header">
          <h2>🚀 Solana Pay</h2>
          <p>Pay for energy using Solana</p>
        </div>
        <div className="solana-card connect-card">
          <h3>Connect Your Wallet</h3>
          <p>Connect your Phantom wallet to use Solana Pay</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return (
    <div className="solana-pay-container">
      <div className="solana-header">
        <h2>🚀 Solana Pay</h2>
        <p>Fast, instant payments on Solana</p>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="solana-card">
        <div className="balance-section">
          <div className="balance-item">
            <h4>SOL Balance</h4>
            {loading ? (
              <p className="loading">Loading...</p>
            ) : (
              <p className="balance-value">{parseFloat(solanaBalance).toFixed(4)}</p>
            )}
          </div>
          <div className="balance-item">
            <h4>USDC Balance</h4>
            {loading ? (
              <p className="loading">Loading...</p>
            ) : (
              <p className="balance-value">{parseFloat(usdcBalance).toFixed(2)}</p>
            )}
          </div>
        </div>

        <div className="wallet-section">
          <h4>Connected Wallet</h4>
          <p className="wallet-address">
            {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </p>
        </div>
      </div>

      {!showQR ? (
        <div className="solana-card payment-form">
          <h3>Generate Payment QR</h3>
          
          <div className="payment-info">
            📱 Generate a QR code for mobile payments or send USDC directly
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (SOL or USDC)</label>
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="recipient">Recipient Address</label>
            <input
              id="recipient"
              type="text"
              placeholder="Recipient Solana address..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="button-group">
            <button
              onClick={handleGenerateQR}
              disabled={loading || !amount}
              className="btn btn-primary"
            >
              📲 Generate QR
            </button>
            <button
              onClick={handleSendUSDC}
              disabled={loading || !amount || !recipient || txStatus === 'sending'}
              className="btn btn-primary"
            >
              {txStatus === 'sending' ? '⏳ Sending...' : '📤 Send USDC'}
            </button>
          </div>

          {txStatus === 'success' && (
            <div className="payment-info" style={{ background: 'rgba(76, 175, 80, 0.1)', borderColor: '#4caf50' }}>
              ✓ Transaction sent successfully!
            </div>
          )}

          {txStatus === 'error' && (
            <div className="error-banner">
              ✗ Transaction failed. Please try again.
            </div>
          )}
        </div>
      ) : (
        <div className="solana-card qr-card">
          <h3>Solana Pay QR Code</h3>
          
          <div className="amount-display">
            Amount: <span className="amount">{amount} SOL</span>
          </div>

          <div className="qr-container">
            <div style={{ 
              width: '300px', 
              height: '300px',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}>
              <p>QR Code would appear here</p>
            </div>
          </div>

          <div className="qr-info">
            <p>📱 Scan this QR code with your Solana wallet to complete the payment</p>
          </div>

          <div className="button-group">
            <button onClick={copyToClipboard} className="btn btn-copy">
              📋 Copy Link
            </button>
            <button onClick={() => setShowQR(false)} className="btn btn-back">
              Back
            </button>
          </div>
        </div>
      )}

      <div className="info-section">
        <h4>✨ Why Solana Pay?</h4>
        <ul>
          <li>Lightning fast: Transactions in ~400ms</li>
          <li>Mobile friendly: QR codes for easy payments</li>
          <li>No intermediaries: Direct wallet-to-wallet</li>
          <li>Low costs: Sub-cent transaction fees</li>
        </ul>
      </div>
    </div>
  );
};

export default SolanaPayComponent;
 * SolanaPayComponent.jsx
 * React component for Solana Pay QR code payments
 */

import React, { useState, useContext, useEffect } from 'react';
import { SolanaPaymentContext } from '../../context/SolanaPaymentContext';
import QRCode from 'qrcode.react';
import './SolanaPay.css';

const SolanaPayComponent = () => {
  const {
    publicKey,
    solanaBalance,
    usdcBalance,
    loading,
    error,
    generateSolanaPayLink,
    wallet
  } = useContext(SolanaPaymentContext);

  const [amount, setAmount] = useState('');
  const [solanaPayUrl, setSolanaPayUrl] = useState(null);
  const [reference, setReference] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const generateQRCode = () => {
    if (!amount) {
      alert('Please enter an amount');
      return;
    }

    try {
      const ref = Math.random().toString(36).substring(2, 15);
      setReference(ref);
      const url = generateSolanaPayLink(amount, ref);
      setSolanaPayUrl(url);
      setShowQR(true);
    } catch (err) {
      alert(`Error generating QR code: ${err.message}`);
    }
  };

  const downloadQR = () => {
    const qrElement = document.getElementById('solana-pay-qr');
    if (qrElement) {
      const url = qrElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `solana-pay-${amount}-usdc.png`;
      link.click();
    }
  };

  const copyLink = () => {
    if (solanaPayUrl) {
      navigator.clipboard.writeText(solanaPayUrl);
      alert('Solana Pay link copied to clipboard');
    }
  };

  const connectWallet = async () => {
    if (wallet) {
      await wallet.adapter.connect();
    }
  };

  return (
    <div className="solana-pay-container">
      <div className="solana-header">
        <h2>⚡ Solana Pay</h2>
        <p>Fast, secure payments on Solana</p>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {!publicKey ? (
        <div className="solana-card connect-card">
          <h3>Connect Your Wallet</h3>
          <p>Connect a Solana wallet to use Solana Pay</p>
          <button onClick={connectWallet} className="btn btn-primary">
            🔗 Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="solana-card">
            <div className="balance-section">
              <div className="balance-item">
                <h4>SOL Balance</h4>
                {loading ? (
                  <p className="loading">Loading...</p>
                ) : (
                  <p className="balance-value">{parseFloat(solanaBalance).toFixed(4)} SOL</p>
                )}
              </div>
              <div className="balance-item">
                <h4>USDC Balance</h4>
                {loading ? (
                  <p className="loading">Loading...</p>
                ) : (
                  <p className="balance-value">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
                )}
              </div>
            </div>

            <div className="wallet-section">
              <h4>Connected Wallet</h4>
              <p className="wallet-address">
                {publicKey ? `${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}` : 'Not connected'}
              </p>
            </div>
          </div>

          {!showQR ? (
            <div className="solana-card payment-form">
              <h3>Create Payment QR Code</h3>

              <div className="form-group">
                <label htmlFor="pay-amount">Amount (USDC)</label>
                <input
                  id="pay-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="form-input"
                />
              </div>

              <p className="payment-info">
                💡 Customers can scan this QR code to send you the payment instantly
              </p>

              <button
                onClick={generateQRCode}
                disabled={loading || !amount}
                className="btn btn-generate"
              >
                📱 Generate QR Code
              </button>
            </div>
          ) : (
            <div className="solana-card qr-card">
              <h3>Payment QR Code</h3>
              <p className="amount-display">
                Amount: <span className="amount">{amount} USDC</span>
              </p>

              <div className="qr-container">
                <QRCode
                  id="solana-pay-qr"
                  value={solanaPayUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  renderAs="canvas"
                />
              </div>

              <div className="button-group">
                <button onClick={downloadQR} className="btn btn-download">
                  ⬇️ Download QR
                </button>
                <button onClick={copyLink} className="btn btn-copy">
                  📋 Copy Link
                </button>
              </div>

              <div className="qr-info">
                <p>Share this QR code with customers or send them the payment link</p>
              </div>

              <button
                onClick={() => {
                  setShowQR(false);
                  setSolanaPayUrl(null);
                  setAmount('');
                }}
                className="btn btn-back"
              >
                ← Back
              </button>
            </div>
          )}

          <div className="info-section">
            <h4>ℹ️ About Solana Pay</h4>
            <ul>
              <li>Instant payments - No network congestion</li>
              <li>Mobile-friendly - Works on any Solana wallet</li>
              <li>Low fees - Fractions of a penny per transaction</li>
              <li>Private - QR codes don't reveal payment details</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default SolanaPayComponent;
