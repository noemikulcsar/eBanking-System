import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const DebtPage = () => {
  const [debtData, setDebtData] = useState([]);

  useEffect(() => {
    const fetchDebtData = async () => {
      try {
        const response = await axios.get('http://localhost:8002/api/debt');
        if (response.data) {
          setDebtData(response.data);
        }
      } catch (error) {
        console.error('Error fetching debt data:', error);
      }
    };
    fetchDebtData();
  }, []);

  return (
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
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DebtPage;
 