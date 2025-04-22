import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await axios.get("/search", { params: { query } });
      const { vendors = [], events = [] } = response.data;

      if (vendors.length === 1) {
        navigate(`/vendor/${vendors[0].id}`);
      } else if (events.length === 1) {
        navigate(`/vendor/${events[0].vendor_id}`);
      } else {
        console.log("no matches found", { vendors, events });
      }
    } catch (err) {
      console.error("search fail", err);
    }
  };

  return (
    <Box width="100%" maxWidth={400}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search vendors or events"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
    </Box>
  );
};

export default SearchBar;
