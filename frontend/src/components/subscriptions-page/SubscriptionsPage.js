import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const SubscriptionsPage = () => {
  // State pentru abonamentele active
  const [subscriptions, setSubscriptions] = useState([]);
  const [newSubscription, setNewSubscription] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/subscriptions');
        if (response.data) {
          setSubscriptions(response.data);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };
    fetchSubscriptions();
  }, []);
  
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

            {/* Listă de abonamente active */}
            <Typography variant="h6" color="white" gutterBottom>
              Abonamente Active
            </Typography>
            <List>
              {subscriptions.map((subscription, index) => (
                <ListItem key={index} sx={{ backgroundColor: '#3c4e4d', marginBottom: 1, borderRadius: 2 }}>
                  <ListItemText
                    primary={subscription.name}
                    secondary={`Preț: ${subscription.price} RON | Data începerii: ${subscription.start_date}`}
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
