import React from "react";
import { Container, Paper, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Deals from "../deals/deals";

const buttonStyle = {
    marginRight: '10px',
    borderRadius: '20px',
    border: '2px solid transparent',
    transition: 'border-color 1.3s ease-in-out',
    '&:hover': {
      borderColor: '#FFD700', // Yellow border on hover
    },
    color: '#FFD700',
    backgroundColor: '#707070'
};

const DealsBoard = () => {

    const navigate = useNavigate();

    const handleBuyClick = (e) => {
        e.preventDefault()
        navigate('/marketplace')
    }

    const handleSellClick = (e) => {
        e.preventDefault()
        navigate('/listingpage')
    }

    return(
        <>
        <Container maxWidth="sm" sx={{display: 'inline-grid', paddingTop: 5, alignItems: 'center'}}>
        <Paper sx={{ bgcolor: '#323232', height: 'relative', borderRadius: '2vh', boxShadow: 600, display: 'inline-grid' }}>
        <Box sx={{ bgcolor: '#4c4c4c', height: '5vh', borderRadius: '2vh', boxShadow: 800, marginTop: 0 }}>
            <div  className="g-6 flex flex-wrap items-center justify-center lg:justify-center" style={{ paddingTop: 10}}>
                <span class="text-transparent text-2xl font-bold bg-clip-text bg-[#e5e5e5]"> 
                Buy & Sell Clean Energy
                </span>
            </div>    
        </Box>
        <Box display="flex" justifyContent="space-evenly" flexDirection='row' marginTop={5} marginBottom={5}>
        <Button
            variant="outlined"
            style={buttonStyle}
            onClick={handleBuyClick}
            
        >
            Buy
        </Button>
        <Button
            variant="outlined"
            style={buttonStyle}
            onClick={handleSellClick}
        >
            Sell
        </Button>
        </Box>
        <Box display="flex" flexDirection="column" alignContent="center" alignItems="center" marginBottom={5}>
            <Deals/>
        </Box>
        </Paper>
        </Container>
        </>
    )
}

export default DealsBoard