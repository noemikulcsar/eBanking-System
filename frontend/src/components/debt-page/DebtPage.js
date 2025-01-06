import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Snackbar, Alert, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

const DebtPage = () => {
  const [debtData, setDebtData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Funcție pentru a calcula vechimea datoriei în luni
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

  // Fetch the debt data when component mounts
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

  // Fetch the clients and filter out client with id = 1
  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:8002/api/clients');
      setClients(response.data.filter(client => client.id !== 1)); // filter out client with id=1
    } catch (error) {
      console.error('Eroare la obținerea listei de clienți:', error);
    }
  };

  useEffect(() => {
    fetchDebtData(); // Fetch debt data when the component mounts
    fetchClients(); // Fetch clients when the component mounts
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddDebt = async () => {
    if (!selectedClientName || !amount) {
      console.error('Te rog selectează un client și introduce suma.');
      return;
    }

    // Găsim clientul selectat pe baza numelui complet
    const selectedClient = clients.find(client => `${client.nume} ${client.prenume}` === selectedClientName);

    if (selectedClient) {
      const payerId = selectedClient.id; // ID-ul clientului către care ai datoria
      const clientId = 1;  // Presupunem că tu ești clientul cu id-ul 1 (poți ajusta acest ID după necesități)
      const debtAmount = parseFloat(amount); // Suma datorată (convertită la float)

      const data = {
        payerId,
        clientId,
        amount: debtAmount,
      };

      try {
        const response = await axios.post('http://localhost:8002/api/add-debt', data);
        console.log(response.data);

        // Setăm mesajul de succes
        setSuccessMessage('Datoria a fost adăugată cu succes!');

        // Reîmprospătăm lista de datorii
        fetchDebtData();  // Apelăm funcția pentru a actualiza datele cu datoriile

        // Închidem dialogul
        handleCloseDialog();
      } catch (error) {
        console.error('Error adding debt:', error);
      }
    } else {
      console.error('Clientul selectat nu a fost găsit!');
    }
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

      {/* Add Debt Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ margin: 2 }}
        onClick={handleOpenDialog}
      >
        Add Debt
      </Button>

      {/* Dialog to Add Debt */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add a New Debt</DialogTitle>
        <DialogContent>
          <TextField
            label="Select Client"
            select
            fullWidth
            value={selectedClientName}
            onChange={(e) => setSelectedClientName(e.target.value)}
            sx={{ marginBottom: 2 }}
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.nume + ' ' + client.prenume}>
                {client.nume} {client.prenume}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddDebt} color="primary">
            Add Debt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      {successMessage && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}

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

      {/* Close All Notifications */}
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
