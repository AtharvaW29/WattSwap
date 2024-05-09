import React, { useEffect } from "react";
import { Box, Container, Paper } from "@mui/material";
import Transaction from "./transaction/transaction";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useInvoiceContext } from "../../hooks/useInvoiceContext";

const Transactions = () => {
    const { user } = useAuthContext();
    const { invoice, dispatch } = useInvoiceContext();
    const user_id = user.user_id;

    useEffect(() => {
        const fetchMarketPlaceListings = async () => {
            const response = await fetch(`http://localhost:4000/app/invoice/${user_id}`, {
                method: 'GET',
                headers: {'Authorization': `Bearer ${user.token}`}
            })
            const json = await response.json()

            if(response.ok){
                dispatch({type: 'SET_INVOICE', payload: json})
            }
        }
        if(user){
            fetchMarketPlaceListings()
        }
    }, [user, dispatch])

    return (
        <>
            <Container maxWidth="sm" sx={{display: 'inline-grid', paddingTop: 5, alignItems: 'center'}}>
                <Paper style={{ 
                    backgroundColor: '#323232', 
                    height: 'relative', 
                    borderRadius: '2vh', 
                    boxShadow: '0 0 16px 0 rgba(0,0,0,0.2)', 
                    display: 'inline-grid', 
                    scrollbarWidth: 'thin', 
                    scrollbarColor: '#7B68EE #323232'
                }}>
                    <Box style={{ 
                        backgroundColor: '#4c4c4c', 
                        height: '5vh', 
                        borderRadius: '2vh', 
                        boxShadow: '0 0 16px 0 rgba(0,0,0,0.8)', 
                        marginTop: 0 
                    }}>
                        <div className="g-6 flex flex-wrap items-center justify-center lg:justify-center" style={{ paddingTop: 10}}>
                            <span className="text-transparent text-2xl font-bold bg-clip-text bg-[#e5e5e5]">Transaction History</span>
                        </div>    
                    </Box>
                    <Box style={{ 
                        stroke: '#FFD700', 
                        strokeWidth: 2, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflowY: 'auto', 
                        maxHeight: '50vh' 
                    }}>
                        {invoice && invoice.length > 0 && invoice.map((singleInvoice) => (
                            <Transaction invoice={singleInvoice} key={singleInvoice.id}/>
                        ))}
                    </Box>
                </Paper>
            </Container>
        </>
    );
}

export default Transactions;
