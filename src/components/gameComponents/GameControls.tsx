import React, { useState, useEffect } from "react";

import {
  Button,
  Container,
  Stack,
  Typography
} from "@mui/material";

import {
  ArrowDropUp,
  ArrowDropDown,
  ArrowLeft,
  ArrowRight
} from "@mui/icons-material"

type Player = {
  x: number;
  y: number;
  xVel: number;
  yVel: number;
};

type Props = {
  player: Player;
  setPlayer: Function;
};

const GameControls: React.FC<Props> = ({ player, setPlayer }) => {

  // create states to handle button arrow colors
  const [upColor, setUpColor] = useState("primary");
  const [downColor, setDownColor] = useState("primary");
  const [leftColor, setLeftColor] = useState("primary");
  const [rightColor, setRightColor] = useState("primary");

  // register event listeners for keyboard controls
  useEffect(() => {

    // register an event listener that causes the handleKeyPress function to run whenever a key is pressed
    window.addEventListener('keydown', handleKeyPress);

    // register an event listener that causes the handleKeyUnPress function to run whenever a key is unpressed
    window.addEventListener('keyup', handleKeyUnPress);

    // return function to clean up the event listeners when the component is unmounted via. a page change
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUnPress);
    };
  }, [ player ]);

  // allow for WASD and arrow key control when keys are pressed
  const handleKeyPress = ( e: { key: string; } ) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        pressUp();
        break;
      case 'ArrowDown':
      case 's':
        pressDown();
        break;
      case 'ArrowLeft':
      case 'a':
        pressLeft();
        break;
      case 'ArrowRight':
      case 'd':
        pressRight();
        break;
    }
  }
  // allow for WASD and arrow key control when keys are UNpressed
  const handleKeyUnPress = ( e: { key: string; } ) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        unPressUp();
        break;
      case 'ArrowDown':
      case 's':
        unPressDown();
        break;
      case 'ArrowLeft':
      case 'a':
        unPressLeft();
        break;
      case 'ArrowRight':
      case 'd':
        unPressRight();
        break;
    }
  }

  // make the player go upwards upon pressing the up button
  const pressUp = () => {
    // move player
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: prev.xVel,
        yVel: -10
      };
    });
    // set up button arrow color
    setUpColor("cyan");
  }

  // stop upwards movement if up button is unpressed
  const unPressUp = () => {
    // check if player is currently going up
    if (player.yVel < 0) {
      // set the player's vertical velocity to 0 if so
      setPlayer((prev: Player) => {
        return {
          x: prev.x,
          y: prev.y,
          xVel: prev.xVel,
          yVel: 0
        };
      });
    }
    // set up button arrow color
    setUpColor("primary");
  }

  // make the player go downwards upon pressing the down button
  const pressDown = () => {
    // move player
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: prev.xVel,
        yVel: 10
      };
    });
     // set down button arrow color
     setDownColor("cyan");
  }

  // stop downwards movement if down button is unpressed
  const unPressDown = () => {
    // check if player is currently going down
    if (player.yVel > 0) {
      // set the player's vertical velocity to 0 if so
      setPlayer((prev: Player) => {
        return {
          x: prev.x,
          y: prev.y,
          xVel: prev.xVel,
          yVel: 0
        };
      });
    }
    // set down button arrow color
    setDownColor("primary");
  }

  // make the player go leftwards upon pressing the left button
  const pressLeft = () => {
    // move player
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: -10,
        yVel: prev.yVel
      };
    });
    // set left button arrow color
    setLeftColor("cyan");
  }

  // stop leftwards movement if left button is unpressed
  const unPressLeft = () => {
    // check if player is currently going left
    if (player.xVel < 0) {
      // set the player's horizontal velocity to 0 if so
      setPlayer((prev: Player) => {
        return {
          x: prev.x,
          y: prev.y,
          xVel: 0,
          yVel: prev.yVel
        };
      });
    }
    // set left button arrow color
    setLeftColor("primary");
  }

  // make the player go rightwards upon pressing the right button
  const pressRight = () => {
    // move player
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: 10,
        yVel: prev.yVel
      };
    });
    // set right button arrow color
    setRightColor("cyan");
  }

  // stop rightwards movement if right button is unpressed
  const unPressRight = () => {
    // check if player is currently going right
    if (player.xVel > 0) {
      // set the player's horizontal velocity to 0 if so
      setPlayer((prev: Player) => {
        return {
          x: prev.x,
          y: prev.y,
          xVel: 0,
          yVel: prev.yVel
        };
      });
    }
    // set right button arrow color
    setRightColor("primary");
  }

  return (
    <Container>
      <Stack sx={{ alignItems: "center" }}>
        <Stack sx={{ alignItems: "center" }}>
          <Typography>
            W
          </Typography>
          <Button variant="contained" onMouseDown={pressUp} onTouchStart={pressUp} onMouseUp={unPressUp} onMouseOut={unPressUp} onTouchEnd={unPressUp} onTouchCancel={unPressUp} sx={{color: upColor}}>
            <ArrowDropUp/>
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
          <Stack sx={{ alignItems: "center" }}>
            <Typography>
              A
            </Typography>
            <Button variant="contained" onMouseDown={pressLeft} onTouchStart={pressLeft} onMouseUp={unPressLeft} onMouseOut={unPressLeft} onTouchEnd={unPressLeft} onTouchCancel={unPressLeft} sx={{color: leftColor}}>
              <ArrowLeft />
            </Button>
          </Stack>
          <Stack sx={{ alignItems: "center" }}>
            <Typography>
              S
            </Typography>
            <Button variant="contained" onMouseDown={pressDown} onTouchStart={pressDown} onMouseUp={unPressDown} onMouseOut={unPressDown} onTouchEnd={unPressDown} onTouchCancel={unPressDown} sx={{color: downColor}}>
              <ArrowDropDown />
            </Button>
          </Stack>
          <Stack sx={{ alignItems: "center" }}>
            <Typography>
              D
            </Typography>
            <Button variant="contained" onMouseDown={pressRight} onTouchStart={pressRight} onMouseUp={unPressRight} onMouseOut={unPressRight} onTouchEnd={unPressRight} onTouchCancel={unPressRight} sx={{color: rightColor}}>
              <ArrowRight />
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default GameControls;
