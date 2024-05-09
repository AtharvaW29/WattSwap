import React from 'react'
import { Card, CardMedia, CardContent, Typography, CardActions, IconButton } from "@mui/material";
import marketplacebg from "../../assets/images/marketplacebg.jpg";
import { useCartContext } from "../../hooks/useCart";
import { useNavigate } from 'react-router-dom';
import {TERipple } from "tw-elements-react";
import { useProfileContext } from '../../hooks/useProfileContext';


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
    alignItems: "center"
  };

const MarketPlaceListing = ({MarketPlaceListing}) => {

    const { dispatch } = useCartContext();
    const navigate = useNavigate();
    const { userprofile } = useProfileContext();

    const handleAddToCart = () => {
        const existingCart = [] || JSON.parse(localStorage.getItem('cart'));
        const updatedCart = [...existingCart, MarketPlaceListing];
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        dispatch({type: 'CART_ADD_ITEM', payload: MarketPlaceListing});
        navigate('/checkout')
    }
    return(
        <>
    <Card sx={cardStyle}>
        <CardMedia
                 component="img"
                 height="50"
                 image={`http://localhost:4000/${userprofile.image}`}
                 alt="Profile Picture"
                title={MarketPlaceListing.amount}/>
    <CardContent sx={{alignContent: "center"}}>
        <div>
            <Typography variant='h5' gutterBottom align='center' fontFamily='Poppins' fontWeight={600} color='#b7d3ed'>
            Power: {MarketPlaceListing.amount} mAH
            </Typography>
            <Typography variant='h5' gutterBottom align='center' fontFamily='Poppins' fontWeight={600} color='#b7d3ed'>
            Rate: {MarketPlaceListing.rate} WTSWP
            </Typography>
            <Typography variant='h5' gutterBottom align='center' fontFamily='Poppins' fontWeight={600} color='#b7d3ed'>
            Sold By: {MarketPlaceListing.name}
            </Typography>
            <Typography variant='h5' gutterBottom align='center' fontFamily='Poppins' fontWeight={600} color='#b7d3ed'>
            Wallet Address:
            </Typography>
            <Typography variant='body1' fontSize={12} gutterBottom align='center' fontFamily='Poppins' fontWeight={600} color='#090016'>
            {MarketPlaceListing.walletAddress}
            </Typography>

        </div>
    </CardContent>
    <CardActions disableSpacing>
    <div style={{alignSelf: 'center', marginLeft: '9vh'}}>
    <TERipple rippleColor="light" className="w-full">
            <button 
                onClick={handleAddToCart}
                className='cursor-pointer font-medium bg-green-600 px-4 py-'
                style={{borderRadius: 15}}>
                <Typography variant='h6' gutterBottom align='center' fontFamily='Poppins' fontWeight={600} color='#b7d3ed'>
                Checkout
                </Typography>
            </button>
        </TERipple>
    </div>
    </CardActions>
    </Card>
</>
    )
}

export default MarketPlaceListing