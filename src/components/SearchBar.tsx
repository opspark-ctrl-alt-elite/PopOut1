import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ vendors: any[]; events: any[] }>({
    vendors: [],
    events: [],
  });
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await axios.get("/search", { params: { query } });
      setResults(res.data);
      setShowResults(true);

      const { vendors, events } = res.data;
      if (vendors.length === 1) {
        navigate(`/vendor/${vendors[0].id}`);
      } else if (events.length === 1) {
        navigate(`/vendor/${events[0].vendor_id}`);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleSelect = (vendorId: string) => {
    navigate(`/vendor/${vendorId}`);
    setShowResults(false);
  };

  return (
    <Box width="100%" maxWidth={400} position="relative">
      <TextField
        fullWidth
        size="small"
        placeholder="Search vendors or events"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        onFocus={() => setShowResults(true)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {showResults && (results.vendors.length > 0 || results.events.length > 0) && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            mt: 1,
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          <List dense>
            {results.vendors.length > 0 && (
              <>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Vendors"
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      fontSize: 12,
                      px: 2,
                      pt: 1,
                    }}
                  />
                </ListItem>
                {results.vendors.map((vendor) => (
                  <ListItem
                    button
                    key={vendor.id}
                    onClick={() => handleSelect(vendor.id)}
                  >
                    <ListItemText primary={vendor.businessName} />
                  </ListItem>
                ))}
              </>
            )}

            {results.events.length > 0 && (
              <>
                <Divider />
                <ListItem disablePadding>
                  <ListItemText
                    primary="Events"
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      fontSize: 12,
                      px: 2,
                      pt: 1,
                    }}
                  />
                </ListItem>
                {results.events.map((event) => (
                  <ListItem
                    button
                    key={event.id}
                    onClick={() => handleSelect(event.vendor_id)}
                  >
                    <ListItemText
                      primary={event.title}
                      secondary={event.venue_name}
                    />
                  </ListItem>
                ))}
              </>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
