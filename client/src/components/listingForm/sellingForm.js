import React, { useState, useEffect } from "react";
import { TERipple, TEInput } from "tw-elements-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useListingContext } from "../../hooks/useListingContext";
import { AlertTitle, Alert } from "@mui/material";
import { ethers } from "ethers";
import WTSWPToken from "../../build/contracts/WTSWPToken.json";
import energyAvailability from "../../build/contracts/energyAvailability.json";
import { useMetaMaskContext } from "../../hooks/useMetaMaskContext";
import { get, ref } from 'firebase/database';
import { database } from "../../firebaseConfig";
import { BlockchainLogger } from "../../utils/blockchainLogger";

const formStyle = {
  borderRadius: 15,
  background: 'linear-gradient(to right, #4a236f, #4a236f)',
  boxShadow: '0 4px 16px 0 rgba(0,0,0,0.2)',
  backdropFilter: 'blur(5px)',
  transition: 'background 0.5s ease-in-out',
  '&:hover': {
    background: 'linear-gradient(to right, #4a236f, #7B68EE)',
  },
  width: 500,
  color: 'white',
  borderColor: '#5e5e5e',
  borderWidth: 2,
  padding: 8
};

const inputStyle = {
  backgroundColor: '#4a236f',
  fontColor: '#e5e5e5',
  borderRadius: 3,
  borderColor: '#5e5e5e',
  marginTop: '1vh',
  marginBottom: '2vh'
};

