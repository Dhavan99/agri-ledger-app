// src/components/AddTransactionForm.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../utils/api';

function AddTransactionForm({ farmerId, onTransactionAdded }) {
  const [type, setType] = useState('Lent');
  const [amount, setAmount] = useState('');
  
  // --- NEW: State for the dropdown and the custom item text box ---
  const [selectedItem, setSelectedItem] = useState('Money'); // Default selection
  const [customItem, setCustomItem] = useState('');      // For the 'Other' text box

  const handleSubmit = async (event) => {
    event.preventDefault();

    // --- NEW: Logic to determine which item value to send ---
    const itemToSend = selectedItem === 'Other' ? customItem : selectedItem;

    // Check if custom item is empty when 'Other' is selected
    if (selectedItem === 'Other' && !itemToSend) {
        alert('Please enter a custom item name.');
        return;
    }

    const newTransaction = { type, item: itemToSend, amount: Number(amount) };
    
    try {
        await api.post(`/farmers/${farmerId}/transactions`, newTransaction);
        
        console.log('Transaction added');
        // Reset all fields
        setAmount('');
        setSelectedItem('Money');
        setCustomItem('');
        onTransactionAdded();
    } catch (error) {
        console.error('Error adding transaction:', error);
        alert('Failed to add transaction. Please try again.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3, p: 3, border: '1px solid #ddd', borderRadius: 2, boxShadow: 1 }}
    >
      <Typography variant="h5" component="h2"> Add New Transaction </Typography>
      
      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
          <MenuItem value="Lent">Lent (Credit)</MenuItem>
          <MenuItem value="Received">Received (Debit)</MenuItem>
        </Select>
      </FormControl>

      {/* --- NEW: Dropdown for the item --- */}
      <FormControl fullWidth>
        <InputLabel>Item</InputLabel>
        <Select value={selectedItem} label="Item" onChange={(e) => setSelectedItem(e.target.value)}>
          <MenuItem value="Money">Money</MenuItem>
          <MenuItem value="Pesticide">Pesticide</MenuItem>
          <MenuItem value="Urea">Urea</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>

      {/* --- NEW: Conditional text field for 'Other' --- */}
      {selectedItem === 'Other' && (
        <TextField
          label="Custom Item Name"
          variant="outlined"
          value={customItem}
          onChange={(e) => setCustomItem(e.target.value)}
          required
        />
      )}

      <TextField
        label="Amount"
        type="number"
        variant="outlined"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" color="primary"> Add Transaction </Button>
    </Box>
  );
}

export default AddTransactionForm;