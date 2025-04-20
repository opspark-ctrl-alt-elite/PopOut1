import React, { useEffect } from "react";

import {
  Button,
  Container,
  Stack,
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
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: prev.xVel,
        yVel: -10
      };
    });
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
  }

  // make the player go downwards upon pressing the down button
  const pressDown = () => {
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: prev.xVel,
        yVel: 10
      };
    });
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
  }

  // make the player go leftwards upon pressing the left button
  const pressLeft = () => {
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: -10,
        yVel: prev.yVel
      };
    });
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
  }

  // make the player go rightwards upon pressing the right button
  const pressRight = () => {
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: 10,
        yVel: prev.yVel
      };
    });
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
  }

  return (
    <Container>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <Button variant="contained" onMouseDown={pressUp} onMouseUp={unPressUp} onMouseOut={unPressUp}>
          <ArrowDropUp />
        </Button>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
          <Button variant="contained" onMouseDown={pressLeft} onMouseUp={unPressLeft} onMouseOut={unPressLeft}>
            <ArrowLeft />
          </Button>
          <Button variant="contained" onMouseDown={pressDown} onMouseUp={unPressDown} onMouseOut={unPressDown}>
            <ArrowDropDown />
          </Button>
          <Button variant="contained" onMouseDown={pressRight} onMouseUp={unPressRight} onMouseOut={unPressRight}>
            <ArrowRight />
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default GameControls;
