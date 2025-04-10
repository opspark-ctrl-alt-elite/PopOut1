import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  // useEffect(() => {

  // }, []);

  // make the player go upwards upon pressing the up button
  const pressUp = () => {
    setPlayer((prev: Player) => {
      return {
        x: prev.x,
        y: prev.y,
        xVel: prev.xVel,
        yVel: -5
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
        yVel: 5
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
        xVel: -5,
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
        xVel: 5,
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
