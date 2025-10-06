// src/pages/FarmerDetailPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link, Grid, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import api from '../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AddFarmerForm from '../components/AddFarmerForm';
import AddTransactionForm from '../components/AddTransactionForm';

const DAILY_RATE = (3 / 100) / 30;

function calculateDaysPassed(dateString) {
  const transactionDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  transactionDate.setHours(0, 0, 0, 0);
  const differenceInTime = today.getTime() - transactionDate.getTime();
  return Math.floor(differenceInTime / (1000 * 3600 * 24));
}

function FarmerDetailPage() {
  const { farmerId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [farmer, setFarmer] = useState(null);
  const [editFarmerOpen, setEditFarmerOpen] = useState(false);

  const fetchFarmerDetails = useCallback(async () => {
    try {
      const response = await api.get(`/farmers/${farmerId}`);
      setFarmer(response.data);
    } catch (error) { console.error("Failed to fetch farmer details:", error); }
  }, [farmerId]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get(`/farmers/${farmerId}/transactions`);
      setTransactions(response.data);
    } catch (error) { console.error("Failed to fetch transactions:", error); }
  }, [farmerId]);

  useEffect(() => {
    fetchFarmerDetails();
    fetchTransactions();
  }, [farmerId, fetchFarmerDetails, fetchTransactions]);
  
  const refreshData = () => {
      fetchFarmerDetails();
      fetchTransactions();
  };

  const totals = useMemo(() => {
    let totalLent = 0, totalReceived = 0, totalInterest = 0;
    transactions.forEach(t => {
      if (t.type === 'Lent') {
        totalLent += parseFloat(t.amount);
        const days = calculateDaysPassed(t.date);
        totalInterest += parseFloat(t.amount) * DAILY_RATE * days;
      } else if (t.type === 'Received') {
        totalReceived += parseFloat(t.amount);
      }
    });
    const balance = totalLent - totalReceived;
    return { balance, totalInterest, grandTotal: balance + totalInterest };
  }, [transactions]);

  const generatePdf = () => { /* ... unchanged ... */ };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />}>
          Back to Farmer List
        </Button>
        <Box>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditFarmerOpen(true)} sx={{ mr: 2 }}>
            Edit Details
          </Button>
          <Button variant="contained" onClick={generatePdf} disabled={!farmer}>
            Download PDF
          </Button>
        </Box>
      </Box>
      
      {farmer && (
        <Paper sx={{ p: 2, mt: 2, mb: 3, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h4" component="h1" gutterBottom> {farmer.name}'s Account </Typography>
            <Typography variant="subtitle1"><strong>Mobile:</strong> {farmer.mobile}</Typography>
            <Typography variant="subtitle1"><strong>Village:</strong> {farmer.village}</Typography>
        </Paper>
      )}

      <AddFarmerForm
        open={editFarmerOpen}
        onClose={() => setEditFarmerOpen(false)}
        onFarmerAdded={refreshData}
        farmerToEdit={farmer}
      />

      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white', boxShadow: 6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Account Summary</Typography>
        <Grid container spacing={2} sx={{ textAlign: 'center' }}>
            <Grid item xs={4}>
                {/* --- UPDATED: Changed variant from h5 to h4 --- */}
                <Typography variant="h4">₹{totals.balance.toFixed(2)}</Typography>
                <Typography variant="caption">Principal Balance</Typography>
            </Grid>
            <Grid item xs={4}>
                {/* --- UPDATED: Changed variant from h5 to h4 --- */}
                <Typography variant="h4">₹{totals.totalInterest.toFixed(2)}</Typography>
                <Typography variant="caption">Interest Due</Typography>
            </Grid>
            <Grid item xs={4}>
                {/* --- UPDATED: Changed variant from h5 to h4 --- */}
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>₹{totals.grandTotal.toFixed(2)}</Typography>
                <Typography variant="caption">Grand Total</Typography>
            </Grid>
        </Grid>
      </Paper>
      
      <AddTransactionForm farmerId={farmerId} onTransactionAdded={refreshData} />
      
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table sx={{ minWidth: 650 }}>
            <TableHead>
                <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Days</TableCell>
                    <TableCell align="right">Interest Accrued</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {transactions.map((t) => {
                    const days = t.type === 'Lent' ? calculateDaysPassed(t.date) : 0;
                    const interest = t.type === 'Lent' ? parseFloat(t.amount) * DAILY_RATE * days : 0;
                    return (
                        <TableRow key={t.id}>
                            <TableCell>{t.date}</TableCell>
                            <TableCell>{t.type}</TableCell>
                            <TableCell>{t.item}</TableCell>
                            <TableCell align="right">₹{parseFloat(t.amount).toFixed(2)}</TableCell>
                            <TableCell align="center">{t.type === 'Lent' ? `${days} days` : 'N/A'}</TableCell>
                            <TableCell align="right">₹{interest.toFixed(2)}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

// NOTE: The generatePdf function was collapsed for brevity. 
// Ensure your file still contains the full function.

export default FarmerDetailPage;