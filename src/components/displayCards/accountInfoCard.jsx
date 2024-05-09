import React from "react";
import { Box, Typography, Card, Divider } from "@mui/material";


const cardStyle = {
    borderRadius: 15,
    background: 'linear-gradient(to right, #7B68EE, #7209b7)', // Purple to Orange-400 gradient
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.2)',
    backdropFilter: 'blur(5px)',
    transition: 'background 0.5s ease-in-out',
    '&:hover': {
      background: 'linear-gradient(to right, #7209b7, #7B68EE)', // Orange-400 to Purple on hover
    },
  };
  
  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#fff',
    position: 'relative',
  };
    

// walletaddress, accountid, balance include this in info while rendering
const AccountInfoCard = ({title, info}) => {
    const labels = [];
    const values = [];
    //I am converting to lowercase if any
    Object.keys(info).forEach((el) => {
        if(el.match(/[A-Z\s]+/)){
            const uppercaseLetter = Array.from(el).find((i) => i.match(/[A-Z\s]+/))
            const newElement = el.replace(uppercaseLetter, `${uppercaseLetter.toLowerCase()}`);
            labels.push(newElement);
        } else {
            labels.push(el)
        }
    })
    //pushing in the values in values array
    Object.values(info).forEach((el) => values.push(el));

    const renderItems = labels.map((label, key) => (
        <Box key={label} display="flex" py={1} pr={2}>
        <Typography variant="button" fontWeight="bold" textTransform="capitalize">
          {label}: &nbsp;
        </Typography>
        <Typography variant="button" fontWeight="regular" color="text">
          &nbsp;{values[key]}
        </Typography>
        </Box>
    ))


    return(
        <>
    <Card sx={cardStyle}>
      <Box sx={contentStyle} display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
        <Typography variant="h4" fontWeight={700} textTransform="capitalize"  color='#e5e5e5'>
          {title}</Typography>
      </Box>
      <Box p={2}>
        <Box opacity={0.3}>
          <Divider />
        </Box>
        <Box sx={contentStyle} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={400} textTransform="capitalize"  color='#e5e5e5'> 
          {renderItems}
          </Typography>
        </Box>
      </Box>
    </Card>
        </>
    )
}
export default AccountInfoCard