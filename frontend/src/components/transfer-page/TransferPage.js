import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Box, Snackbar, Alert, MenuItem } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';

const TransferPage = () => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {

    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Eroare la obținerea listei de clienți:', error);
      }
    };

    fetchClients();

    const socket = io('http://localhost:8002');
    socket.on('transaction_notification', (data) => {
      setNotificationMessage(data.message);
    });

    return () => socket.disconnect();
  }, []);

  const handleClientChange = (event) => {
    setSelectedClientId(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    setNotificationMessage('');

    if (!selectedClientId || !amount) {
      setError('Please fill in both fields');
      return;
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const selectedClient = clients.find(client => client.id === selectedClientId);

      const transferResponse = await axios.post('http://localhost:8002/api/transfer', {
        clientId: selectedClientId,
        amount: parsedAmount,
      });

      if (transferResponse.data.success) {
        setNotificationMessage(`Transfer de ${parsedAmount} RON către ${selectedClient.nume} ${selectedClient.prenume} efectuat cu succes!`);
        setSelectedClientId('');
        setAmount('');
      } else {
        setError(transferResponse.data.error || 'A apărut o eroare la procesarea transferului');
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      setError('A apărut o eroare la procesarea transferului');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Transfer Sum
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            select
            label="To whom?"
            variant="outlined"
            fullWidth
            value={selectedClientId}
            onChange={handleClientChange}
          >
            {clients.map(client => (
              <MenuItem key={client.id} value={client.id}>
                {client.nume} {client.prenume}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Sum"
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

      {/* Snackbar pentru notificări */}
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
