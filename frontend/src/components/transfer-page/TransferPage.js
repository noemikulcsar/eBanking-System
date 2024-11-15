import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Box } from '@mui/material';
import axios from 'axios';

const TransferPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhoneChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !amount) {
      setError('Please fill in both fields');
      return;
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/transfer', {
        phoneNumber,
        amount: parsedAmount
      });

      if (response.data.success) {
        setSuccess('Transfer realizat cu succes!');
        setPhoneNumber('');
        setAmount('');
      } else {
        setError(response.data.error || 'A apărut o eroare la procesarea transferului');
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      setError('A apărut o eroare la procesarea transferului');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Transfer Număr
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
            inputProps={{ pattern: "[0-9]{10}" }}
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
            inputProps={{ step: "0.01", min: "0" }}
          />
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Grid>
        )}

        {success && (
          <Grid item xs={12}>
            <Typography color="success" align="center">
              {success}
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
