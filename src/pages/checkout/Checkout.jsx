import React, { useState, useEffect } from "react";
import marketplacebg from "../../assets/images/marketplacebg.jpg";
import {TERipple, TEInput } from "tw-elements-react";
import { AlertTitle, Alert } from "@mui/material";
import Web3 from "web3";
import WTSWPToken from "../../build/contracts/WTSWPToken.json";
import { useMetaMaskContext } from "../../hooks/useMetaMaskContext";
import { useMarketPlaceContext } from "../../hooks/useMarketPlaceContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { useInvoiceContext } from "../../hooks/useInvoiceContext";
import { database } from "../../firebaseConfig";
import { ref, get, update } from "firebase/database"; 

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

const Checkout = () => {

    const [error, setError] = useState(null);
    const [successAlert, setSuccessAlert] = useState(false);
    const [failureAlert, setFailureAlert] = useState(false);
    const [listedDeal, setListedDeal] = useState({
      _id: '',
      amount: 0,
      rate: 0, 
      walletAddress: '',
      name: ''
    });
    const [sellerAddress, setSellerAddress] = useState('');
    const [sellerPrice, setSellerPrice] = useState('');
    const WTSWPabi = WTSWPToken.abi;
    const tokenContractAddress = "0x0bE80B8F1BaBA8C93Bb7082445247DA7A507a321";
    const { account } = useMetaMaskContext();
    const { set } = useMarketPlaceContext();
    const { user } = useAuthContext();
    const user_id =  user.user_id;
    const { dispatch } = useInvoiceContext();
    const navigate = useNavigate();
    const [voltage, setVoltage] = useState();
    const [loading, setLoading] = useState(false);


    // !!! Start ESP
const startEsp = async (e) => {
  e.preventDefault();
  try {
    const databaseRef = ref(database);
    await update(ref(database, '/LED'), { checkout: true });
    await update(ref(database, '/LED'), { checkoutPower: listedDeal.amount })
    console.log("Checkout is set to TRUE!! & power Updated");
    setLoading(true)
  } catch (error) {
    console.error("Error setting checkout to true!", error);
  }

}



    // Start Transfer!!!!!
    const startTransfer = async(e) => {
      e.preventDefault();
      const databaseRef = ref(database);
    
      try {
        const snapshot = await get(databaseRef);
        if (snapshot.exists()) {
          const ledData = snapshot.val().LED;
          const voltageData = ledData && ledData.voltage;
          // console.log("Voltagedata is: " + voltageData);
          setVoltage(voltageData);
          return voltageData;
        } else {
          console.log("No Voltage data available");
          return null;
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
    
    // Usage in the component
    const timeFunction = async (e) => {
      try {
        const voltageData = await startTransfer(e);
        if (voltageData !== null) {
          const capacity = listedDeal.amount;
          const response = await fetch(
            `http://localhost:4000/app/api/transfer-time?capacity=${capacity}&voltage=${voltageData}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          const json = await response.json();
          localStorage.setItem("Time", JSON.stringify(json));
          console.log(capacity);
          console.log(voltageData);
          console.log(json);
          let time = JSON.stringify(json);
          console.log("This is: " + time)
        } else {
          console.log("Voltage data is null");
        }
      } catch (error) {
        console.error(error);
      }

    }

    

     // submit button 
    const handleSubmit = async(e) => {
      e.preventDefault()
      const web3 = new Web3(window.ethereum);
      // Contract Integration for Transfer
      const sellerPriceinWei = Web3.utils.toWei(sellerPrice.toString(), 'ether');
      const transferFrom = new web3.eth.Contract(WTSWPabi, tokenContractAddress);
      const result = await transferFrom.methods.transfer(sellerAddress, sellerPriceinWei).send({ from: account });
      if (result.status == true) {
        console.log("Transaction Successfull");
        startEsp(e);
        timeFunction(e);
        DeleteMarketPlace(e);
        CreateInvoice(e);
        navigate("/transferpage")
      }else {
        console.log("Transaction Failed")
        setError("Transaction Cancelled!", result.logs)
      }
    };
    
    //create Invoice
    const CreateInvoice = async(e) => {
      e.preventDefault()
      try{
        const response = await fetch('http://localhost:4000/app/invoice', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer: ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({user_id,
                                amount: listedDeal.amount,
                                rate: listedDeal.rate + 0.02*listedDeal.rate,
                                name: listedDeal.name,
                                walletAddress: listedDeal.walletAddress
          })
        });

        const json = await response.json()

        if(response.ok){
          dispatch({type: 'CREATE_INVOICE', payload: json})
          localStorage.setItem('invoice', JSON.stringify(json))
        }
        if(!response.ok){
          setError(json.error)
        }
      }catch(error){
        console.log(error)
      }
    }
        //update MarketPlace
    const DeleteMarketPlace = async (e) =>{
      e.preventDefault()

      const listingId = listedDeal._id
      const response = await fetch(`http://localhost:4000/app/marketplace/${listingId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json()

      if(response.ok){
        set({type: 'DELETE_MARKETPLACE_LISTING', payload: json})
        setSuccessAlert(true)
        setTimeout(() => {
          setSuccessAlert(false)
        }, 12000);
      }else{
        setFailureAlert(true)
        setTimeout(() => {
          setFailureAlert(false)
        }, 12000);
      }

    }

    
    useEffect(() => {
      const storedDeal = JSON.parse(localStorage.getItem('cart'));
      if (storedDeal && Array.isArray(storedDeal) && storedDeal.length > 0) {
        const { _id, amount, rate, walletAddress, name } = storedDeal[0]; 
        setListedDeal({ _id, amount, rate, walletAddress, name });
        setSellerAddress(listedDeal.walletAddress)
        setSellerPrice(listedDeal.rate + 0.02*(listedDeal.rate))
      }
}, [])
    
    // fetch user cart
    useEffect(() => {
      const storedDeal = JSON.parse(localStorage.getItem('cart'));
    
      if (storedDeal && Array.isArray(storedDeal) && storedDeal.length > 0) {
        const { walletAddress, rate } = storedDeal[0];
        setSellerAddress(walletAddress);
        setSellerPrice(rate + 0.02*rate);
      }
    }, []);


    return(
        <>
        <div className="bg-[#090016] bg-cover bg-center h-full relative items-between justify-between lg:justify-between"
        style={{ backgroundImage: `url(${marketplacebg})`, display: 'flex', flexDirection: 'row', height: '95vh', justifyContent: 'space-evenly'}}>

          <div  style={{display: 'flex', flexDirection: 'column', marginTop: '10vh'}}>

          {/* Success Alert */}
                      {successAlert && (
              <Alert severity="success" style={{backgroundColor: '#e5e5e5', marginBottom: 15, borderRadius: 15, maxWidth: 500}}>
                <AlertTitle>Success!!</AlertTitle>
                Your Transaction has been Completed successfully!<strong>
                  check it out on your profile dashboard</strong>
              </Alert>
              )}

              {/* Failure Alert */}
              {failureAlert && (
                      <Alert severity="error" style={{backgroundColor: '#e5e5e5', marginBottom: 15, borderRadius: 15, maxWidth: 500}}>
                      <AlertTitle>Error</AlertTitle>
                      Check Your Details <strong>ONCE AGAIN!</strong>
                    </Alert>
              )}

          {/* On Successfull Payment */}


            <form className="create" style={formStyle} onSubmit={handleSubmit}> 
             {/* <!-- Amount to Sell --> */}
             <h2 className="text-base font-medium leading-tight">Amount to Buy</h2>
              <TEInput
                type="number"
                step="0.01"
                label="Energy in KWh"
                size="lg"
                style={inputStyle}
                value={listedDeal.amount}
                disabled
              ></TEInput>

                {/* <!-- Price --> */}
             <h2 className="text-base font-medium leading-tight">Price</h2>
              <TEInput
                type="number"
                step="0.01"
                label="Your price per KWh"
                size="lg"
                style={inputStyle}
                value={listedDeal.rate + 0.02*listedDeal.rate}
                disabled
              ></TEInput>
            {/* <!-- Wallet Address --> */}
             <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>Wallet Address</h2>
              <TEInput
                type="text"
                label="Wallet Address"
                size="lg"
                style={inputStyle}
                disabled
                value={listedDeal.walletAddress}
              ></TEInput>

            {/* <!-- User Name --> */}
             <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>User Name</h2>
              <TEInput
                type="text"
                label="User Name"
                size="lg"
                style={inputStyle}
                disabled
                value={listedDeal.name}
              ></TEInput>


              {/* <!-- Submit button --> */}

              <TERipple rippleColor="light" className="w-full">
                <button
                  type="submit"
                  className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                >
                  Pay
                </button>
              </TERipple>

              {error && <div className='error' style={{marginTop: '2vh'}}>{error}</div>}
            </form>
          </div>

        </div>
        </>
    )
}

export default Checkout