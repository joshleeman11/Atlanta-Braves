from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import io
import base64
from sportypy.surfaces.baseball import MLBField

app = Flask(__name__)

CORS(app)


@app.route("/api/data", methods=["GET"])
def get_data():
    try:
        # Load data from CSV
        data = pd.read_csv("BattedBallData.csv")
        print("Data Loaded Successfully:")
        print(data.head())  # Log first few rows to the console

        # Handle NaN values
        data_cleaned = data.dropna()
        json_data = data_cleaned.to_dict(orient="records")

        return jsonify(json_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return error if something goes wrong


@app.route("/api/graph", methods=["POST"])
def generate_graph():

    try:
        data = request.get_json()
        print(data)
        outcomes = data.get("outcomes", [])
        exit_speed_range = data.get("exitSpeedRange", [])
        launch_angle_range = data.get("launchAngleRange", [])
        batter_name = data.get("batterName", "")
        pitcher_name = data.get("pitcherName", "")
        df = pd.read_csv("BattedBallData.csv")
        
        if outcomes:
            df = df[df['PLAY_OUTCOME'].isin(outcomes)]
        else:
            return jsonify({"error": "No outcomes provided"}), 400
        
        if exit_speed_range:
            min_speed, max_speed = exit_speed_range
            df = df[(df['EXIT_SPEED'] >= min_speed) & (df['EXIT_SPEED'] <= max_speed)]
            
        if launch_angle_range:
            min_angle, max_angle = launch_angle_range
            df = df[(df['LAUNCH_ANGLE'] >= min_angle) & (df['LAUNCH_ANGLE'] <= max_angle)]
            
        if batter_name:
            print(batter_name)
            df = df[(df['BATTER']) == batter_name]
            
        if pitcher_name:
            print(pitcher_name)
            df = df[(df['PITCHER']) == pitcher_name]

        if df.empty:
            return jsonify({"error": "No data available for the specified outcomes"}), 404
        
        print(df)
        # Calculate the x (horizontal) and y (vertical) coordinates of the ball's landing spot
        df['EXIT_DIRECTION_RAD'] = np.deg2rad(df['EXIT_DIRECTION'])
        
        df['x'] = df['HIT_DISTANCE'] * np.sin(df['EXIT_DIRECTION_RAD'])
        df['y'] = df['HIT_DISTANCE'] * np.cos(df['EXIT_DIRECTION_RAD'])
        
        OUTCOME_COLORS = {
            "Single": "blue",
            "Double": "yellow",
            "Triple": "orange",
            "HomeRun": "red",
            "Out": "gray",
            "Error": "black"
        }

        # Create an instance of MLBField
        mlb_field = MLBField()

        # Create a figure and axes object for the field plot
        fig, ax = plt.subplots(figsize=(10, 10))
        
        for outcome in OUTCOME_COLORS:
            if outcome in outcomes:
                outcome_data = df[df['PLAY_OUTCOME'] == outcome]
                if not outcome_data.empty:
                    print(outcome)
                    # Overlay the point at home plate (assuming home plate is at (0, 0))
                    ax.scatter(outcome_data['x'], outcome_data['y'], label=outcome, color=OUTCOME_COLORS[outcome], zorder=15, s=35)
                

        # Add a green rectangle as the field background (representing grass)
        field_background = patches.Rectangle(
            (-500, -500), 1000, 1000, color="green", zorder=0
        )
        ax.add_patch(field_background)

        # Call the draw method, passing the axes object to ensure it draws on the same plot
        mlb_field.draw(ax=ax, display_range="full", rotation=0.0)

        # Customize the scatter plot (optional)
        ax.legend(fontsize=15)

        # Set equal aspect ratio for a square plot
        ax.set_aspect("equal")

        # Save the figure to a BytesIO object (in-memory)
        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        buf.seek(0)
        plt.close(fig)

        # Encode the image as base64
        img_str = base64.b64encode(buf.getvalue()).decode("utf-8")

        # Return JSON response with the base64 image
        return jsonify({"image": img_str})
    except Exception as e:
        print("Error occurred:", str(e))  # Log the error to debug
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return "Flask app is running!"


if __name__ == "__main__":
    app.run(port=5001)
