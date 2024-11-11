import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Box } from '@mui/material';

const TransferPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handlePhoneChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = () => {
    if (!phoneNumber || !amount) {
      setError('Please fill in both fields');
    } else {
      setError('');
      console.log('Transfer to:', phoneNumber, 'Amount:', amount);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Number transfer
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Număr de telefon"
            variant="outlined"
            fullWidth
            value={phoneNumber}
            onChange={handlePhoneChange}
            type="tel"
            inputProps={{ pattern: "[0-9]{10}" }}  // Permite doar 10 caractere numerice
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Sumă"
            variant="outlined"
            fullWidth
            value={amount}
            onChange={handleAmountChange}
            type="number"
          />
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleSubmit}
            sx={{ backgroundColor: '#3c4e4d'}}
          >
            Confirm Transfer
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransferPage;
