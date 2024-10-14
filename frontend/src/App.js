import React, { useState } from "react";
import {
    Typography,
    Box,
    Slider,
    TextField,
    Button,
    Grid,
} from "@mui/material";

const App = () => {
    const [selectedOutcomes, setSelectedOutcomes] = useState([]);
    const [exitSpeedRange, setExitSpeedRange] = useState([20, 130]);
    const [launchAngleRange, setLaunchAngleRange] = useState([-100, 100]);
    const [batterName, setBatterName] = useState("");
    const [pitcherName, setPitcherName] = useState("");
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
        setBatterName(event.target.value);
    };

    const handlePitcherNameChange = (event) => {
        setPitcherName(event.target.value);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const data = {
            outcomes: selectedOutcomes,
            exitSpeedRange: exitSpeedRange,
            launchAngleRange: launchAngleRange,
            batterName: batterName,
            pitcherName: pitcherName
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
                <h2>Generate Custom Graph</h2>

                <TextField
                    label="Filter on Batter Name"
                    variant="outlined"
                    value={batterName}
                    onChange={handleBatterNameChange}
                    fullWidth
                    margin="normal"
                    sx={{ width: "80%", marginBottom: "20px" }}
                />

                <TextField
                    label="Filter on Pitcher Name"
                    variant="outlined"
                    value={pitcherName}
                    onChange={handlePitcherNameChange}
                    fullWidth
                    margin="normal"
                    sx={{ width: "80%", marginBottom: "20px" }}
                />

                <select
                    multiple
                    value={selectedOutcomes}
                    onChange={handleSelectChange}
                    style={{
                        width: "80%",
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

                <Box sx={{ width: 300, marginTop: "20px" }}>
                    <Typography gutterBottom>Exit Speed Range</Typography>
                    <Slider
                        value={exitSpeedRange}
                        onChange={handleExitSpeedChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value} mph`}
                        min={20}
                        max={130}
                        step={1}
                    />
                    <Typography>{`Exit Speed: ${exitSpeedRange[0]} mph to ${exitSpeedRange[1]} mph`}</Typography>
                </Box>

                <Box sx={{ width: 300, marginTop: "20px" }}>
                    <Typography gutterBottom>
                        Launch Angle Range (degrees)
                    </Typography>
                    <Slider
                        value={launchAngleRange}
                        onChange={handleLaunchAngleChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}°`}
                        min={-45}
                        max={45}
                        step={1}
                    />
                    <Typography>{`Launch Angle: ${launchAngleRange[0]}° to ${launchAngleRange[1]}°`}</Typography>
                </Box>

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
                {image && (
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
                )}
            </Grid>
        </Grid>
    );
};

export default App;
