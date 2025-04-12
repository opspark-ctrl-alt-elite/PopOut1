import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import GamePlayer from "./GamePlayer";
import GameControls from "./GameControls";
import axios from "axios";

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

  // create navigate function to allow for on-demand redirects to different pages
  const navigate = useNavigate();

  // create a style for the box that the modal holds
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

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

  // create state to determine if the ending modal should be open or closed
  const [open, setOpen] = useState(false);

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

    // call the masterUpdate function every 30 ms
    setInterval(masterUpdate, 30);
  }, []);

  // update every element on every "frame" to keep things consistent
  const masterUpdate = () => {
    // console.log("fug");

    // console.log(boardRef);
    // console.log(targetRef);
    // console.log(playerRef);

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

    // make sure that the target is still inbounds
    setTarget(prev => {
      return checkOutOfBounds(prev, gameBoardWidth, gameBoardHeight, targetWidth, targetHeight);
    })


    // update the player's position using said player's current position and velocity
    setPlayer(prev => {

      //TODO: just gotta replace the numbers with actaul widths and stuff and make the elements get their widths off of "5vh" or something of the like (and use useRef instead of getElementById)
      // console.log(score)


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
        setScore(prev => {
          prev++;

          // if the score is at the goal score
          if (prev === 3) {
            // then give access to app and display winning modal
            setOpen(true);
          }
          return prev;
        });

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
      return checkOutOfBounds(replacement, gameBoardWidth, gameBoardHeight, playerWidth, playerHeight);
    })
  }

  // takes in an element object with x (left) and y (top) properties and makes sure that the number values
  // of said properties stay within the game board
  const checkOutOfBounds = (replacement: Player, gameBoardWidth: number, gameBoardHeight: number, entWidth: number, entHeight: number) => {
    // prevent going out of bounds
      // horizontal handling
      if (replacement.x < 0) {
        replacement.x = 0;
      } else if (replacement.x + entWidth > gameBoardWidth) {
        replacement.x = gameBoardWidth - entWidth;
      }

      // vertical handling
      if (replacement.y < 0) {
        replacement.y = 0;
      } else if (replacement.y + entHeight > gameBoardHeight) {
        replacement.y = gameBoardHeight - entHeight;
      }

      // set new state for player
      return replacement;
  }

  return (
    <Container>
      <Typography>Score: {score} / 3</Typography>
      <Box ref={boardRef} id="gameBoard" position="relative" sx={{ mb: 3, backgroundColor: "gray", width: "lg", height: "70vh" }}>
        {/* <GamePlayer /> */}
        <Box ref={targetRef} id="targetElement" position="absolute" left={target.x} top={target.y} sx={{ backgroundColor: "red", width: "5vh", height: "5vh" }}></Box>
        <Box ref={playerRef} id="playerElement" position="absolute" left={player.x} top={player.y} sx={{ backgroundColor: "blue", width: "8vh", height: "8vh" }}></Box>
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
      <Modal open={open}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Good Job!
          </Typography>
          <Button
            onClick={() => {
              navigate('/');
            }}
            variant="outlined"
          >
            Go To Home Page
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
            }}
            variant="outlined"
          >
            Return To Game
          </Button>
        </Box>
      </Modal>
      {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/B7gGacb8cO4"></iframe> */}
    </Container>
  );
};

export default GameApp;
