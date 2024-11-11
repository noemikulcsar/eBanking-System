import React from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { transactionData } from './transactionData'; // Importăm datele din transactionData.js

const TransactionHistoryPage = () => {
  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="white" gutterBottom>
              Istoric Tranzacții
            </Typography>

            {/* Tabel cu istoricul tranzacțiilor */}
            <TableContainer component={Paper}>
              <Table>
                <thead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>De la</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Către</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sumă</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                  </TableRow>
                </thead>
                <TableBody>
                  {transactionData.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{transaction.from}</TableCell>
                      <TableCell>{transaction.to}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TransactionHistoryPage;
