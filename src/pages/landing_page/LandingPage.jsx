import React from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import Vitals from '../../components/displayCards/Vitals';
import DealsBoard from '../../components/dealsBoard/dealsBoard';
import primarybg from '../../assets/images/primarybg.png'
import { useHomePage } from '../../hooks/useHomePage';

const LandingPage = () =>{
    const { user } = useAuthContext()
    const { homePage } = useHomePage();
    
    if(homePage){
    return(
        <>
       <div className="bg-[#090016] bg-cover bg-center h-full relative items-between justify-between lg:justify-between"
       style={{ backgroundImage: `url(${primarybg})`, display: 'flex', flexDirection: 'row'}}>
            <Vitals/>

            <DealsBoard/>
       </div>
        </>
    )}
}

export default LandingPage;