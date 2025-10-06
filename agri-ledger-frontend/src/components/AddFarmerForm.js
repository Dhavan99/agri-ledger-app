// src/components/AddFarmerForm.js
import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
import api from '../utils/api';

// The component now accepts an optional 'farmerToEdit' prop
function AddFarmerForm({ open, onClose, onFarmerAdded, farmerToEdit }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');

  // This effect pre-fills the form when in "Edit" mode or clears it for "Add" mode
  useEffect(() => {
    if (farmerToEdit && open) {
      setName(farmerToEdit.name);
      setMobile(farmerToEdit.mobile);
      setVillage(farmerToEdit.village);
    } else {
      setName('');
      setMobile('');
      setVillage('');
    }
  }, [farmerToEdit, open]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const farmerData = { name, mobile, village };

    try {
      if (farmerToEdit) {
        // If editing, send a PUT request to update
        await api.put(`/farmers/${farmerToEdit.id}`, farmerData);
      } else {
        // If adding, send a POST request to create
        await api.post('/farmers', farmerData);
      }
      onFarmerAdded(); // Refresh the list
      handleClose();   // Close the dialog
    } catch (error) {
      console.error('Failed to save farmer:', error);
      alert('Failed to save farmer. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      {/* The title is now dynamic */}
      <DialogTitle>{farmerToEdit ? 'Edit Farmer Details' : 'Add a New Farmer'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Farmer Name" type="text" fullWidth variant="outlined" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField margin="dense" label="Mobile Number" type="text" fullWidth variant="outlined" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
          <TextField margin="dense" label="Village" type="text" fullWidth variant="outlined" value={village} onChange={(e) => setVillage(e.target.value)} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {/* The button text is also dynamic */}
          <Button type="submit" variant="contained">{farmerToEdit ? 'Save Changes' : 'Add Farmer'}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddFarmerForm;