import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, TextField, Button } from '@mui/material';

const transactionHistory = [
  { date: '2024-11-01', amount: 500, description: 'Depunere economii' },
  { date: '2024-11-05', amount: 200, description: 'Depunere economii' },
  { date: '2024-11-10', amount: -100, description: 'Retragere economii' },
];

const SavingsAccountPage = () => {
  const [balance, setBalance] = useState(5000); 
  const [amount, setAmount] = useState('');  
  const [transactions, setTransactions] = useState(transactionHistory); 

  const handleAddSavings = () => {
    if (amount > 0) {
      setBalance(balance + parseFloat(amount));
      setTransactions([...transactions, { date: new Date().toLocaleDateString(), amount: parseFloat(amount), description: 'Depunere economii' }]);
      setAmount(''); 
    } else {
      alert('Introdu o sumă validă pentru depunere!');
    }
  };

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
              Sold curent: {balance} RON
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
                  onClick={handleAddSavings}
                >
                  Adaugă economii
                </Button>
              </Grid>
            </Grid>

            {/* Istoricul tranzacțiilor */}
            <Typography variant="h5" color="white" align="center" sx={{ marginTop: 4 }} gutterBottom>
              Istoric Tranzacții
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {transactions.map((transaction, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ backgroundColor: '#3c4e4d', marginBottom: 2, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="white">
                        {transaction.date}
                      </Typography>
                      <Typography variant="body1" color="white">
                        {transaction.description}
                      </Typography>
                      <Typography variant="body2" color="white">
                        {transaction.amount > 0 ? `+${transaction.amount} RON` : `${transaction.amount} RON`}
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
