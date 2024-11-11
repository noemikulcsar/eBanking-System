import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const SubscriptionsPage = () => {
  // State pentru abonamentele active
  const [subscriptions, setSubscriptions] = useState([
    { id: 1, name: 'Netflix', price: '45 RON', date: '2024-11-01' },
    { id: 2, name: 'Spotify', price: '25 RON', date: '2024-11-10' },
  ]);
  
  // State pentru noul abonament
  const [newSubscription, setNewSubscription] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Funcția pentru a adăuga un abonament
  const addSubscription = () => {
    if (newSubscription && newPrice) {
      setSubscriptions([
        ...subscriptions,
        { id: subscriptions.length + 1, name: newSubscription, price: newPrice, date: new Date().toLocaleDateString() }
      ]);
      setNewSubscription('');
      setNewPrice('');
    } else {
      alert('Completează toate câmpurile!');
    }
  };

  // Funcția pentru a șterge un abonament
  const removeSubscription = (id) => {
    setSubscriptions(subscriptions.filter(subscription => subscription.id !== id));
  };

  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      <Grid item xs={12} sm={8}>
        <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="white" gutterBottom>
              Abonamente
            </Typography>

            {/* Formular pentru adăugarea unui abonament */}
            <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: 2 }}>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Nume Abonament"
                  variant="outlined"
                  fullWidth
                  value={newSubscription}
                  onChange={(e) => setNewSubscription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Preț Abonament"
                  variant="outlined"
                  fullWidth
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ backgroundColor: '#4e6363', '&:hover': { backgroundColor: '#3c4e4d' } }}
                  onClick={addSubscription}
                >
                  <AddIcon />
                </Button>
              </Grid>
            </Grid>

            {/* Listă de abonamente active */}
            <Typography variant="h6" color="white" gutterBottom>
              Abonamente Active
            </Typography>
            <List>
              {subscriptions.map((subscription) => (
                <ListItem key={subscription.id} sx={{ backgroundColor: '#3c4e4d', marginBottom: 1, borderRadius: 2 }}>
                  <ListItemText
                    primary={subscription.name}
                    secondary={`Preț: ${subscription.price} | Data: ${subscription.date}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => removeSubscription(subscription.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SubscriptionsPage;
