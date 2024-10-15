# Baseball Data Visualization Project

This is a web-based application that visualize and contextualize the data enclosed in BattedBallData.csv. Users can filter batted ball data by various parameters such as outcome, exit speed, launch angle, batters, pitchers, and dates.

# Installation/Setup
### Clone repo
```git clone https://github.com/joshleeman11/Atlanta-Braves.git```
### Frontend
Access web-based application here: https://baseball-data-visualization.netlify.app/. <br>
Alternatively, to run locally, from the ```frontend``` directory
1. ```npm install```
2. ```npm start```

### Backend
Backend needs to run locally for app to work. <br>

#### Prerequisites:
Python (version 3.x recommended) <br>
pip (Python package installer) <br>

1. From the ```backend``` directory, ```pip install -r requirements.txt```
2. From the ```backend/src/``` directory, ```flask run --port=5001``` or ```python app.py```

##### Frontend is running on port 3000, Backend is running on port 5001

# Tech Stack
### Frontend:
React.js: Frontend user interface to interact with backend Flask app

### Backend:
Flask: API that handles data requests from the React frontend and serves the graph image <br> <br>
Python: Processing data, interacting with the CSV file, and creating the visualizations <br> <br>
CORS (Cross-Origin Resource Sharing): Allows the frontend and backend to communicate from different ports <br> <br>
sportypy: Python library to draw the MLB field and visualize baseball fields in the Matplotlib plot.

### Data:
BattedBallData.csv




Axios / Fetch (for API requests): To send data and receive responses (such as image data) between React and Flask.
