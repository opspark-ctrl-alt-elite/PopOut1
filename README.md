# PopOut

## Description
Hey you! Do you want to experience the world! Do you want to find out about and go to events in and around your area and beyond? PopOut allows you to find, view, and rate events (or as we call them, "popups") hosted by a variety of vendors. You can search for popups in your area and filter popups by your desired categories to find exactly what you want! Do you want to host a popup? You can sign up as a vendor to allow people to find out about you, your social media presence, and your hosted popups easier.

## Node Version
Make sure that you have Node version 22 installed.

## Setup Instructions
1. Create a copy of the “.env.example” file and rename it to “.env”.
2. Create any accounts and/or keys needed to fill out the necessary .env file variables for the Google OAuth 2.0 API, Google Maps API, the Google Service account key (for Firebase messaging), and the Cloudinary API.
3. Install mySQL on your machine if you haven’t already done so. For Mac users, you can run “brew install sql” in the terminal. For WSL/Windows users, run the terminal commands “sudo apt-get update” and then “sudo apt install mysql-server”.
4. Run the terminal command “npm install” to download the required dependencies.
5. Run the terminal command “service mysql start” to start the mysql server (“sudo service mysql start” for WSL/Windows and “mysql.server start” for Mac). If desired, you can replace “start” with “stop” in these commands whenever you wish to stop the mysql server.
6. Run the terminal command “mysql -u root” to open the mysql shell.
7. In the mysql shell, run “create database popout;” to create the “popout” database.
8. In a different terminal, run the command “npm run build” to create the dist (updated as code is changed).
9. In a different terminal, run the command “npm start” to run the server (does update as code is changed without needing to restart the server, but the page must be restarted manually for changes to take effect).
10. While starting the server allows the application to be used, it also creates the tables inside of the popout database for the first time. Go back to the terminal with the opened mysql shell and run these commands one after another:
USE popout;
SHOW tables;
INSERT INTO categories (name) VALUES ('Food & Drink'), ('Music'), ('Art'), ('Sports & Fitness'), ('Hobbies');
11. Go back to the terminal where you ran “npm start”, press ctrl + c, and then run the “npm start” command again just to make sure that the database is properly set up.
12. You can now interact with the running app as a user by navigating to “http://localhost:3000” in your browser.
13. If you desire, you can press ctrl + d from within the mysql shell to exit the mysql shell (you may have to press ctrl + d twice in some cases) and it will allow you to use that specific terminal normally again.

# App Features

## Authentication
- Google OAuth 2.0 allows users to easily and securely sign in to the app.
- Vendor sign up is protected via. a Captcha.

## Nav Bar
- Allows users to sign in using Google.
- Search for vendors and popups by name in the search bar.
- Return to home page by clicking on the title.
- Has a hamburger menu that allows you to access most pages instantly when they are available (like home, user profile, vendor profile,map, etc.).
- When logged in, the nav bar gives access to a user popover menu (allows user to logout or view profiles), a map button, and a notifications popover menu (allows user to see notifications from followed vendors).

## Home Page
- See upcoming popups and top-rated vendors.
- Upcoming popups can be bookmarked by a user to allow for notifications about that certain event.
- Filter events by category and by whether they are free, child friendly, and/or sober.
- Become a vendor or play a simple game at the bottom (when logged in).

## Map
- Interactive map that allows you to click on and learn more about various popups around the world
- Search by location.
- Filter seen popups by categories.
- Toggle map between regular mode (with or without terrain) and satellite view mode (with or without location labels).

## User Profile
- View user profile picture, name, Gmail, and interests.
- Edit event to alter the user profile's name, picture (is uploaded), and interests (are the same as the categories that can be applied to events).
- See bookmarked events.
- Delete user profile.

## Become a Vendor
- Pass a captcha version of the game to access the vendor sign up form.
- Give your vendor profile a unique name, a description, and a business email.
- Optionally give your vendor profile url links to your business's Facebook account, Instagram account, and/or public website.
- Fill out the form properly to create a vendor account linked to your user account.

## Vendor Profile
- See attributes of the vendor profile such as business email, business name, and anything else used to create the vendor account.
- Edit attributes of the vendor profile.
- Upload a picture to represent the vendor.
- Create new popups and view already-created popups.

## Popup Creation
- Provide your popup with a title, description, starting date, ending date, venue name, location, and categories.
- Upload and preview an image to represent the popup.
- Fill out the form properly to create a popup linked to your vendor account.

## Public Vendor View
- Follow the vendor for notifications.
- Rate the vendor by providing a star rating and optional comment.
- View the current and past popups made by a vendor.
- View vendor info, links, and overall star rating.

## Active Popups View
- View your current and past popups.
- Edit or delete popups.

## Public Popup View
- Shows details of event including name, description, start and end times, categories (including the "isFree", "sober", and "Kid-Friendly" special categories).
- Bookmark the event to receive notifications about it.
- View the public profile of the vendor who made the popup or view the popup on the map.

## Game
- A simple game about making the tourist reach the map marker
- Uses WASD, arrow keys, or on-screen arrow buttons.
- Score increases by 1 each time the tourist touches the map marker.
- The map marker begins moving after reaching a score of 6 (after beating "round 5").

## Contributors
- Peyton Strahan: Vendors and Game [Github](https://github.com/PeytonStrahan)

- Katherine Hebbler: Map and Styling [Github](https://github.com/khebbler)

- Khamal Chanley: Popups [Github](https://github.com/khamal22)

- Charles Sublett: Users and Vendors [Github](https://github.com/BMH397)

## Tech Stack
  - Api for Notification: [Firebase](https://firebase.google.com/)
  - Api for Map: [Google Maps](https://developers.google.com/maps/documentation)
  - Image Uploading: [Cloudinary Api](https://cloudinary.com/documentation/image_upload_api_reference) with help from [Multer dependency](https://expressjs.com/en/resources/middleware/multer.html)
  - Main Programming Language: [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
  - Frontend: [React](https://react.dev/)
  - Backend: [Express](https://expressjs.com/en/4x/api.html)
  - Build: [Webpack](https://webpack.js.org/configuration/) & [Babel](https://babeljs.io/docs/)
  - Database: [MySQL](https://www.mysql.com/) & [Sequalize](https://sequelize.org/docs/v7/databases/mysql/)
  - Deployment: [AWS EC2](https://aws.amazon.com/ec2/) & [Firebase](https://firebase.google.com/)
  - Auth: [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) & [Passport](https://www.passportjs.org/tutorials/google/)
  - Styling: [Material UI](https://mui.com/)
  - Environment Variables: [dotenv](https://www.npmjs.com/package/dotenv)

## Known Bugs
  - Only vendor images are deleted from Cloudinary when they are deleted from the database. All other images stay in cloudinary after their database record is deleted.