import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Map from "./components/Map";
import Home from "./components/Home";

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
        // console.error( err);
      });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home user={user} />} />
      <Route path="/map" element={<Map />} />
    </Routes>
  );
};

export default App;
