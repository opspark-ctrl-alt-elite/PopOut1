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
          <br />
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeA1PcGaTWNTv-KYlQ_ZcYTqKbmbyNeSUi8Fp56-SQ6N5QEzA/viewform"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "1rem" }}>
              Become A Vendor
            </button>
          </a>
        </div>
      ) : (
        <a href="/auth/google">Login with Google</a>
      )}
    </div>
  );
};

export default Home;
