import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Map from "./components/Map";
// import { MapRounded } from "@mui/icons-material";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("err fetching user");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.id) {
          setUser(data);
        }
      })
      .catch((err) => {
        // console.error(err);
      });
  }, []);

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

      <Routes>
        <Route path="/map" element={<Map />} />
      </Routes>
    </div>
  );
};

export default App;
