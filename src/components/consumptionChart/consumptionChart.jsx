import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { useAuthContext } from '../../hooks/useAuthContext';


export default function ConsumptionChart() {
  const [data, setData] = useState([]);
  let lineColor = '#8fce00';
  const theme = useTheme();
  const { user } = useAuthContext();

  //fetch from realtime db and add to firestore
  useEffect(() => {
    const fetchData = () => {
      const databaseRef = ref(database);
      get(databaseRef)
        .then((snapshot) => {
          if (snapshot.exists() && user.name === 'Atharva') {
            const ledData = snapshot.val().LED;
            let powerData = ledData && ledData.power;
            // const voltageData = powerData && powerData.voltage;
            const currentTime = new Date().toLocaleTimeString();
            // Add new data point to the existing data
            let receivedPower = Math.ceil(powerData);
            if (receivedPower < 0){
              receivedPower = receivedPower * (-1)
            }
            setData((prevData) => [...prevData, { time: currentTime, amount: receivedPower }]);
            // Store data in Firestore
            addDataToFirestore(currentTime, receivedPower);
          } else {
            console.log('No Power Data Available');
          }
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const addDataToFirestore = async (time, amount) => {
      try {
        const docRef = await addDoc(collection(firestore, 'powerData'), {
          time: time,
          amount: amount
        });
        console.log('Document written with ID: ', docRef.id);
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    };

    const intervalId = setInterval(fetchData, 15000);

    return () => clearInterval(intervalId);
  }, [user.name]);

  //fetch data from firebase realtime db for buyer
  useEffect(() => {
    const fetchData = () => {
      const databaseRef = ref(database);
      get(databaseRef)
        .then((snapshot) => {
          if (snapshot.exists() && user.name === 'Jimit') {
            const buyerData = snapshot.val().Buyer;
            let powerData = buyerData && buyerData.power;
            // const voltageData = powerData && powerData.voltage;
            const currentTime = new Date().toLocaleTimeString();
            // Add new data point to the existing data
            let receivedPower = Math.ceil(powerData);
            if (receivedPower < 0){
              receivedPower = receivedPower * (-1)
            }
            setData((prevData) => [...prevData, { time: currentTime, amount: receivedPower }]);
          } else {
            console.log('No Power Data Available');
          }
        })
        .catch((error) => {
          console.error(error);
        });
    };
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [user.name]);

  return (
    <React.Fragment>
      <div style={{ height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 25,
              bottom: 10,
              left: 15,
            }}
            height={50}
          >
            <XAxis
              dataKey="time"
              stroke="#FFD700"
              style={{
                ...theme.typography.body2,
                fill: "#FFD700"
              }}
            />
            <YAxis
              stroke="#FFD700"
              style={{
                ...theme.typography.body2,
              }}
            >
              <Label
                angle={270}
                position="left"
                fill='#e5e5e5'
                style={{
                  textAnchor: 'middle',
                  fontStyle: 'inherit',
                  fontWeight: 700,
                  fontSize: 18
                }}
              >
                Production (KW)
              </Label>
            </YAxis>
            <Line
              type="monotone"
              dataKey="amount"
              stroke={lineColor}
              strokeWidth={'2'}
              dot={{
                stroke: '#8fce00',
                fill: '#090016',
                strokeWidth: 1,
                r: 5
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </React.Fragment>
  );
}
