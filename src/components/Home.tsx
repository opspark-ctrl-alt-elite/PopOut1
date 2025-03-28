import React from "react";
import { Link } from "react-router-dom";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Vendors = {
  id: string;
  businessName: string;
  email: string;
  profilePicture?: string;
  description: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}[];

type Props = {
  user: User | null;
  vendors: Vendors | null;
};

const Home: React.FC<Props> = ({ user, vendors }) => {
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
          <Link to="/userprofile">View User Profile</Link>
          <br />
          <Link to="/vendorprofile">View Vendor Profile</Link>
          <br />
          <Link to="/vendor-signup">Become A Vendor</Link>
        </div>
      ) : (
        <a href="/auth/google">Login with Google</a>
      )}
    </div>
  );
};

export default Home;
