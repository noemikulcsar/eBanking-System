

import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Grid, Typography, Box, Snackbar, Alert, MenuItem } from '@mui/material';
import QRCode from 'qrcode'; 
import axios from 'axios';
import { io } from 'socket.io-client';
import { BrowserMultiFormatReader } from '@zxing/browser'; 

const TransferPage = () => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [qrData, setQrData] = useState(''); 
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null); 
  const scannerRef = useRef(null);

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

  
  const startScanning = () => {
    if (videoRef.current) {
      const multiFormatReader = new BrowserMultiFormatReader();
      scannerRef.current = multiFormatReader;
  
      multiFormatReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          handleScan(result.getText());
        } else if (error) {
          console.log('No QR code found or error:', error);
        }
      }).catch((err) => {
        console.error("Error during scanning:", err);
      });
    }
  };

  const stopScanning = () => {
    const stream = videoRef.current?.srcObject;
  
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  
  useEffect(() => {
    if (isScanning) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isScanning]);
  

  const handleClientChange = (event) => {
    console.log(event.target.value);
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
  
    console.log('Selected Client ID:', selectedClientId);
    console.log('Amount:', parsedAmount);
  
    try {
      const transferResponse = await axios.post('http://localhost:8002/api/transfer', {
        clientId: selectedClientId,
        amount: parsedAmount,
      });
  
      console.log('Transfer Response:', transferResponse.data);
  
      if (transferResponse.data.success) {
        setNotificationMessage(`Transfer de ${parsedAmount} RON către client efectuat cu succes!`);
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
  

  const generateQrCode = () => {
    if (selectedClientId && amount) {
      const data = {
        clientId: selectedClientId,
        amount,
      };

      QRCode.toDataURL(JSON.stringify(data))
        .then((url) => {
          setQrData(url); 
        })
        .catch((err) => {
          console.error('Eroare la generarea codului QR:', err);
          setError('Eroare la generarea codului QR');
        });
    } else {
      setError('Please select a client and enter an amount');
    }
  };


  const handleCloseQrCode = () => {
    setQrData(''); 
  };

  const handleScan = (data) => {
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.clientId && parsedData.amount) {
          setSelectedClientId(parsedData.clientId);
          setAmount(parsedData.amount);
        } else {
          setError('QR code is invalid');
        }
      } catch (e) {
        setError('Invalid QR code format');
      }
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

        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth onClick={generateQrCode}>
            Generate QR Code
          </Button>
        </Grid>

        {/* imaginea codului QR și butonul de închidere */}
        {qrData && (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <img src={qrData} alt="QR Code" />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCloseQrCode}
              style={{
                position: 'absolute',
                top: '320px',
                right: '540px',
                backgroundColor: '#000000',
                color: '#FFFFFF',
              }}
            >
              X
            </Button>
          </Grid>
        )}

        {/* scanare cod QR */}
        <Grid item xs={12}>
          <Button 
            variant="contained"
            color="secondary" 
            fullWidth
            onClick={() => setIsScanning(!isScanning)}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Button>
        </Grid>

        {isScanning && (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <video ref={videoRef} width="100%" height="auto" />
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleSubmit}
          >
            Confirm Transfer
          </Button>
        </Grid>
      </Grid>

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

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransferPage;
