# PopOut1
Set Up Instructions
1. Create a copy of the “.env.example” file and rename it to “.env”.
2. Create any accounts and/or keys needed to fill out the necessary .env file variables for the Google OAuth 2.0 API, Google Maps API, and the Cloudinary API.
3. Install mySQL on your machine if you haven’t already done so. For Mac users, you can run “brew install sql” in the terminal. For WSL/Windows users, run the terminal commands “sudo apt-get update” and then “sudo apt install mysql-server”.
4. Run the terminal command “npm install” to download the required dependencies.
5. Run the correct terminal command “service mysql start” to start the mysql server (“sudo service mysql start” for WSL/Windows and “mysql.server start” for Mac).
6. Run the terminal command “mysql -u root” to open the mysql shell.
7. In the mysql shell, run “create database popout” to create the “popout” database.
8. Press ctrl + d from within the mysql shell to exit the mysql shell (you may have to press ctrl + d twice in some cases).
9. Run the terminal command “npm run seedC” to seed the Categories database (you can also run some other seeds here too for testing purposes).
10. Run the terminal command “npm run build” to create the dist (refreshed as code is changed).
11. Run the terminal command “npm start” to run the server (does not refresh as code is changed and must be restarted manually).
12. You can now interact with the running app as a user by navigating to “http://localhost:3000” in your browser.
