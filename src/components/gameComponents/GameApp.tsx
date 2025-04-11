import React, { useEffect, useState, useRef } from "react";
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

// type Board = {
//   height: number;
//   width: number;
// }

type Player = {
  x: number;
  y: number;
  xVel: number;
  yVel: number;
  // size?: number;
};

const GameApp: React.FC = () => {

//   // create state to represent the game board
//   const [board, setBoard] = useState<Board>({
//     height: document.documentElement.clientHeight,
//     width: document.documentElement.clientWidth
//   });

// console.log(document.documentElement.clientWidth)

/*

function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right
    );
}

*/


  // create state to represent the player
  const [player, setPlayer] = useState<Player>({
    x: 0,
    y: 0,
    xVel: 0,
    yVel: 0,
    // size: 45
  });

  //console.log(player);

  // create state to represent the target
  const [target, setTarget] = useState<Player>({
    x: 200,
    y: 200,
    xVel: 0,
    yVel: 0,
    // size: 30
  });

  // create state to represent the current score
  const [score, setScore] = useState(0);

  // get a reference to the current player HTML element
  let playerElement = document.getElementById("playerElement");

  // create references to the gameBoard's height and width
  let playerHeight = playerElement?.clientHeight ? playerElement?.clientHeight : 50;
  let playerWidth = playerElement?.clientWidth ? playerElement?.clientWidth : 50;

  // create an interval only on the first time this component is rendered
  useEffect(() => {

    // call the movePlayer function every 30 ms
    setInterval(movePlayer, 30);
  }, []);

  // update the player's position using said player's current position and velocity
  const movePlayer = () => {
    console.log("fug");
    setPlayer(prev => {

      //TODO: just gotta replace the numbers with actaul widths and stuff and make the elements get their widths off of "5vh" or something of the like (and use useRef instead of getElementById)
      
      console.log(prev.x, prev.y, target.x, target.y)

      // check if the player has touched the target
      if (!(target.y >= prev.y + 50 || target.x + 30 <= prev.x || target.y + 30 <= prev.y || target.x >= prev.x + 50)) {
          setScore(prev => prev + 1);
      }

      /*
      rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right
      */

      // get a reference to the current game board HTML element
  let gameBoard = document.getElementById("gameBoard");

  // create references to the gameBoard's height and width
  let gameBoardHeight = gameBoard?.clientHeight ? gameBoard?.clientHeight : 448;
  let gameBoardWidth = gameBoard?.clientWidth ? gameBoard?.clientWidth : 600;

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
      <Typography>Score: {score} / 10</Typography>
      <Box id="gameBoard" position="relative" sx={{ mb: 3, backgroundColor: "gray", width: "lg", height: "70vh" }}>
        {/* <GamePlayer /> */}
        <Box id="targetElement" position="absolute" left={target.x} top={target.y} sx={{ backgroundColor: "red", width: 30, height: 30 }}></Box>
        <Box id="playerElement" position="absolute" left={player.x} top={player.y} sx={{ backgroundColor: "blue", width: 50, height: 50 }}></Box>
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
