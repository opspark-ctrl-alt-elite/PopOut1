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
  const [player, setPlayer] = useState<Player>({
    x: 0,
    y: 0,
    xVel: 0,
    yVel: 0
  });

  useEffect(() => {
    setInterval(movePlayer, 20);
  }, []);

  const movePlayer = () => {
    console.log("fug");
    setPlayer(prev => {
      return {
        x: prev.x + prev.xVel,
        y: prev.y + prev.yVel,
        xVel: prev.xVel,
        yVel: prev.yVel
      };
    })
  }

  // const unPressVert = () => {
  //   setPlayer(prev => {
  //     prev.yVel = 0;
  //     return prev;
  //   });
  // }

  // const unPressHori = () => {
  //   setPlayer(prev => {
  //     prev.xVel = 0;
  //     return prev;
  //   });
  // }

  // const pressUp = () => {
  //   setPlayer(prev => {
  //     prev.yVel = 5;
  //     return prev;
  //   });
  // }

  // const pressDown = () => {
  //   setPlayer(prev => {
  //     prev.yVel = -5;
  //     return prev;
  //   });
  // }

  // const pressLeft = () => {
  //   setPlayer(prev => {
  //     prev.xVel = -5;
  //     return prev;
  //   });
  // }

  // const pressRight = () => {
  //   setPlayer(prev => {
  //     prev.xVel = 5;
  //     return prev;
  //   });
  // }

  return (
    <Container>
      <Box sx={{ mb: 3, backgroundColor: "gray", width: "lg", height: "50vh" }}>
        <GamePlayer />
        <Box position="relative" left={player.x} top={player.y} sx={{ backgroundColor: "blue", width: 50, height: 50 }}></Box>
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
