import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import GameControls from "./GameControls";

import {
  Box,
  Modal,
  Button,
  Container,
  Typography,
} from "@mui/material";

import {
  Home
} from "@mui/icons-material"

type Mover = {
  type: string;
  x: number;
  y: number;
  xVel: number;
  yVel: number;
};

type Captcha = {
  beatCaptcha: boolean;
  wantsToBeVendor: boolean;
}

type Props = {
  captcha: Captcha;
  setCaptcha: Function;
};

const GameApp: React.FC<Props> = ({ captcha, setCaptcha }) => {

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

  // create state to determine if the ending modal should be open or closed
  const [open, setOpen] = useState(false);

  // create state to represent the player
  const [player, setPlayer] = useState<Mover>({
    type: "player",
    x: 0,
    y: 0,
    xVel: 0,
    yVel: 0,
  });

  // create state to represent the target
  const [target, setTarget] = useState<Mover>({
    type: "target",
    x: 200,
    y: 200,
    xVel: 0,
    yVel: 0,
  });

  // create state to represent the current score
  const [score, setScore] = useState(0);

  // create state to represent the current time
  const [time, setTime] = useState(0);

  // repeatedly call masterUpdate without making current states unusable in said function
  useEffect(() => {
    // set the time to a different number after 30 ms to call this useEffect again after 30 ms
    setTimeout(() => {
      setTime(prev => {
        // prevent integer overflow
        if (prev > 99) {
          return 0;
        }
        return prev + 1;
      });
    }, 30);
    // update all state values where necessary each frame
    masterUpdate();
  }, [ time ]);



  // check for when captcha is updated
  useEffect(() => {
    // if someone who wanted to be a vendor beat the game
    if (captcha.beatCaptcha && captcha.wantsToBeVendor) {
      // then redirect them to the vendor signup form
      navigate('/vendor-signup');
    }
  }, [ captcha ])

  // update every element on every "frame" to keep things consistent
  const masterUpdate = () => {

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

      // numbers to set the target's velocities to
      let xVel = prev.xVel;
      let yVel = prev.yVel;

      // make target begin moving in random direction upon new round after a round/score of 5
      if ((xVel === 0 || yVel === 0) && score > 5) {
        if (Math.floor(Math.random() * 2)) {
          xVel = 5;
        } else {
          xVel = -5;
        }
        if (Math.floor(Math.random() * 2)) {
          yVel = 5;
        } else {
          yVel = -5;
        }
      }

      // set up replacement object
      const replacement = {
        type: prev.type,
        x: prev.x + prev.xVel,
        y: prev.y + prev.yVel,
        xVel,
        yVel
      };

      return checkOutOfBounds(replacement, gameBoardWidth, gameBoardHeight, targetWidth, targetHeight);
    })


    // update the player's position using said player's current position and velocity
    setPlayer(prev => {

      // set up replacement object
      const replacement = {
        type: prev.type,
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
            // check if this is for a captcha
            if (captcha.wantsToBeVendor && !captcha.beatCaptcha) {
              // if so, then set captcha.beatCaptcha to true and later redirect back to the vendor signup form
              setCaptcha({
                beatCaptcha: true,
                wantsToBeVendor: true
              });
            } else {
              // else, display winning modal
              setOpen(true);
            }
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
          type: "target",
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

      // set new state for player
      return checkOutOfBounds(replacement, gameBoardWidth, gameBoardHeight, playerWidth, playerHeight);
    })
  }

  // takes in an element object with x (left) and y (top) properties and makes sure that the number values
  // of said properties stay within the game board
  const checkOutOfBounds = (replacement: Mover, gameBoardWidth: number, gameBoardHeight: number, entWidth: number, entHeight: number) => {
    // prevent going out of bounds
      // horizontal handling
      if (replacement.x < 0) {
        replacement.x = 0;
        if (replacement.type === "target" && score > 5) {
          replacement.xVel = 5;
        }
      } else if (replacement.x + entWidth > gameBoardWidth) {
        replacement.x = gameBoardWidth - entWidth;
        if (replacement.type === "target" && score > 5) {
          replacement.xVel = -5;
        }
      }

      // vertical handling
      if (replacement.y < 0) {
        replacement.y = 0;
        if (replacement.type === "target" && score > 5) {
          replacement.yVel = 5;
        }
      } else if (replacement.y + entHeight > gameBoardHeight) {
        replacement.y = gameBoardHeight - entHeight;
        if (replacement.type === "target" && score > 5) {
          replacement.yVel = -5;
        }
      }

      // set new state for player
      return replacement;
  }

  return (
    <Container>
      <Typography variant="h5">{captcha.wantsToBeVendor ? "Captcha" : "Touchin' Squares"}</Typography>
      <Typography variant="body2">Make the big blue square touch the small red square.</Typography>
      <Typography>Score: {score} / 3</Typography>
      <Box ref={boardRef} id="gameBoard" position="relative" sx={{ mb: 3, borderStyle: "solid", borderWidth: "5px", backgroundImage: "url(https://th.bing.com/th/id/R.902afe9a18421368475057465511b326?rik=85WCbPfcOuo2BQ&riu=http%3a%2f%2fth24.st.depositphotos.com%2f1007566%2f8128%2fv%2f450%2fdepositphotos_81285524-stock-illustration-gps-map-design.jpg&ehk=AhpNDRA8uaY7bt7XNG%2fwu9jalFdKwuQew0Nkqrs3meY%3d&risl=&pid=ImgRaw&r=0)", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", width: "lg", height: "60vh" }}>
        <Box ref={targetRef} id="targetElement" position="absolute" left={target.x} top={target.y} sx={{ borderStyle: "solid", backgroundImage: "url(https://www.pngplay.com/wp-content/uploads/9/Map-Marker-Transparent-File-175x279.png)", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", width: "5vw", maxWidth: "70px", minWidth: "25px", aspectRatio: "1/1" }}></Box>
        <Box ref={playerRef} id="playerElement" position="absolute" left={player.x} top={player.y} sx={{ borderStyle: "solid", backgroundImage: "url(https://icon-library.com/images/tourist-icon/tourist-icon-23.jpg)", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", width: "8vw", maxWidth: "100px", minWidth: "40px", aspectRatio: "1/1" }}></Box>
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
    </Container>
  );
};

export default GameApp;