const SellingForm = () => {
  const { dispatch } = useListingContext();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailureAlert, setShowFailureAlert] = useState(false);
  const [amount, setAmount] = useState(null);
  const [rate, setRate] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthContext();
  const { account, DEPLOYED_ADDRESSES, refreshBalance } = useMetaMaskContext();
  const [power, setPower] = useState(0);

  const user_id = user.user_id;
  const tokenAbi = WTSWPToken.abi;
  const energyAbi = energyAvailability.abi;

  // IMPORTANT: Update these with actual deployed contract addresses
  const ENERGY_CONTRACT_ADDRESS = "0xDB34b5f7ED7cE4400A38b4Af1FF357E00Bd48F5C";
  const FEE_ADDRESS = "0x35D9ea2a56C085b601799A645639cB5C45DCcD47";

  // Fetch available power from Firebase
  useEffect(() => {
    const databaseRef = ref(database);
    get(databaseRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const ledData = snapshot.val().LED;
          let powerData = ledData && ledData.power;
          let receivedPower = Math.ceil(powerData);
          if (receivedPower < 0) {
            receivedPower = receivedPower * (-1);
          }
          setPower(receivedPower);
          BlockchainLogger.log('📊 Available power loaded:', { power: receivedPower });
        } else {
          BlockchainLogger.log('⚠️  No power data available');
          setPower(0);
        }
      })
      .catch((error) => {
        BlockchainLogger.logError('fetchPowerFromFirebase', error);
        setPower(0);
      });
  }, []);

  const dbSubmit = async () => {
    try {
      if (!user) {
        throw new Error('You must be logged in!');
      }

      BlockchainLogger.log('📝 Submitting listing to database...');

      const response = await fetch('http://localhost:4000/app/transaction/listing', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          rate,
          walletAddress: account || walletAddress,
          user_id,
          password,
        }),
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to create listing');
      }

      dispatch({ type: 'CREATE_LISTING', payload: json });
      setShowSuccessAlert(true);
      BlockchainLogger.log('✅ Listing created successfully');

      setTimeout(() => setShowSuccessAlert(false), 12000);

      // Reset form
      setAmount(null);
      setRate(null);
      setPassword('');
      setError(null);

      // Refresh balance after successful listing
      refreshBalance();
    } catch (err) {
      BlockchainLogger.logError('dbSubmit', err);
      setError(err.message);
      setShowFailureAlert(true);
      setTimeout(() => setShowFailureAlert(false), 12000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      BlockchainLogger.log('🔄 Processing energy listing...');

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      if (!account) {
        throw new Error('Please connect your MetaMask wallet first');
      }

      // Validate form inputs
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!password) {
        throw new Error('Please enter your password');
      }

      BlockchainLogger.log('📋 Form validation passed:', {
        amount,
        rate,
        account,
        power,
      });

      // Step 1: Check energy availability on blockchain
      BlockchainLogger.log('⚡ Checking energy availability on blockchain...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const energyContract = new ethers.Contract(
        ENERGY_CONTRACT_ADDRESS,
        energyAbi,
        provider
      );

      BlockchainLogger.log('Contract check:', {
        address: ENERGY_CONTRACT_ADDRESS,
        availablePower: power,
        requestedAmount: amount,
      });

      const isEnergyAvailable = await energyContract.isEnergyAvailable(power, amount);

      if (!isEnergyAvailable) {
        throw new Error(`Insufficient energy available. Available: ${power} KWh, Requested: ${amount} KWh`);
      }

      BlockchainLogger.log('✅ Energy availability confirmed');

      // Step 2: Request accounts and get signer
      BlockchainLogger.log('🔑 Getting signer...');

      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      if (signerAddress.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Account mismatch between MetaMask and signer');
      }

      BlockchainLogger.log('✅ Signer verified:', signerAddress);

      // Step 3: Transfer WTSWP tokens as fee
      BlockchainLogger.log('💳 Transferring WTSWP fee...');

      const feeAmount = (0.02 * amount).toString();
      const feeAmountInWei = ethers.parseEther(feeAmount);

      BlockchainLogger.log('Fee details:', {
        percentage: '2%',
        amount: feeAmount,
        wei: feeAmountInWei.toString(),
        to: FEE_ADDRESS,
      });

      const tokenContract = new ethers.Contract(
        DEPLOYED_ADDRESSES.tokenAddress,
        tokenAbi,
        signer
      );

      const transferTx = await tokenContract.transfer(FEE_ADDRESS, feeAmountInWei);
      BlockchainLogger.log('📤 Transfer submitted:', { txHash: transferTx.hash });

      const receipt = await transferTx.wait();

      if (receipt.status !== 1) {
        throw new Error('Token transfer failed');
      }

      BlockchainLogger.log('✅ Token transfer confirmed:', { blockNumber: receipt.blockNumber });

      // Step 4: Submit to database
      await dbSubmit();

    } catch (err) {
      BlockchainLogger.logError('handleSubmit', err);
      setError(err.message || 'An error occurred. Check console for details.');
      setShowFailureAlert(true);
      setTimeout(() => setShowFailureAlert(false), 12000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert
          severity="success"
          style={{ backgroundColor: '#e5e5e5', marginBottom: 15, borderRadius: 15, maxWidth: 500 }}
        >
          <AlertTitle>Success!</AlertTitle>
          Your Deal has been listed successfully!<strong> Check it out on your dashboard</strong>
        </Alert>
      )}

      {/* Failure Alert */}
      {showFailureAlert && (
        <Alert
          severity="error"
          style={{ backgroundColor: '#e5e5e5', marginBottom: 15, borderRadius: 15, maxWidth: 500 }}
        >
          <AlertTitle>Error</AlertTitle>
          {error || 'Check your details and try again'}
        </Alert>
      )}

      <form className="create" style={formStyle} onSubmit={handleSubmit}>
        {/* Amount to Sell */}
        <h2 className="text-base font-medium leading-tight">Amount to Sell (KWh)</h2>
        <TEInput
          type="number"
          step="0.01"
          label="Energy in KWh"
          size="lg"
          style={inputStyle}
          value={amount || ''}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          disabled={isProcessing}
        />

        {/* Available Power Display */}
        {power > 0 && (
          <div style={{ color: '#4ade80', marginBottom: '1vh', fontSize: '0.9rem' }}>
            ✓ Available power: {power} KWh
          </div>
        )}

        {/* Rate per KWh */}
        <h2 className="text-base font-medium leading-tight">Price per KWh (WTSWP)</h2>
        <TEInput
          type="number"
          step="0.01"
          label="Your price per KWh"
          size="lg"
          style={inputStyle}
          value={rate || ''}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          disabled={isProcessing}
        />

        {/* Wallet Address */}
        <h2 className="text-base font-medium leading-tight" style={{ paddingBottom: 5 }}>
          Wallet Address
        </h2>
        <TEInput
          type="text"
          label="Wallet Address"
          size="lg"
          style={inputStyle}
          value={account || walletAddress}
          disabled
        />
        {!account && <div style={{ color: '#ffd700', fontSize: '0.9rem' }}>ⓘ Connect MetaMask to use your address</div>}

        {/* Password */}
        <h2 className="text-base font-medium leading-tight" style={{ paddingBottom: 5 }}>
          Password
        </h2>
        <TEInput
          type="password"
          label="Your Password"
          size="lg"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isProcessing}
        />

        {/* Submit Button */}
        <TERipple rippleColor="light" className="w-full">
          <button
            type="submit"
            disabled={isProcessing || !account}
            style={{
              opacity: isProcessing || !account ? 0.6 : 1,
              cursor: isProcessing || !account ? 'not-allowed' : 'pointer',
            }}
            className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
          >
            {isProcessing ? 'Processing...' : 'List Energy'}
          </button>
        </TERipple>

        {error && (
          <div className="error" style={{ marginTop: '2vh', color: '#ff6b6b' }}>
            ⚠️ {error}
          </div>
        )}
      </form>
    </>
  );
};

export default SellingForm;