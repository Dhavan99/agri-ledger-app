// src/pages/HomePage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddFarmerForm from '../components/AddFarmerForm';
import { Container, Typography, Grid, Card, CardContent, CardActionArea, Button, Box, Paper, TextField } from '@mui/material';
import api from '../utils/api';

const SummaryCard = ({ title, value, color, isCurrency = true }) => (
    <Paper sx={{ p: 2, textAlign: 'center', color: color, boxShadow: 3 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {isCurrency ? `₹${Number(value).toFixed(2)}` : value}
        </Typography>
    </Paper>
);

function HomePage() {
  const [farmers, setFarmers] = useState([]);
  const navigate = useNavigate();
  const [addFarmerOpen, setAddFarmerOpen] = useState(false);
  const [summary, setSummary] = useState({ totalLent: 0, totalReceived: 0, farmerCount: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFarmers = useCallback(async () => { try { const res = await api.get('/farmers'); setFarmers(res.data); } catch (e) { console.error(e); } }, []);
  const fetchSummary = useCallback(async () => { try { const res = await api.get('/dashboard-summary'); setSummary(res.data); } catch (e) { console.error(e); } }, []);
  useEffect(() => { fetchFarmers(); fetchSummary(); }, [fetchFarmers, fetchSummary]);
  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const handleFarmerAdded = () => { fetchFarmers(); fetchSummary(); }

  const filteredFarmers = useMemo(() => {
    if (!searchTerm) {
      return farmers;
    }
    return farmers.filter(farmer =>
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.mobile.includes(searchTerm) ||
      farmer.village.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, farmers]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography variant="h3" component="h1"> Hannan </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search Farmers"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '300px', mr: 2 }}
          />
          <Button variant="contained" onClick={() => setAddFarmerOpen(true)} sx={{ mr: 2 }}> Add New Farmer </Button>
          <Button variant="outlined" onClick={handleLogout}> Logout </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><SummaryCard title="Total Lent" value={summary.totalLent} color="#d32f2f" /></Grid>
        <Grid item xs={12} sm={6} md={3}><SummaryCard title="Total Received" value={summary.totalReceived} color="#388e3c" /></Grid>
        <Grid item xs={12} sm={6} md={3}><SummaryCard title="Balance Amount" value={summary.totalLent - summary.totalReceived} color="#f57c00" /></Grid>
        <Grid item xs={12} sm={6} md={3}><SummaryCard title="Active Farmers" value={summary.farmerCount} color="#1976d2" isCurrency={false} /></Grid>
      </Grid>

      <AddFarmerForm
        open={addFarmerOpen}
        onClose={() => setAddFarmerOpen(false)}
        onFarmerAdded={handleFarmerAdded}
      />
      
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}> Farmer List </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {filteredFarmers.length > 0 ? (
          filteredFarmers.map(farmer => (
            <Grid item xs={12} sm={6} md={4} key={farmer.id}>
              <Card sx={{ width: 345, height: 140, display: 'flex', flexDirection: 'column' }}>
                <CardActionArea component={Link} to={`/farmer/${farmer.id}`} sx={{ flexGrow: 1 }}>
                  {/* --- UPDATED: Added sx prop to center the content --- */}
                  <CardContent sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                  }}>
                    <Typography gutterBottom variant="h5" component="div">{farmer.name}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Mobile:</strong> {farmer.mobile}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Village:</strong> {farmer.village}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography sx={{ ml: 2, width: '100%', textAlign: 'center', mt: 4 }}>
            {farmers.length > 0 ? "No farmers match your search." : 'No farmers found. Click "Add New Farmer" to begin.'}
          </Typography>
        )}
      </Grid>
    </Container>
  );
}

export default HomePage;