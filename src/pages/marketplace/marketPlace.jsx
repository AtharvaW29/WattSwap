import React, { useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import primarybg from '../../assets/images/primarybg.png';
import MarketPlaceListing from "./marketPlaceListing";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useMarketPlaceContext } from "../../hooks/useMarketPlaceContext";

const MarketPlace = () => {

    const { user } = useAuthContext();
    const { marketPlaceListings, set } = useMarketPlaceContext();

    useEffect(() => {
        const fetchMarketPlaceListings = async () => {
            const response = await fetch('http://localhost:4000/app/marketplace', {
                method: 'GET',
                headers: {'Authorization': `Bearer ${user.token}`}
            })
            const json = await response.json()

            if(response.ok){
                set({type: 'SET_MARKETPLACE_LISTING', payload: json})
            }
        }
        if(user){
            fetchMarketPlaceListings()
        }
    }, [set, user])

    return(
        <>
    <div className="bg-[#090016] bg-cover bg-center h-full relative items-between justify-between lg:justify-between"
        style={{ backgroundImage: `url(${primarybg})`, display: 'flex', flexDirection: 'column'}}>
            <Typography variant="h1" fontWeight={600} fontSize={36} color='#e5e5e5' align="center">Welcome to MarketPlace!</Typography>
        <Grid container alignItems="center" spacing={4} marginTop={25} paddingLeft={20} paddingRight={20}>
            {marketPlaceListings && marketPlaceListings.map((marketPlaceListing)=>(
                <Grid item key={marketPlaceListing._id} xs={12} sm={6} md={4} lg={3}>
                    <MarketPlaceListing MarketPlaceListing={marketPlaceListing} />
                </Grid>    
            ))}
        </Grid>
    </div>
        </>
    )
}

export default MarketPlace