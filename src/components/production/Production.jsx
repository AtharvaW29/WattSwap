import React, { useState } from 'react'
import { Select, MenuItem, Typography, Box } from '@mui/material';
import ProductionCard from '../displayCards/productionCard';
import ConsumptionChart from '../consumptionChart/consumptionChart';
import WeeklyConsumtionChart from '../consumptionChart/weeklyConsumtionChart';

function TabPanel(props){
    const { children, value, index, ...other } = props;

    return(
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3}}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div> 
    );
}

export default function ElectricityProduce () {
    const [selectedTimeRange, setSelectedTimeRange] = useState(0)

    const handleChange = (e) => {
        e.preventDefault()
        setSelectedTimeRange(e.target.value)
    }
    return(
        <>
        <div className='className="g-6 flex flex-wrap items-center justify-center lg:justify-center"'>
        <Typography variant='h2' color={'#e5e5e5'} fontWeight={700} fontSize={18} 
        marginTop= {5} marginBottom={5} >
            Electricity Production (KW)
        </Typography></div>
        <Select
        style={{ minWidth: 200, marginTop: 2, marginBottom: '2vh', color: '#e5e5e5', backgroundColor: '#4c4c4c' }}
                          labelId="time-range-label"
                          id="time-range-select"
                          value={selectedTimeRange}
                          onChange={handleChange}
                          label="Select Time Range"
        >
          <MenuItem value={0}>Day</MenuItem>
          <MenuItem value={1}>Week</MenuItem>
          <MenuItem value={2}>Month</MenuItem>
          <MenuItem value={3}>Year</MenuItem>
      </Select>
        <TabPanel value={selectedTimeRange} index={0} style={{marginBottom: '5vh'}}>
              <ProductionCard/>
              <div style={{marginTop: 50}}>
              <ConsumptionChart/>
              </div>
        </TabPanel>
        <TabPanel value={selectedTimeRange} index={1} style={{marginBottom: '5vh'}}>
              <ProductionCard/>
              <div style={{marginTop: 50}}>
              <WeeklyConsumtionChart/>
              </div>
        </TabPanel>
        <TabPanel value={selectedTimeRange} index={2} style={{marginBottom: '5vh'}}>
              <ProductionCard/>
        </TabPanel>
        <TabPanel value={selectedTimeRange} index={3} style={{marginBottom: '5vh'}}>
              <ProductionCard/>
        </TabPanel>
      </>
    )
}