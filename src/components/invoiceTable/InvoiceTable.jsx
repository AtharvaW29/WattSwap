import React, { useState, useEffect } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';



export default function InvoiceTable() {

  const [listedDeal, setListedDeal] = useState({
    _id: '',
    amount: 0,
    price: 0, 
    walletAddress: '',
    name: '',
    createdAt: ''
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      const invoiceData = localStorage.getItem('invoice');
      if (invoiceData) {
        const invoice = JSON.parse(invoiceData);
        setListedDeal(invoice);
      }
    };

    fetchInvoice();
  }, []);

  console.log(listedDeal)
  
  const TAX_RATE = 0.02;
  
  function ccyFormat(num) {
    return `${num.toFixed(2)}`;
  }
  
  function priceRow(qty, unit) {
    return qty * unit;
  }
  
  function createRow(desc, qty, unit) {
    const price = priceRow(qty, unit);
    return { desc, qty, unit, price };
  }
  
  function subtotal(items) {
    return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
  }
  
  const rows = [
    createRow('Power', listedDeal.amount, 1),
    // createRow('Price', listedDeal.price - 0.02*listedDeal.price, 1),
  ];
  
  const invoiceSubtotal = subtotal(rows);
  const invoiceTaxes = TAX_RATE * invoiceSubtotal;
  const invoiceTotal = invoiceTaxes + invoiceSubtotal;
  
  return (
    <>
    <TableContainer component={Paper} id='invoice-table'>
      <Table sx={{ minWidth: 700 }} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={3}>
              Details
            </TableCell>
            <TableCell align="right">{listedDeal.createdAt}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Desc.</TableCell>
            <TableCell align="right">Qty. (KWh)</TableCell>
            <TableCell align="right">Unit (WTSWP)</TableCell>
            <TableCell align="right">Sum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.desc}>
              <TableCell>{row.desc}</TableCell>
              <TableCell align="right">{row.qty}</TableCell>
              <TableCell align="right">{row.unit}</TableCell>
              <TableCell align="right">{ccyFormat(row.price)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell rowSpan={3} />
            <TableCell colSpan={2}>Subtotal</TableCell>
            <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tax</TableCell>
            <TableCell align="right">{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
            <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
          </TableRow>
          <TableCell colSpan={3}>
             Seller Name: {listedDeal.name}
          </TableCell>
          <TableRow>
             <TableCell colSpan={3}>
             Seller Address: {listedDeal.walletAddress}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
}
