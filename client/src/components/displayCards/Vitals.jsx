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
            </div>
            </Box>


        </Paper>
      </Container>
    )
}
export default Vitals