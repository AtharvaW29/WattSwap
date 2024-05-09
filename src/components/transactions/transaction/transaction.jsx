import React from "react";
import { Box, Typography } from "@mui/material";

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
    marginBottom: '3vh'
  };

  const addressStyle = {
    display: 'none',
    position: 'absolute',
    backgroundColor: '#7B68EE',
    padding: '5px',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    marginLeft: '1vh'
  };

const Transaction = ({invoice}) => {

  const handleHover = (e) => {
    e.currentTarget.lastChild.style.display = 'block';
  };

  const handleLeave = (e) => {
    e.currentTarget.lastChild.style.display = 'none';
  };

    return(
        <>
        <Box key={invoice.id} display="flex" alignItems="center" mb={2} flexDirection='row'
                  onMouseEnter={handleHover}
                  onMouseLeave={handleLeave}
                  sx={cardStyle}>
                  <Typography style={{marginLeft: '3vh'}}>
                  Amount: {`${invoice.amount}mAH`}
                  </Typography>
                  <Typography >
                  Price: {`${invoice.price} WTSWP`}
                  </Typography>
                  <Typography >
                  SellerName:  {`${invoice.name}`}
                  </Typography>
                  <Typography >
                  {`${invoice.updatedAt}`}
                  </Typography>
                  {/* Wallet address displayed on hover */}
                  <Typography style={addressStyle}>
                    Wallet Address: {`${invoice.walletAddress}`}
                  </Typography>
              </Box>
        </>
    )
}
export default Transaction