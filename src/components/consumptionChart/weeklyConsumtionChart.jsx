import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const WeeklyProductionChart = () => {
    const theme = useTheme();
    const [productionData, setProductionData] = useState([]);

    useEffect(() => {
        const fetchProductionData = async () => {
            const currentDate = new Date();
            const startDate = new Date(currentDate);
            startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of the week
            const endDate = new Date(currentDate);
            endDate.setDate(endDate.getDate() - endDate.getDay() + 6); // End of the week

            const productionDataQuery = query(
                collection(firestore, 'powerData'),
                where('time', '>=', Timestamp.fromDate(startDate)),
                where('time', '<=', Timestamp.fromDate(endDate)),
                orderBy('time', 'asc')
            );

            const querySnapshot = await getDocs(productionDataQuery);
            const data = [];

            querySnapshot.forEach((doc) => {
                const { time, amount } = doc.data();
                data.push({ time: time.toDate().toLocaleDateString(), amount });
            });

            setProductionData(data);
        };

        fetchProductionData();
    }, []);

    return (
        <div style={{ height: 400 }}>
            <ResponsiveContainer>
                <LineChart
                    data={productionData}
                    margin={{ top: 10, right: 25, bottom: 10, left: 15 }}
                    height={50}
                >
                    <XAxis
                        dataKey="time"
                        stroke="#FFD700"
                        style={{ ...theme.typography.body2, fill: "#FFD700" }}
                    />
                    <YAxis
                        stroke="#FFD700"
                        style={{ ...theme.typography.body2 }}
                    >
                        <Label
                            angle={270}
                            position="left"
                            fill='#e5e5e5'
                            style={{ textAnchor: 'middle', fontStyle: 'inherit', fontWeight: 700, fontSize: 18 }}
                        >
                            Production (KW)
                        </Label>
                    </YAxis>
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8fce00"
                        strokeWidth={2}
                        dot={{ stroke: '#8fce00', fill: '#090016', strokeWidth: 1, r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default WeeklyProductionChart;