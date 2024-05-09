import React, {useState, useEffect} from "react";
import { Box, FormControlLabel, RadioGroup, Radio, Button, Typography } from "@mui/material";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useListingContext } from "../../hooks/useListingContext";

const ManageListings = () => {

    const cardStyle = {
        borderRadius: 10,
        background: 'linear-gradient(to right, #7B68EE, #FFA726)', // Purple to Silver gradient
        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.2)',
        backdropFilter: 'blur(5px)',
        transition: 'background 0.5s ease-in-out',
        '&:hover': {
          background: 'linear-gradient(to right, #7B68EE, #FFA726)', // Silver to Purple on hover
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
          background: '#E53935'
        }
      }
    
      const [selectedDeal, setSelectedDeal] = useState(null);
      const { user } = useAuthContext();
      const { listings, dispatch } = useListingContext();
      const user_id = user.user_id;

// function to set deal value
const handleDealSelection = (event) => {
    event.preventDefault()
    setSelectedDeal(parseInt(event.target.value));
  };

// function to  delete a Deal
      const handleClick = async (e) => {
          e.preventDefault()
          if(!user || selectedDeal === null){
            return
          }

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

// Function to render the listed deals
      
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

    return(
        <>
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
              <Button variant="contained" onClick={handleClick}
                sx={buttonStyle}
              >
                Delete! Deal No.: {selectedDeal} to Delete
              </Button>
            </Box>
          </Box>
        </Box>
        </>
    )
}

export default ManageListings