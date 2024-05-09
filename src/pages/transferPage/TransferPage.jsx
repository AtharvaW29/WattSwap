import React from "react";
import marketplacebg from "../../assets/images/marketplacebg.jpg"
import { Typography, Button } from "@mui/material";
import InvoiceTable from "../../components/invoiceTable/InvoiceTable";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TransferPage = () => {
    
    const handleDownloadPDF = () =>{
        const input = document.getElementById('invoice-table'); // Change this ID to match your Table ID
        html2canvas(input)
          .then((canvas) => {
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298); // Adjust dimensions if needed
            pdf.save('invoice.pdf');
          });
    }

    return(
        <>
        <div className="bg-[#090016] bg-cover bg-center h-screen flex flex-col justify-between items-center lg:justify-between"
        style={{ backgroundImage: `url(${marketplacebg})`, display: 'flex', flexDirection: 'row', height: '95vh', justifyContent: 'space-evenly'}}>
            <div  style={{display: 'flex', flexDirection: 'column', marginTop: '10vh', alignItems: 'center'}}>

            <Typography variant="h4" color="#e5e5e5" fontWeight={600}>Invoice: </Typography>
            <div id='invoice-table'>
                <InvoiceTable/>
            </div>
            <Button onClick={handleDownloadPDF} 
            className="inline-block w-full rounded px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca]"
            sx={{color:'#e5e5e5', backgroundColor: '#7B68EE'}}
            >Download as PDF</Button>
            </div>

        {/* Start Loading UI here!!!!!! */}

        </div>
        </>
    )
}
export default TransferPage