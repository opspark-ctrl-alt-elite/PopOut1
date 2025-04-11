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

  // initiate references to the important elements
  const boardRef = useRef(null);
  const targetRef = useRef(null);
  const playerRef = useRef(null);

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
      
      console.log(boardRef);
      console.log(targetRef);
      console.log(playerRef);

      // get a reference to the current game board HTML element
      let gameBoard = boardRef.current !== undefined ? boardRef.current : document.getElementById("gameBoard");

      // create references to the gameBoard's height and width
      let gameBoardHeight = gameBoard?.clientHeight !== undefined ? gameBoard?.clientHeight : 448;
      let gameBoardWidth = gameBoard?.clientWidth !== undefined ? gameBoard?.clientWidth : 600;

      // get a reference to the current player HTML element
      let playerElement = playerRef.current !== undefined ? playerRef.current : document.getElementById("playerElement");

      // create references to the player's height and width
      let playerHeight = playerElement?.clientHeight !== undefined ? playerElement?.clientHeight : 50;
      let playerWidth = playerElement?.clientWidth !== undefined ? playerElement?.clientWidth : 50;

      // get a reference to the current target HTML element
      let targetElement = targetRef.current !== undefined ? targetRef.current : document.getElementById("targetElement");

      // create references to the target's height, width, and location
      let targetHeight = targetElement?.clientHeight !== undefined ? targetElement?.clientHeight : 50;
      let targetWidth = targetElement?.clientWidth !== undefined ? targetElement?.clientWidth : 50;
      let targetX = targetElement?.offsetLeft !== undefined ? targetElement?.offsetLeft : 200;
      let targetY = targetElement?.offsetTop !== undefined ? targetElement?.offsetTop : 200;

      ////////console.log(prev.x, prev.y, target.x, target.y)

      // set up replacement object
      const replacement = {
        x: prev.x + prev.xVel,
        y: prev.y + prev.yVel,
        xVel: prev.xVel,
        yVel: prev.yVel
      };

      // check if the player has touched the target
      if (!(targetY >= prev.y + playerHeight || targetX + targetWidth <= prev.x || targetY + targetHeight <= prev.y || targetX >= prev.x + playerWidth)) {

        // if so, then increase the score by 1
        setScore(prev => prev + 1);

        // // 50/50 chance of the new target location either being unable to be on the very
        // // left of the board or the very top of the board. (Makes sure that player doesn't
        // // instantly touch the target.)
        // if (Math.floor(Math.random() * 1)) {

        // }

        // create new x and y values for randomly placing the target somewhere else on the board
        let newTargetCoords: number[] = [Math.floor(Math.random() * (gameBoardWidth - targetWidth)), Math.floor(Math.random() * (gameBoardHeight - targetHeight))];

        // make sure that the new location isn't the same as the player's starting area
        if (newTargetCoords[0] <= playerWidth && newTargetCoords[1] <= playerHeight) {
          // if the target and player would already be touching, then reassign the newTargetCoords to new random coords
          // that don't include any x or y coords that would intersect with the x or y coords of the player's starting area
          newTargetCoords[0] = Math.floor(Math.random() * (gameBoardWidth - targetWidth - playerWidth)) + playerWidth;
          newTargetCoords[1] = Math.floor(Math.random() * (gameBoardHeight - targetHeight - playerHeight)) + playerHeight;
        }

        // randomly place the target somewhere else on the board
        setTarget({
          x: newTargetCoords[0],
          y: newTargetCoords[1],
          xVel: 0,
          yVel: 0
        })

        // bring the player back to the top-left of the board
        replacement.x = 0;
        replacement.y = 0;
        return replacement;
      }

      /*
      rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right
      */

      ////////console.log("inMovePlayer", playerHeight, playerWidth, gameBoardHeight, gameBoardWidth);

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
      <Typography>Score: {score} / 3</Typography>
      <Box ref={boardRef} id="gameBoard" position="relative" sx={{ mb: 3, backgroundColor: "gray", width: "lg", height: "70vh" }}>
        {/* <GamePlayer /> */}
        <Box ref={targetRef} id="targetElement" position="absolute" left={target.x} top={target.y} sx={{ backgroundColor: "red", width: 30, height: 30 }}></Box>
        <Box ref={playerRef} id="playerElement" position="absolute" left={player.x} top={player.y} sx={{ backgroundColor: "blue", width: 50, height: 50 }}></Box>
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
