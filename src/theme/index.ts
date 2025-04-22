import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: `'Inter', sans-serif`,
    h4: {
      fontFamily: `'Bebas Neue', sans-serif`,
    },
    h5: {
      fontFamily: `'Bebas Neue', sans-serif`,
    },
    h6: {
      fontFamily: `'Bebas Neue', sans-serif`,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: `'Anton', sans-serif`,
          letterSpacing: '2px',
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: 1,
          backgroundColor: "#000",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#333",
          },
        },
      },
    },
  },
});

export default theme;
