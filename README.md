# PopOut1
Set Up Instructions
1. Create a copy of the “.env.example” file and rename it to “.env”.
2. Create any accounts and/or keys needed to fill out the necessary .env file variables for the Google OAuth 2.0 API, Google Maps API, the Google Service account key, and the Cloudinary API.
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
