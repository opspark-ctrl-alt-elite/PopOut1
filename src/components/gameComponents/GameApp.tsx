import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GamePlayer from "./GamePlayer";
import GameControls from "./GameControls";

import {
  Box,
  Modal,
  Button,
  Container,
  Tooltip,
  IconButton,
  Stack,
  Typography,
  Card,
  Chip,
  Grid2,
  TextField,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
} from "@mui/material";

import {
  Home
} from "@mui/icons-material"

type Player = {
  x: number;
  y: number;
  xVel: number;
  yVel: number;
};

const GameApp: React.FC = () => {

  // create state to represent the player
  const [player, setPlayer] = useState<Player>({
    x: 0,
    y: 0,
    xVel: 0,
    yVel: 0
  });

  // get a reference to the current player HTML element
  let playerElement = document.getElementById("playerElement");

  // create references to the gameBoard's height and width
  let playerHeight = playerElement?.clientHeight ? playerElement?.clientHeight : 50;
  let playerWidth = playerElement?.clientWidth ? playerElement?.clientWidth : 50;

  // get a reference to the current game board HTML element
  let gameBoard = document.getElementById("gameBoard");

  // create references to the gameBoard's height and width
  let gameBoardHeight = gameBoard?.clientHeight ? gameBoard?.clientHeight : 448;
  let gameBoardWidth = gameBoard?.clientWidth ? gameBoard?.clientWidth : 448;

  console.log(playerHeight, playerWidth, gameBoardHeight, gameBoardWidth);

  // create an interval only on the first time this component is rendered
  useEffect(() => {

    // call the movePlayer function every 30 ms
    setInterval(movePlayer, 30);
  }, []);

  // update the player's position using said player's current position and velocity
  const movePlayer = () => {
    console.log("fug");
    setPlayer(prev => {

      // set up replacement object
      const replacement = {
        x: prev.x + prev.xVel,
        y: prev.y + prev.yVel,
        xVel: prev.xVel,
        yVel: prev.yVel
      };

      console.log("inMovePlayer", playerHeight, playerWidth, gameBoardHeight, gameBoardWidth);

      // prevent going out of bounds
      // horizontal handling
      if (replacement.x < 0) {
        replacement.x = 0;
      } else if (replacement.x + playerWidth > gameBoardWidth) {
        replacement.x = gameBoardWidth - playerWidth;
      }

      // vertical handling
      if (replacement.y < 0) {
        replacement.y = 0;
      } else if (replacement.y + playerHeight > gameBoardHeight) {
        replacement.y = gameBoardHeight - playerHeight;
      }

      // set new state for player
      return replacement;
    })
  }

  return (
    <Container>
      <Box id="gameBoard" sx={{ mb: 3, backgroundColor: "gray", width: "lg", height: "70vh" }}>
        {/* <GamePlayer /> */}
        <Box id="playerElement" position="relative" left={player.x} top={player.y} sx={{ backgroundColor: "blue", width: 50, height: 50 }}></Box>
      </Box>
      <Box>
        <GameControls player={player} setPlayer={setPlayer}/>
      </Box>
      <Link to="/">
        <Button
          variant="contained"
          sx={{ mt: 3, backgroundColor: "primary" }}
          startIcon={<Home />}
        >
          Back to Home
        </Button>
      </Link>
    </Container>
  );
};

export default GameApp;
