import React, { useEffect, useState } from "react";
import { Box, FormControlLabel, RadioGroup, Radio, Button, Typography } from "@mui/material";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useListingContext } from "../../hooks/useListingContext";
import { useMarketPlaceContext } from "../../hooks/useMarketPlaceContext";
import { AlertTitle, Alert } from "@mui/material";

const Deals = () => {

    const [selectedDeal, setSelectedDeal] = useState(null);
    const { user } = useAuthContext();
    const { listings, dispatch } = useListingContext();
    const { set } = useMarketPlaceContext();
    const user_id = user.user_id;
    const name = user.name;
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showFailureAlert, setShowFailureAlert] = useState(false);
    const [error, setError] = useState(null);


// function to clear a listed deal
  const ClearListing = async (e) => {
      e.preventDefault()

      const selectedListing = listings[selectedDeal - 1]
      
      const response = await fetch(`http://localhost:4000/app/transaction/deals/${selectedListing._id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json()

      if(response.ok){
        dispatch({type: 'DELETE_LISTING', payload: json})
      }
  };

// Function to add a Listing on MarketPlace
    const handleProceed = async (e) => {
        e.preventDefault()
            if(!selectedDeal && selectedDeal === null){
                setShowFailureAlert(true)
            }
            const selectedListing = listings[selectedDeal - 1];
            try{
              const response = await fetch('http://localhost:4000/app/marketplace', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer: ${user.token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({user_id,
                                      amount: selectedListing.amount,
                                      rate: selectedListing.rate,
                                      walletAddress: selectedListing.walletAddress,
                                      name
                                    })
              });

              const json = await response.json()

              if(response.ok){
                set({type: 'CREATE_MARKETPLACE_LISTING', payload: json})
                ClearListing(e)
                setShowSuccessAlert(true)
                setTimeout(() => {
                  setShowSuccessAlert(false);
                }, 12000);
              }
              if(!response.ok){
                setError(json.error)
                setShowFailureAlert(true)
                setTimeout(() => {
                  setShowFailureAlert(false)
                }, 12000);
              }
            }
            catch(error){
                console.log(error)
            }
    };

// Function to select a Deal
    const handleDealSelection = (event) => {
        setSelectedDeal(parseInt(event.target.value));
      };


//Function to fetch Listed Deals
    useEffect(() => {
      const fetchUserDeals = async () => {
        const response = await fetch(`http://localhost:4000/app/transaction/deals/${user_id}`, {
          method: 'GET',
          headers: {'Authorization': `Bearer ${user.token}`}
        })
        const json = await response.json()

        if(response.ok){
          dispatch({type: 'SET_LISTINGS', payload: json})
        }
      }
      if(user){
        fetchUserDeals()
      }
    }, [dispatch, user])



//Styles
    const cardStyle = {
      borderRadius: 10,
      background: 'linear-gradient(to right, #7B68EE, #7209b7)',
      boxShadow: '0 4px 16px 0 rgba(0,0,0,0.2)',
      backdropFilter: 'blur(5px)',
      transition: 'background 0.5s ease-in-out',
      '&:hover': {
        background: 'linear-gradient(to right, #7209b7, #7B68EE)',
      },
      fontWeight: 600,
      fontSize: 18,
      color: '#e5e5e5',
    };
    const buttonStyle = {
      borderRadius: 10,
      backgroundColor: '#4c4c4c',
      fontWeight: 600,
      fontSize: 16,
      color: '#e5e5e5',
      transition: 'background 0.5s ease-in-out',
      '&:hover': {
        background: '#FFA726'
      }
    }
    
    return(
        <>
            {/* Success Alert */}
            {showSuccessAlert && (
            <Alert severity="success" style={{backgroundColor: '#e5e5e5', marginBottom: 15, borderRadius: 15, maxWidth: 500}}>
              <AlertTitle>Success!!</AlertTitle>
              Your Deal has been listed on MarketPlace successfully!<strong>
                check it out on the MarketPlace</strong>
            </Alert>
            )}

            {/* Failure Alert */}
            {showFailureAlert && (
                    <Alert severity="error" style={{backgroundColor: '#e5e5e5', marginBottom: 15, borderRadius: 15, maxWidth: 500}}>
                    <AlertTitle>Error</AlertTitle>
                    Check Your Details <strong>ONCE AGAIN!</strong>
                  </Alert>
            )}


        
    <Box><span><Typography variant="h4" color="#e5e5e5" fontWeight={600}>My Listed Deals: </Typography></span>
          <Box p={2} sx={{stroke: '#FFD700', strokeWidth: 2}}>
            {listings && listings.map((listing) => (
              <Box key={listing._id} display="flex" alignItems="center" mb={2} flexDirection='row'
                  sx={cardStyle}
              >
                <RadioGroup
                  value={selectedDeal}
                  onChange={handleDealSelection}
                  sx={{marginLeft: '3vh'}}
                >
                  <FormControlLabel
                    value={listings.indexOf(listing) + 1}
                    control={<Radio />}
                    label={`${listing.amount} mAH  at   ${listing.rate} WTSWP`}
                  />
                </RadioGroup>
              </Box>
            ))}
            <Box mt={4} textAlign="center">
              <Button variant="contained" onClick={handleProceed}
                sx={buttonStyle}
              >
                ADD! Deal No.: {selectedDeal} to MarketPlace
              </Button>
            </Box>
          </Box>
    </Box>
    {error && <div className='error' style={{marginTop: '2vh', color: '#e5e5e5'}}>No Duplicate Deals!</div>}
    </>
    );
};
export default Deals