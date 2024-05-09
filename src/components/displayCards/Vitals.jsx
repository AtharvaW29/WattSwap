import React from 'react';
import { Box, Container, Paper, Button, Typography} from '@mui/material';
import ConsumptionChart from '../consumptionChart/consumptionChart';
import SvgIcon from '@mui/material/SvgIcon';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useAuthContext } from '../../hooks/useAuthContext';
import ElectricityProduce from '../production/Production';
import {  useNavigate } from 'react-router-dom';

const Vitals = () => {

    const { user } = useAuthContext()
    const navigate = useNavigate()
    //console.log(user.user_id)

    return(
        <Container maxWidth="sm" sx={{display: 'inline-grid', paddingTop: 5, alignItems: 'center'}}>

        <Paper sx={{ bgcolor: '#323232', height: 'relative', borderRadius: '2vh', boxShadow: 600, display: 'inline-grid' }}>

            
        <Box sx={{ bgcolor: '#4c4c4c', height: '5vh', borderRadius: '2vh', boxShadow: 800, marginTop: 0 }}>
            <div  className="g-6 flex flex-wrap items-center justify-center lg:justify-center" style={{ paddingTop: 10}}>
                <span class="text-transparent text-2xl font-bold bg-clip-text bg-gradient-to-r to-purple-800 from-purple-400"> 
                Hello {user.name}!
                </span>
            </div>    
        </Box>
            <ElectricityProduce/>



            <Box sx={{ bgcolor: '#4c4c4c', height: '5vh', borderRadius: '2vh', boxShadow: 800, marginTop: 0 }}>
            <div>
                <ul className='flex space-x-4 text-white justify-between items-between'
                    style={{ marginTop: 15 }}>

                    
                    <Button className='cursor-pointer font-medium'
                        style={{marginLeft: 40}} onClick={()=>{navigate('/profile')}}>
                    <ManageAccountsIcon
                        style={{
                            fill: "#e5e5e5",
                            marginRight: 2
                        }}
                    /> 
                    <Typography variant='body' color='#e5e5e5'>       
                    Profile</Typography>
                    </Button>


                    <Button className='cursor-pointer font-medium'
                        style={{marginRight: 40}}
                        onClick={()=>{navigate('/settings')}}
                    >
                    <SvgIcon>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="#e5e5e5"
                        style={{marginRight: 2}}
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                        />
                    </svg>
                    </SvgIcon>
                    <Typography variant='body' color='#e5e5e5'>       
                    Settings</Typography>
                    </Button>

                </ul>
            </div>
            </Box>


        </Paper>
      </Container>
    )
}
export default Vitals