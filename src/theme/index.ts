import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    background: {
      // default: "#f7f7f7",
      // default: "#fefefe",
      default: "#fbfbfb",

    },
  },
  typography: {
    fontFamily: `'Inter', sans-serif`,
    h3: {
      fontFamily: `'Bebas Neue', sans-serif`,
    },
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
  navItem: {
    fontFamily: `'Inter', sans-serif`,
    fontSize: "0.85rem",
    fontWeight: 400,
    color: "#fff",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // fontFamily: `'IBM Plex Sans', sans-serif`,
          // fontFamily: `'Work Sans', sans-serif`,
          // fontFamily: `'Barlow Semi Condensed', sans-serif`,
          fontFamily: `'DM Sans', sans-serif`,
          letterSpacing: "2px",
          textTransform: "none",
          borderRadius: 8,
          boxShadow: 1,
          backgroundColor: "#212121",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#333",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: `'Inter', sans-serif`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: `'Inter', sans-serif`,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
