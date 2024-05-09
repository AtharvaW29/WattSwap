import React from "react";
import Production from "../../components/production/Production";
import SellingForm from "../../components/listingForm/sellingForm";
import MarketPlaceListingManagement from "../../components/marketPlaceListingManagement/marketPlaceListingManagement";
import primarybg from "../../assets/images/primarybg.png";

const ListingPage = () => {
    return(
        <>
        <div className="bg-[#090016] bg-cover bg-center h-full  items-center justify-center"
                style={{ backgroundImage: `url(${primarybg})`, display: 'flex', flexDirection: 'row', height: '95vh', justifyContent: 'space-evenly'}}>
            
            <div style={{display: 'flex', flexDirection: 'column', marginTop: '10vh'}}>
                <Production/>
            </div>

            <div  style={{display: 'flex', flexDirection: 'column', marginTop: '10vh'}}>
                <SellingForm/>
            </div>

            <div  style={{display: 'flex', flexDirection: 'column', marginTop: '10vh', backgroundColor: '#4a236f', borderRadius: 15,
                    width: 400,
                    color: 'white',
                    borderColor: '#5e5e5e',
                    borderWidth: 2,
                    padding: 8}}>
                <MarketPlaceListingManagement/>
            </div>
       </div>
        </>
    )
}

export default ListingPage