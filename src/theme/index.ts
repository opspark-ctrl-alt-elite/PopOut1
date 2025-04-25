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

    // ellipsis
    bodyEllipsis: {
      fontFamily: `'Inter', sans-serif`,
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 3,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal',
    },
    captionEllipsis: {
      fontFamily: `'Inter', sans-serif`,
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal',
    }
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-multiline': {
            '& textarea': {
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              maxHeight: 'calc(4 * 1.5em)',
            },
            '&.Mui-focused textarea': {
              WebkitLineClamp: 'unset',
              overflow: 'auto',
            }
          }
        }
      }
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: 'bodyEllipsis' },
          style: {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
          }
        },
        {
          props: { variant: 'captionEllipsis' },
          style: {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
          }
        }
      ]
    }
  },
});

// typeScript module augmentations
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    bodyEllipsis: true;
    captionEllipsis: true;
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    navItem: {
      fontFamily: string;
      fontSize: string;
      fontWeight: number;
      color: string;
    };
  }
  interface ThemeOptions {
    navItem?: {
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: number;
      color?: string;
    };
  }
}

theme = responsiveFontSizes(theme);

export default theme;
