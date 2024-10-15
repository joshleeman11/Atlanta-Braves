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


@app.route("/api/graph", methods=["POST"])
def generate_graph():

    try:
        data = request.get_json()
        print(data)
        outcomes = data.get("outcomes", [])
        if not outcomes:
            outcomes = ['Single', 'Double', 'Triple', 'HomeRun', 'Out', 'Error']
        print(outcomes)
        exit_speed_range = data.get("exitSpeedRange", [])
        launch_angle_range = data.get("launchAngleRange", [])
        batter_names = data.get("batterNames", "")
        pitcher_names = data.get("pitcherNames", "")
        dates = data.get("dates", [])
        color_by = data.get("colorBy", "outcome")

        df = pd.read_csv("BattedBallData.csv")

        if outcomes:
            df = df[df["PLAY_OUTCOME"].isin(outcomes)]

        if exit_speed_range:
            min_speed, max_speed = exit_speed_range
            df = df[(df["EXIT_SPEED"] >= min_speed) & (df["EXIT_SPEED"] <= max_speed)]

        if launch_angle_range:
            min_angle, max_angle = launch_angle_range
            df = df[
                (df["LAUNCH_ANGLE"] >= min_angle) & (df["LAUNCH_ANGLE"] <= max_angle)
            ]

        if not batter_names[0] == '':
            print(batter_names)
            df = df[(df["BATTER"]).isin(batter_names)]

        if not pitcher_names[0] == '':
            print(pitcher_names)
            df = df[(df["PITCHER"]).isin(pitcher_names)]

        if dates:
            print(dates)
            df = df[(df["GAME_DATE"]).isin(dates)]

        if df.empty:
            return (
                jsonify({"error": "No data available for the specified outcomes"}),
                404,
            )

        print(df)
        # Calculate the x (horizontal) and y (vertical) coordinates of the ball's landing spot
        df["EXIT_DIRECTION_RAD"] = np.deg2rad(df["EXIT_DIRECTION"])

        df["x"] = df["HIT_DISTANCE"] * np.sin(df["EXIT_DIRECTION_RAD"])
        df["y"] = df["HIT_DISTANCE"] * np.cos(df["EXIT_DIRECTION_RAD"])

        # Create an instance of MLBField
        mlb_field = MLBField()

        # Create a figure and axes object for the field plot
        fig, ax = plt.subplots(figsize=(10, 10))

        # Define different color schemes based on `color_by` parameter
        if color_by == "outcome":
            OUTCOME_COLORS = {
                "Single": "blue",
                "Double": "yellow",
                "Triple": "orange",
                "HomeRun": "red",
                "Out": "gray",
                "Error": "black",
            }
            for outcome in OUTCOME_COLORS:
                if outcome in outcomes:
                    outcome_data = df[df["PLAY_OUTCOME"] == outcome]
                    if not outcome_data.empty:
                        print(outcome)
                        ax.scatter(
                            outcome_data["x"],
                            outcome_data["y"],
                            label=outcome,
                            color=OUTCOME_COLORS[outcome],
                            zorder=15,
                            s=35,
                        )

        elif color_by == "date":
            unique_dates = df["GAME_DATE"].unique()
            colors = plt.cm.viridis(np.linspace(0, 1, len(unique_dates)))
            for i, date in enumerate(unique_dates):
                date_data = df[df["GAME_DATE"] == date]
                ax.scatter(
                    date_data["x"],
                    date_data["y"],
                    label=date,
                    color=colors[i],
                    zorder=15,
                    s=35,
                )
                
        elif color_by == "batter_name":
            unique_batters = df["BATTER"].unique()
            colors = plt.cm.viridis(np.linspace(0, 1, len(unique_batters)))
            for i, batter in enumerate(unique_batters):
                batter_data = df[df["BATTER"] == batter]
                ax.scatter(
                    batter_data["x"],
                    batter_data["y"],
                    label=batter,
                    color=colors[i],
                    zorder=15,
                    s=35,
                )
                
        elif color_by == "pitcher_name":
            unique_pitchers = df["PITCHER"].unique()
            colors = plt.cm.viridis(np.linspace(0, 1, len(unique_pitchers)))
            for i, pitcher in enumerate(unique_pitchers):
                pitcher_data = df[df["PITCHER"] == pitcher]
                ax.scatter(
                    pitcher_data["x"],
                    pitcher_data["y"],
                    label=pitcher,
                    color=colors[i],
                    zorder=15,
                    s=35,
                )
                
        elif color_by == "exit_speed":
            norm = plt.Normalize(
                vmin=df["EXIT_SPEED"].min(), vmax=df["EXIT_SPEED"].max()
            )
            sm = plt.cm.ScalarMappable(cmap="cool", norm=norm)
            sm.set_array([])
            ax.scatter(
                df["x"], df["y"], c=df["EXIT_SPEED"], cmap="cool", zorder=15, s=35
            )
            plt.colorbar(sm, ax=ax)

        else:
            return jsonify({"error": "Invalid color_by option"}), 400

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
