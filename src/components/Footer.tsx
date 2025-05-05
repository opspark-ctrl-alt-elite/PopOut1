import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  SvgIcon,
} from "@mui/material";
import { Facebook, Instagram } from "@mui/icons-material";

const XIcon: React.FC = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M2 2h4.7L12 9.3 17.3 2H22l-7.3 10L22 22h-4.7L12 14.7 6.7 22H2l7.3-10L2 2z" />
  </SvgIcon>
);

type Props = {
  user: { id: string; is_vendor: boolean } | null;
};

const Footer: React.FC<Props> = ({ user }) => (
  <Box
    component="footer"
    sx={{
      width: "100%",
      py: 4,
      px: 2,
      mt: "auto",          // <- let flexbox push it down
      backgroundColor: "#f0f0f0",
      borderTop: "1px solid #ddd",
    }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={2} justifyContent="center">
        {user && !user.is_vendor && (
          <Grid item xs={12} sm={6} textAlign="center">
            <Typography variant="h6" gutterBottom>
              Want to host pop‑ups?
            </Typography>
            <Button
              component={Link}
              to="/vendor-signup"
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                backgroundColor: "#000",
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              Become a Vendor
            </Button>
          </Grid>
        )}

        {user && (
          <Grid item xs={12} sm={6} textAlign="center">
            <Typography variant="h6" gutterBottom>
              Just for fun?
            </Typography>
            <Button
              component={Link}
              to="/game"
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                backgroundColor: "#000",
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              Play Game
            </Button>
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <IconButton aria-label="facebook">
          <Facebook />
        </IconButton>
        <IconButton aria-label="x">
          <XIcon />
        </IconButton>
        <IconButton aria-label="instagram">
          <Instagram />
        </IconButton>
      </Box>
    </Container>
  </Box>
);

export default Footer;
