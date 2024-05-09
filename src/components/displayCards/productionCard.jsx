import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Avatar } from '@mui/material';
import { useAuthContext } from '../../hooks/useAuthContext';
import { get, ref } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { useProfileContext } from '../../hooks/useProfileContext';

export default function GlassCard() {

  const { user } = useAuthContext();
  const [power, setPower] = useState();
  const { userprofile, dispatch } = useProfileContext();
  const user_id = user.user_id


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

  useEffect(() => {
    const fetchData = () => {
      const databaseRef = ref(database);
      get(databaseRef)
        .then((snapshot) => {
          if (snapshot.exists() && user.name === 'Atharva') {
            const ledData = snapshot.val().LED;
            const powerData = ledData && ledData.power;
            let receivedPower = Math.ceil(powerData);
            if (receivedPower < 0){
              receivedPower = receivedPower * (-1)
            }
            setPower(receivedPower);
          } else {
            console.log('No Power Data Available');
          }
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000); // 

    return () => clearInterval(intervalId); 
  }, [user.name]);

  const cardStyle = {
    borderRadius: 20,
    background: 'linear-gradient(to right, #7B68EE, #7209b7)', // Purple to Silver gradient
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.2)',
    backdropFilter: 'blur(5px)',
    transition: 'background 0.5s ease-in-out',
    '&:hover': {
      background: 'linear-gradient(to right, #7209b7, #7B68EE)', // Silver to Purple on hover
    },
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#fff',
  };

  const avatarStyle = {
    width: '120px',
    height: '120px',
    marginBottom: '10px',
  };

  return (
    <Card style={cardStyle}>
      <CardContent style={contentStyle}>
          <Avatar
            style={avatarStyle}
            src={`http://localhost:4000/${userprofile.image}`}
            alt="User Avatar"
          />
        <Typography variant="h6" gutterBottom fontWeight={600} color={'#e5e5e5'}>
          {user.name}
        </Typography>
        <Typography variant='h6' fontWeight={600} color={'#e5e5e5'}>
              Electricity Produced: {power} mAH
              </Typography>
      </CardContent>
    </Card>
  );
}
