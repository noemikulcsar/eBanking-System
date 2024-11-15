import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const transactionHistory = [
  { date: '2024-11-01', amount: 500, description: 'Depunere economii' },
  { date: '2024-11-05', amount: 200, description: 'Depunere economii' },
  { date: '2024-11-10', amount: -100, description: 'Retragere economii' },
];

const SavingsAccountPage = () => {
  const [balance, setBalance] = useState(0); // Soldul curent
  const [savings, setSavings] = useState(0); // Economiile
  const [amount, setAmount] = useState(''); // Suma de adăugat
  const [transactions, setTransactions] = useState(transactionHistory);
  const [loading, setLoading] = useState(true); // Stare de încărcare

  // Apelul API pentru a obține soldul și economiile de la backend
  const fetchBalance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/balance');
      if (response.data.balance !== undefined) {
        setBalance(response.data.balance); // Actualizăm soldul
        setSavings(response.data.savings); // Actualizăm economiile
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false); // Opresc starea de încărcare după ce datele sunt obținute
    }
  };

  // Apelăm funcția fetchBalance o singură dată când componenta este montată
  useEffect(() => {
    fetchBalance();
  }, []); // apelăm doar o singură dată când componenta este montată

  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="white" gutterBottom>
              Cont Economii
            </Typography>

            {/* Soldul curent */}
            <Typography variant="h5" color="white" align="center">
              Sold curent: {loading ? 'Se încarcă...' : `${balance} RON`}
            </Typography>
            <Typography variant="h6" color="white" align="center">
              Economii: {loading ? 'Se încarcă...' : `${savings} RON`}
            </Typography>

            {/* Formular pentru depunerea economiilor */}
            <Grid container spacing={2} justifyContent="center" sx={{ marginTop: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Suma de adăugat"
                  variant="outlined"
                  fullWidth
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
                >
                  Adaugă economii
                </Button>
              </Grid>
            </Grid>

            {/* Istoricul tranzacțiilor */}
            <Typography variant="h6" color="white" sx={{ marginTop: 3 }}>
              Istoricul tranzacțiilor
            </Typography>
            <Grid container spacing={2}>
              {transactions.map((transaction, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ backgroundColor: '#838a8a', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body1" color="white">
                        {transaction.date}
                      </Typography>
                      <Typography variant="body2" color="white">
                        {transaction.description}
                      </Typography>
                      <Typography variant="h6" color="white">
                        {transaction.amount} RON
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SavingsAccountPage;
