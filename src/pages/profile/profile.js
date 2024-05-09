import ProfileInfoCard from "../../components/displayCards/profileInfoCard";
import AccountInfoCard from "../../components/displayCards/accountInfoCard";
import { useAuthContext } from "../../hooks/useAuthContext";
import Transactions from "../../components/transactions/transactions";
import React, { useEffect, useState } from "react";
import { useProfileContext } from "../../hooks/useProfileContext";
import { useMetaMaskContext } from "../../hooks/useMetaMaskContext";

const Profile = () => {

  const { user } = useAuthContext();
  const { userprofile, dispatch } = useProfileContext();
  const user_id = user.user_id
  const { account, balance, error, connectMetaMask } = useMetaMaskContext();

useEffect(() => {
  connectMetaMask()
})


useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await fetch(`http://localhost:4000/app/profile/${user_id}`, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${user.token}`}
      })
      const json = await response.json()

      if (response.ok){
        dispatch({type: 'SET_PROFILE', payload: json})
      }
    }

    if (user){
      fetchUserProfile() 
    }
}, [dispatch, user])


  return (
    <div className="bg-[#090016] bg-cover bg-center h-full relative items-center justify-center lg:justify-center"
    style={{ display: 'flex', flexDirection: 'row'}}>

    <div style={{display: 'flex', flexDirection: 'column', marginLeft: '20vh'}}>
    <div style={{ width: 600, height: 700,  marginTop: '10vh' }}>  
      <ProfileInfoCard
                title="profile information"
                info={{
                  name: user.name,
                  mobile: userprofile.contact,
                  email: user.email,
                  city: userprofile.city,
                  state: userprofile.state,
                  location: userprofile.country
                }}
                action={{ route: "/profile/edit", tooltip: "Edit Profile" }}
                avatar= {`http://localhost:4000/${userprofile.image}`}
                shadow={false}/>
    </div>


    {/* walletaddress, accountid, balance include this in info while rendering */}
    <div style={{ width: 600, height: 500 }} >
    <AccountInfoCard
                title="Account information"
                info={{
                  walletaddress: account,
                  balance: balance
                }}
                shadow={false}/>
    </div>
    {error && (
      <div>{error}</div>
    )}
    </div>


    <Transactions/>

</div>
  )
};
export default Profile
