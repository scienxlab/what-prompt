const express = require('express');
const app = express();
const path = require('path');

// Define a route to serve the static index.html file
app.get('/', (req, res) => {
    // Replace 'index.html' with the path to your HTML file
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});