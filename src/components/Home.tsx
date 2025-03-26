// src/components/Home.tsx
import React from "react";
import { Link } from "react-router-dom";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Props = {
  user: User | null;
};

const Home: React.FC<Props> = ({ user }) => {
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
          <Link to="/map">View Map</Link>
        </div>
      ) : (
        <a href="/auth/google">Login with Google</a>
      )}
    </div>
  );
};

export default Home;
