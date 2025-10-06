// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Set the theme mode to light
    primary: {
      main: '#6a89cc', // A soft, pastel blue
    },
    secondary: {
      main: '#82ccdd', // A gentle cyan for accents
    },
    background: {
      default: '#f8f9fa', // A very light, off-white background
      paper: '#ffffff',   // The background for components like Cards and Tables
    },
    text: {
      primary: '#343a40', // Dark grey for primary text for readability
      secondary: '#6c757d', // Lighter grey for secondary text
    },
  },
  typography: {
    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
  },
});

export default theme;