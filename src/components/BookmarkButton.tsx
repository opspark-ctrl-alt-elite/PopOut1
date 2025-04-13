import React, { useState } from "react";
import axios from "axios";
import { IconButton, Tooltip } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

type Props = {
  userId: string;
  eventId: string;
  isBookmarked: boolean;
  onToggle: () => void;
};

const BookmarkButton: React.FC<Props> = ({
  userId,
  eventId,
  isBookmarked,
  onToggle,
}) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleToggle = () => {
    const url = `/api/users/${userId}/${bookmarked ? "unbookmark" : "bookmark"}/${eventId}`;
    const method = bookmarked ? "delete" : "post";

    axios[method](url)
      .then(() => {
        setBookmarked(!bookmarked);
        onToggle(); // refresh bookmarks if needed
      })
      .catch((err) => {
        console.error("Bookmark toggle failed", err);
      });
  };

  return (
    <>
      {console.log("Rendering BookmarkButton", { userId, eventId, bookmarked })}
      <Tooltip title={bookmarked ? "Remove Bookmark" : "Add Bookmark"}>
        <IconButton onClick={handleToggle} color="primary">
          {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      </Tooltip>
    </>
  );
};

export default BookmarkButton;