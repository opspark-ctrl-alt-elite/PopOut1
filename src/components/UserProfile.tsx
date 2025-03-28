// src/components/Home.tsx
import React from "react";
import { Link } from "react-router-dom";

import {
  Box,
  Modal,
  Button,
  
} from "@mui/material";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Props = {
  user: User | null;
};

const UserProfile: React.FC<Props> = ({ user }) => {
  return (
    <div>
      <h1>PopOut</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}</p>
          {user.profile_picture && (
            <img src={user.profile_picture} alt="Profile" width={50} />
          )}
          <br />
          <a href="/auth/logout">Logout</a>
          <br />
          <Link to="/">Home</Link>
          <br />
          <Link to="/vendorprofile">View Vendor Profile</Link>
        </div>
      ) : (
        // <a href="/auth/google">Login with Google</a>
        <div>no user found</div>
      )}
    </div>
  );
};

export default UserProfile;
