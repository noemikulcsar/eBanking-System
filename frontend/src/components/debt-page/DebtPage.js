import React from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';

const DebtPage = () => {
  const debtData = [
    { id: 1, name: 'Ion Popescu', amount: '100 RON', date: '2024-11-05' },
    { id: 2, name: 'Maria Ionescu', amount: '250 RON', date: '2024-11-07' },
    { id: 3, name: 'George Vasilescu', amount: '150 RON', date: '2024-11-10' },
  ];

  return (
    <Grid container justifyContent="center" sx={{ padding: 3 }}>
      {debtData.map((debt) => (
        <Grid item xs={12} sm={8} key={debt.id} sx={{ marginBottom: 2 }}>
          <Card sx={{ backgroundColor: '#686a6d', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h5" color="white" gutterBottom>
                Datorie la: {debt.name}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Sumă</TableCell>
                      <TableCell>{debt.amount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Data datoriei</TableCell>
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
