import React, { useState } from "react";
import {
    Typography,
    Box,
    Slider,
    TextField,
    Button,
    Grid,
} from "@mui/material";
import DatePicker from "react-multi-date-picker";

const App = () => {
    const [selectedOutcomes, setSelectedOutcomes] = useState([]);
    const [exitSpeedRange, setExitSpeedRange] = useState([20, 130]);
    const [launchAngleRange, setLaunchAngleRange] = useState([-100, 100]);
    const [batterNames, setBatterNames] = useState("");
    const [pitcherNames, setPitcherNames] = useState("");
    const [dates, setDates] = useState([]);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSelectChange = (e) => {
        const { options } = e.target;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setSelectedOutcomes(selectedValues);
    };

    const handleExitSpeedChange = (event, newValue) => {
        setExitSpeedRange(newValue);
    };

    const handleLaunchAngleChange = (event, newValue) => {
        setLaunchAngleRange(newValue);
    };

    const handleBatterNameChange = (event) => {
        setBatterNames(event.target.value);
    };

    const handlePitcherNameChange = (event) => {
        setPitcherNames(event.target.value);
    };

    const handleDatesChange = (event) => {
        const formattedDates = new Set();
        const dates = event;

        const addDateRange = (startDate, endDate) => {
            let currentDate = new Date(
                startDate.year,
                startDate.month.number - 1,
                startDate.day
            );
            const end = new Date(
                endDate.year,
                endDate.month.number - 1,
                endDate.day
            );

            while (currentDate <= end) {
                formattedDates.add(
                    `${
                        currentDate.getMonth() + 1
                    }/${currentDate.getDate()}/${currentDate.getFullYear()}`
                );
                currentDate.setDate(currentDate.getDate() + 1);
            }
        };

        dates.forEach((range) => {
            if (range.length === 1) {
                const date = range[0];
                formattedDates.add(
                    `${date.month.number}/${date.day}/${date.year}`
                );
            } else {
                addDateRange(range[0], range[1]);
            }
        });

        setDates(Array.from(formattedDates));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const batters =
            batterNames?.split("|").map((batter) => batter.trim()) ?? null;
        const pitchers =
            pitcherNames?.split("|").map((pitcher) => pitcher.trim()) ?? null;
        const data = {
            outcomes: selectedOutcomes,
            exitSpeedRange: exitSpeedRange,
            launchAngleRange: launchAngleRange,
            batterNames: batters,
            pitcherNames: pitchers,
            dates: dates,
            colorBy: document.querySelector('input[name="colorBy"]:checked')
                .value,
        };

        try {
            const response = await fetch("http://localhost:5001/api/graph", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            setImage(result.image); // Set the received image data
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container spacing={3} sx={{ padding: "20px" }}>
            {/* Left-side Filters */}
            <Grid item xs={12} md={6}>
                <h2>Baseball Data Visualization</h2>

                {/* Player Name Filters - Centered */}
                <div style={{ textAlign: "left" }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <TextField
                                label="Filter on Batter Name (Lastname, Firstname | Lastname, Firstname)"
                                variant="outlined"
                                value={batterNames}
                                onChange={handleBatterNameChange}
                                fullWidth
                                margin="normal"
                                sx={{ width: "100%" }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <div>
                                <input
                                    type="radio"
                                    id="colorByBatter"
                                    name="colorBy"
                                    value="batter_name"
                                />
                                <label htmlFor="colorByBatter">
                                    Color by batter
                                </label>
                            </div>
                        </Grid>
                    </Grid>

                    {/* Pitcher Name Filter */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <TextField
                                label="Filter on Pitcher Name (Lastname, Firstname | Lastname, Firstname)"
                                variant="outlined"
                                value={pitcherNames}
                                onChange={handlePitcherNameChange}
                                fullWidth
                                margin="normal"
                                sx={{ width: "100%" }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <div>
                                <input
                                    type="radio"
                                    id="colorByPitcher"
                                    name="colorBy"
                                    value="pitcher_name"
                                />
                                <label htmlFor="colorByPitcher">
                                    Color by pitcher
                                </label>
                            </div>
                        </Grid>
                    </Grid>
                </div>

                <br />

                {/* Date Picker */}
                <label htmlFor="datePicker">Filter on date</label>
                <div style={{ textAlign: "left" }}>
                    <DatePicker
                        id="datePicker"
                        onChange={handleDatesChange}
                        multiple={true}
                        range={true}
                    />
                </div>
                <br></br>
                {/* Outcome Filter & Select - Aligned vertically */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Outcome Selector */}
                    <label htmlFor="outcomePicker">Filter on outcome</label>
                    <select
                        id="outcomePicker"
                        multiple
                        value={selectedOutcomes}
                        onChange={handleSelectChange}
                        style={{
                            width: "20%", // Narrower width
                            height: "100px",
                            marginBottom: "20px",
                        }}
                    >
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Triple">Triple</option>
                        <option value="HomeRun">Home Run</option>
                        <option value="Out">Out</option>
                        <option value="Error">Error</option>
                    </select>
                </div>

                {/* Slider for Exit Speed */}
                <Box sx={{ width: 300, marginTop: "20px" }}>
                    <Typography>{`Exit Speed: ${exitSpeedRange[0]} mph to ${exitSpeedRange[1]} mph`}</Typography>
                    <Slider
                        value={exitSpeedRange}
                        onChange={handleExitSpeedChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value} mph`}
                        min={20}
                        max={130}
                        step={1}
                    />
                </Box>

                {/* Slider for Launch Angle */}
                <Box sx={{ width: 300, marginTop: "20px" }}>
                    <Typography>{`Launch Angle: ${launchAngleRange[0]}° to ${launchAngleRange[1]}°`}</Typography>
                    <Slider
                        value={launchAngleRange}
                        onChange={handleLaunchAngleChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}°`}
                        min={-45}
                        max={45}
                        step={1}
                    />
                </Box>
                <br></br>
                {/* Color Selector */}
                <div>
                    <label>Select how to color the points:</label>
                    <br />

                    <input
                        type="radio"
                        id="colorByOutcome"
                        name="colorBy"
                        value="outcome"
                        defaultChecked
                    />
                    <label htmlFor="colorByOutcome">Outcome</label>
                    <br />

                    <input
                        type="radio"
                        id="colorByDate"
                        name="colorBy"
                        value="date"
                    />
                    <label htmlFor="colorByDate">Date</label>
                    <br />

                    <input
                        type="radio"
                        id="colorByExitSpeed"
                        name="colorBy"
                        value="exit_speed"
                    />
                    <label htmlFor="colorByExitSpeed">Exit Speed</label>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: "20px" }}
                >
                    {loading ? "Generating..." : "Generate Graph"}
                </Button>
            </Grid>

            {/* Right-side Image Display */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {image ? (
                    <img
                        src={`data:image/png;base64,${image}`}
                        alt="Custom Graph"
                        style={{
                            width: "100%", // Ensure the image scales with the container
                            height: "auto", // Maintain aspect ratio
                            maxHeight: "100vh", // Limit height to 80% of viewport height
                            objectFit: "contain", // Ensure the image doesn't get cropped
                        }}
                    />
                ) : (
                    "No data"
                )}
            </Grid>
        </Grid>
    );
};

export default App;
