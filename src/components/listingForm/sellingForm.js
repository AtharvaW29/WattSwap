import React, {useState, useEffect} from "react";
import {TERipple, TEInput } from "tw-elements-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useListingContext } from "../../hooks/useListingContext";
import { AlertTitle, Alert } from "@mui/material";
import web3 from "../../getweb3";
import Web3 from "web3";
import WTSWPToken from "../../build/contracts/WTSWPToken.json";
import energyAvaibility from "../../build/contracts/energyAvailability.json";
import { useMetaMaskContext } from "../../hooks/useMetaMaskContext";
import { get, ref } from 'firebase/database';
import { database } from "../../firebaseConfig";


const formStyle = {
    borderRadius: 15,
    background: 'linear-gradient(to right, #4a236f, #4a236f)', // Purple to Orange-400 gradient
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.2)',
    backdropFilter: 'blur(5px)',
    transition: 'background 0.5s ease-in-out',
    '&:hover': {
      background: 'linear-gradient(to right, #4a236f, #7B68EE)', // Orange-400 to Purple on hover
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
}
const ListingForm = () => {

    const { dispatch } = useListingContext();
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showFailureAlert, setShowFailureAlert] = useState(false);

    const [amount, setAmount] = useState(null);
    const [rate, setRate] = useState(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { user } = useAuthContext();
    const user_id = user.user_id;
    const WTSWPabi = WTSWPToken.abi;
    const energyabi = energyAvaibility.abi;
    const { account } = useMetaMaskContext();
    const [power, setPower] = useState();

    const dbSubmit = async (e) => {
      e.preventDefault()
      if(!user){
        setError('You must be logged in!')
      }

   // console.log(amount, rate, accountId, walletAddress, user_id, password)
    const response = await fetch ('http://localhost:4000/app/transaction/listing', {
        method: 'POST',
        body: JSON.stringify({amount, rate, walletAddress, user_id, password}),
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
    })
    const json = await response.json()

    if(!response.ok){
      setError(json.error)
      setShowFailureAlert(true)
      setTimeout(() => {
        setShowFailureAlert(false)
      }, 12000);
    }
    if(response.ok){
      dispatch({type: 'CREATE_LISTING', payload: json});
      setShowSuccessAlert(true)
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 12000);
      setAmount(0);
      setRate(0);
      setWalletAddress('');
      setPassword('')
    }
  }


  // Here!!!!!
  const contractAddress = "0xdf25d603B8B31Fb3DB3bc406BABD3dfE8Df24225";
  const contractInstance = new web3.eth.Contract(energyabi, contractAddress);
  const transferHelperAddress = "0x5bEe1e1278F037cF142b193EccF1d15f5bEf5396";
  
  const tokenContractAddress = "0x0bE80B8F1BaBA8C93Bb7082445247DA7A507a321";
  const feeAddress = "0x7d19fdeE0AeB3e048e8358D61e8fEe85bb7A9F62";
  // Example order amount
 
 // Call the contract's validation function, passing availablePower as an argument
 const handleSubmit = async (e) => {
      
  e.preventDefault()
  
  const web3 = new Web3(window.ethereum);
      try {
        const result = await contractInstance.methods.isEnergyAvailable(power, amount).call();
        if (result) {
            
            // const web3 = new web3(window.ethereum);
            try {
                // Request account access
            await
            
            window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                console.error("User denied account access");
                // Handle user denial gracefully
            }
            const userAddress = await web3.eth.getAccounts().then(accounts => accounts[0]);
            const feeAmount = 0.02*amount
            const decimals = 18
            const feeAmountInWei = Web3.utils.toWei(feeAmount.toString(), 'ether');
            const transferFrom = new web3.eth.Contract(WTSWPabi, tokenContractAddress);
            await transferFrom.methods.transfer(feeAddress, feeAmountInWei).send({ from: userAddress });


            
            // fee deduction
            dbSubmit(e);
            
            } else {
                Alert("Insufficient Energy!")
            }
        } catch (error) {
            console.error("Error calling contract:", error);
        }
       }
  useEffect(() => {
    const databaseRef = ref(database);
    get(databaseRef).then((snapshot) => {
      if (snapshot.exists()) {
        const ledData = snapshot.val().LED;
        let powerData = ledData && ledData.power;
          let receivedPower = Math.ceil(powerData);
          if (receivedPower < 0){
            receivedPower = receivedPower * (-1)
          }
          setPower(receivedPower);
      } else {
        console.log('No Power Data Available');
      }
    }).catch((error) => {
      console.error(error);
    });
  }, []);


    return(
        <>
        {/* Success Alert */}
        {showSuccessAlert && (


        <Alert severity="success" style={{backgroundColor: '#e5e5e5', marginBottom: 15, borderRadius: 15, maxWidth: 500}}>
          <AlertTitle>Success!!</AlertTitle>
          Your Deal has been listed successfully!<strong>
            check it out on your dashboard</strong>
        </Alert>
        )}

        {/* Failure Alert */}
        {showFailureAlert && (
                <Alert severity="error" style={{backgroundColor: '#e5e5e5', marginBottom: 15, borderRadius: 15, maxWidth: 500}}>
                <AlertTitle>Error</AlertTitle>
                Check Your Details <strong>ONCE AGAIN!</strong>
              </Alert>
        )}


        <form className="create" style={formStyle} onSubmit={handleSubmit}> 
             {/* <!-- Amount to Sell --> */}
             <h2 className="text-base font-medium leading-tight">Amount to Sell</h2>
              <TEInput
                type="number"
                step="0.01"
                label="Energy in KWh"
                size="lg"
                style={inputStyle}
                value={amount}
                onChange={(e)=>setAmount(e.target.value)}
              ></TEInput>

                {/* <!-- Rate per mAH --> */}
             <h2 className="text-base font-medium leading-tight">WTSWP</h2>
              <TEInput
                type="number"
                step="0.01"
                label="Your price per KWh"
                size="lg"
                style={inputStyle}
                value={rate}
                onChange={(e)=>setRate(amount * 1)}
              ></TEInput>

            {/* <!-- Wallet Address --> */}
             <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>Wallet Address</h2>
              <TEInput
                type="text"
                label="Wallet Address"
                size="lg"
                style={inputStyle}
                value={walletAddress}
                onChange={(e)=>setWalletAddress(account)}
              ></TEInput>

            {/* <!-- Password --> */}
             <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>Password</h2>
              <TEInput
                type="password"
                label="Your Password"
                size="lg"
                style={inputStyle}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              ></TEInput>


              {/* <!-- Submit button --> */}

              <TERipple rippleColor="light" className="w-full">
                <button
                  type="submit"
                  className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                >
                  List
                </button>
              </TERipple>

              {error && <div className='error' style={{marginTop: '2vh'}}>{error}</div>}
            </form>
        </>
    )
}

export default ListingForm