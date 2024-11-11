import React from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { cardData } from './cardData'; // Importăm datele din cardData.js

const PersonalDataPage = () => {
  const data = cardData[0]; // Vom folosi primul obiect din array (pentru că este un singur card)

  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="white" gutterBottom>
              Datele personale
            </Typography>

            {/* Tabel cu datele cardului */}
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Număr Card</TableCell>
                    <TableCell>{data.cardNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data Expirării</TableCell>
                    <TableCell>{data.expirationDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Detinator Card</TableCell>
                    <TableCell>{data.cardHolderName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>CVC</TableCell>
                    <TableCell>{data.cvc}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Număr Telefon</TableCell>
                    <TableCell>{data.phoneNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>IBAN</TableCell>
                    <TableCell>{data.iban}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sold</TableCell>
                    <TableCell>{data.balance}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PersonalDataPage;
