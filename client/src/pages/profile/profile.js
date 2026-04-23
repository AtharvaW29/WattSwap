import ProfileInfoCard from "../../components/displayCards/profileInfoCard";
import AccountInfoCard from "../../components/displayCards/accountInfoCard";
import { useAuthContext } from "../../hooks/useAuthContext";
import Transactions from "../../components/transactions/transactions";
import React, { useEffect, useState } from "react";
import { useProfileContext } from "../../hooks/useProfileContext";
import { useMetaMaskContext } from "../../hooks/useMetaMaskContext";
import { BlockchainLogger } from "../../utils/blockchainLogger";

const Profile = () => {
  const { user } = useAuthContext();
  const { userprofile, dispatch } = useProfileContext();
  const user_id = user.user_id;
  const { account, balance, error, connectMetaMask, isConnected, loading } = useMetaMaskContext();
  const [profileLoading, setProfileLoading] = useState(false);

  // Only connect MetaMask once on component mount or when isConnected changes
  useEffect(() => {
    if (!isConnected && !loading) {
      BlockchainLogger.log('🔗 Profile mounted - connecting MetaMask');
      connectMetaMask();
    }
  }, []); // Empty dependency array - run once on mount only

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        BlockchainLogger.log('📋 Fetching user profile...');

        const response = await fetch(`http://localhost:4000/app/profile/${user_id}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: 'SET_PROFILE', payload: json });
          BlockchainLogger.log('✅ Profile loaded:', { userId: user_id });
        } else {
          BlockchainLogger.log('❌ Failed to load profile:', json);
        }
      } catch (err) {
        BlockchainLogger.logError('fetchUserProfile', err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user_id, user, dispatch]); // Proper dependency array

  return (
    <div
      className="bg-[#090016] bg-cover bg-center h-full relative items-center justify-center lg:justify-center"
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '20vh' }}>
        <div style={{ width: 600, height: 700, marginTop: '10vh' }}>
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
            avatar={`http://localhost:4000/${userprofile.image}`}
            shadow={false}
          />
        </div>

        {/* Wallet and balance info */}
        <div style={{ width: 600, height: 500 }}>
          {loading || profileLoading ? (
            <div style={{ color: 'white', padding: '20px' }}>Loading wallet info...</div>
          ) : (
            <>
              <AccountInfoCard
                title="Account information"
                info={{
                  walletaddress: account || 'Not connected',
                  balance: balance ? `${balance} WTSWP` : 'N/A'
                }}
                shadow={false}
              />
              {error && (
                <div style={{ color: '#ff6b6b', padding: '10px', marginTop: '10px' }}>
                  ⚠️ {error}
                </div>
              )}
              {isConnected && !account && (
                <div style={{ color: '#ffd700', padding: '10px', marginTop: '10px' }}>
                  ℹ️ MetaMask connected but no account selected
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Transactions />
    </div>
  );
};

export default Profile;
