import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Box, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';

const TransferPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const socket = io('http://localhost:8002');
    socket.on('transaction_notification', (data) => {
      setNotificationMessage(data.message);
    });

    return () => socket.disconnect();
  }, []);
  useEffect(() => {
    const socket = io('http://localhost:8002');
    socket.on('transaction_notification', async (data) => {
      setNotification(data.message);
        try {
        await axios.post('http://localhost:8002/api/notificare', {
          id_client: 1,
          mesaj: data.message,
        });
      } catch (error) {
        console.error('Eroare la salvarea notificării:', error);
      }
    });
  
    return () => socket.disconnect();
  }, []);
  
  const handlePhoneChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    setNotificationMessage('');

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
      // Obține datele utilizatorului destinat
      const recipientResponse = await axios.get(`http://localhost:8002/api/client-by-phone/${phoneNumber}`);
      const { nume, prenume } = recipientResponse.data;

      // Efectuează transferul
      const transferResponse = await axios.post('http://localhost:8002/api/transfer', {
        phoneNumber,
        amount: parsedAmount,
      });

      if (transferResponse.data.success) {
        setNotificationMessage(`Transfer de ${parsedAmount} RON către ${nume} ${prenume} efectuat cu succes!`);
        setPhoneNumber('');
        setAmount('');
      } else {
        setError(transferResponse.data.error || 'A apărut o eroare la procesarea transferului');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Numărul de telefon nu corespunde unui utilizator valid.');
      } else {
        console.error('Error during transfer:', error);
        setError('A apărut o eroare la procesarea transferului');
      }
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
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleSubmit}
            sx={{ backgroundColor: '#3c4e4d' }}
          >
            Confirm Transfer
          </Button>
        </Grid>
      </Grid>

      {/* Snackbar unificat pentru toate notificările */}
      <Snackbar
        open={!!notificationMessage}
        autoHideDuration={6000}
        onClose={() => setNotificationMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotificationMessage('')} severity="success" sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransferPage;
