import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Snackbar, Alert, IconButton, Button } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

const DebtPage = () => {
  const [debtData, setDebtData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const calculateDebtAgeInMonths = (debtDateString) => {
    const debtDate = new Date(debtDateString);
    const currentDate = new Date();
    
    let yearsDiff = currentDate.getFullYear() - debtDate.getFullYear();
    let monthsDiff = currentDate.getMonth() - debtDate.getMonth();

    if (monthsDiff < 0) {
      yearsDiff--;
      monthsDiff += 12;
    }

    return yearsDiff * 12 + monthsDiff;
  };

  const isOlderThanOneMonth = (dateString) => {
    const debtAgeInMonths = calculateDebtAgeInMonths(dateString);
    return debtAgeInMonths >= 1;
  };

  useEffect(() => {
    const fetchDebtData = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/debt');
        if (response.data) {
          setDebtData(response.data);

          const overdueDebts = response.data.filter((debt) =>
            isOlderThanOneMonth(debt.date)
          );

          const newNotifications = overdueDebts.map((debt) => ({
            id: debt.id,
            message: `Debt to ${debt.name} of ${debt.amount} RON is overdue by ${calculateDebtAgeInMonths(debt.date)} months!`,
            open: true,
          }));
          setNotifications(newNotifications);
        }
      } catch (error) {
        console.error('Error fetching debt data:', error);
      }
    };
    fetchDebtData();
  }, []);

  const handlePayDebt = async (debtName) => {
    try {

      await axios.post('http://localhost:8002/api/debt/pay', { name: debtName });
      setDebtData((prevData) => prevData.filter((debt) => debt.name !== debtName));
    } catch (error) {
      console.error('Error paying debt:', error);
    }
  };
  

  const handleCloseAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <>
      <Grid container justifyContent="center" sx={{ padding: 3 }}>
        {debtData.map((debt) => (
          <Grid item xs={12} sm={8} key={debt.id} sx={{ marginBottom: 2 }}>
            <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h5" color="white" gutterBottom>
                  Debt to {debt.name}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                        <TableCell>{debt.amount} RON</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Debt Date</TableCell>
                        <TableCell>{debt.date}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ marginTop: 2 }}
                  onClick={() => handlePayDebt(debt.name)}
                >
                  Pay
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Notifications */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={notification.open}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          style={{
            bottom: `${20 + index * 75}px`,
          }}
        >
          <Alert
            severity="warning"
            sx={{
              width: '400px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}

      {/* close all */}
      {notifications.length > 0 && (
        <IconButton
          onClick={handleCloseAllNotifications}
          sx={{
            position: 'fixed',
            bottom: '10px',
            left: '920px',
            zIndex: 1000,
            backgroundColor: '#f44336',
            color: 'white',
            '&:hover': {
              backgroundColor: '#d32f2f',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </>
  );
};

export default DebtPage;
