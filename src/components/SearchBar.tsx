import React, { useState, useEffect, useRef } from "react";
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
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Fade } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useDebouncedValue = (value: string, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [results, setResults] = useState<{ vendors: any[]; events: any[] }>({
    vendors: [],
    events: [],
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults({ vendors: [], events: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get("/search", {
          params: { query: debouncedQuery },
        });
        setResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("search fail", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (vendorId: string) => {
    navigate(`/vendor/${vendorId}`);
    setShowResults(false);
  };

  return (
    <Box ref={containerRef} width="75%" maxWidth={400} position="relative">
      <TextField
        fullWidth
        size="small"
        placeholder="Search vendors or popups..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setQuery(query)}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            fontSize: "0.85rem",
            fontFamily: "'Inter', sans-serif",
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "20px",
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ccc",
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ccc",
          },
        }}
      />

      {showResults && loading && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 10,
            width: "75%",
            mt: 1,
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "12px",
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

{showResults && loading && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            mt: 1,
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "12px",
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      <Fade
        in={
          showResults &&
          !loading &&
          (results.vendors.length > 0 || results.events.length > 0)
        }
      >
        <Box
          sx={{
            position: "absolute",
            zIndex: 1300,
            width: "100%",
            mt: 1,
            maxHeight: 300,
            overflowY: "auto",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Paper elevation={0}>
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
                      key={vendor.id}
                      onClick={() => handleSelect(vendor.id)}
                      sx={{
                        cursor: "pointer",
                        px: 2,
                        py: 1,
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.05)",
                        },
                      }}
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
                      key={event.id}
                      onClick={() => handleSelect(event.vendor_id)}
                      sx={{
                        cursor: "pointer",
                        px: 2,
                        py: 1,
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.05)",
                        },
                      }}
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
        </Box>
      </Fade>
    </Box>
  );
};

export default SearchBar;