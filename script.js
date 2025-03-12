// ThingSpeak API Keys
const writeAPIKey = "C7V7BTERQUH8S15N"; // Your Write API Key
const readAPIKey = "89DTVC4PMF5V1I86";  // Your Read API Key
const channelID = "2847442";            // Your Channel ID

// Reference level for electricity usage (in kWh)
const averageUsage = 10; // Average daily electricity usage in Hong Kong

// Timer for non-signed-in users
let timer;
const timeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
// Add to script.js
let returnPage = 'starting-page';

function setScreenSize(size) {
    if (size === "mobile") {
        document.body.style.maxWidth = "480px";
        document.body.style.margin = "0 auto";
    } else if (size === "computer") {
        document.body.style.maxWidth = "100%";
        document.body.style.margin = "0";
    }
    document.querySelector(".screen-size-page").style.display = "none";
    document.querySelector("." + returnPage).style.display = "block";
    returnPage = 'starting-page'; // Reset to default
}

function showScreenSizePage(page) {
    returnPage = page;
    document.querySelector(".screen-size-page").style.display = "block";
    document.querySelector(".home-page").style.display = "none";
    document.querySelector(".starting-page").style.display = "none";
}

// Rest of existing JavaScript remains unchanged
// Function to Set Screen Size
function setScreenSize(size) {
    if (size === "mobile") {
        document.body.style.maxWidth = "480px";
        document.body.style.margin = "0 auto";
    } else if (size === "computer") {
        document.body.style.maxWidth = "100%";
        document.body.style.margin = "0";
    }
    document.querySelector(".screen-size-page").style.display = "none";
    document.querySelector(".starting-page").style.display = "block";
}

// Function to Show Sign In Page
function showSignIn() {
    document.querySelector(".starting-page").style.display = "none";
    document.querySelector(".sign-in-page").style.display = "block";
    document.querySelector(".sign-in-page").style.animation = "slideIn 0.5s ease";
}

// Function to Show Sign Up Page
function showSignUp() {
    document.querySelector(".starting-page").style.display = "none";
    document.querySelector(".sign-up-page").style.display = "block";
    document.querySelector(".sign-up-page").style.animation = "slideIn 0.5s ease";
}

// Function to Use Without Signing In
function useWithoutSignIn() {
    document.querySelector(".starting-page").style.display = "none";
    document.querySelector(".home-page").style.display = "block";
    document.querySelector(".home-page").style.animation = "slideIn 0.5s ease";

    // Start the timer
    timer = setTimeout(() => {
        alert("Please sign in or sign up for an account. Returning to the starting page.");
        backToStartingPage();
    }, timeLimit);
}

// Function to Sign Up
function signUp() {
    const newUserId = document.getElementById("newUserId").value;
    const newPassword = document.getElementById("newPassword").value;

    if (newUserId && newPassword) {
        // Check if the user ID already exists
        const users = JSON.parse(localStorage.getItem("users")) || {};
        if (users[newUserId]) {
            alert("User ID already exists. Please choose a different one.");
            return;
        }

        // Save the new user to local storage
        users[newUserId] = newPassword;
        localStorage.setItem("users", JSON.stringify(users));

        alert("Sign Up Successful! Please sign in.");
        backToStartingPage();
    } else {
        alert("Please enter a User ID and Password.");
    }
}

// Function to Sign In
function signIn() {
    const userId = document.getElementById("userId").value;
    const password = document.getElementById("password").value;

    if (userId && password) {
        // Retrieve saved users from local storage
        const users = JSON.parse(localStorage.getItem("users")) || {};

        // Check if the user ID exists and the password matches
        if (users[userId] && users[userId] === password) {
            alert("Sign In Successful!");
            document.querySelector(".sign-in-page").style.display = "none";
            document.querySelector(".home-page").style.display = "block";
            document.querySelector(".home-page").style.animation = "slideIn 0.5s ease";
        } else {
            alert("Invalid User ID or Password. Please try again.");
        }
    } else {
        alert("Please enter your User ID and Password.");
    }
}

// Function to Return to Starting Page
function backToStartingPage() {
    document.querySelector(".home-page").style.display = "none";
    document.querySelector(".sign-in-page").style.display = "none";
    document.querySelector(".sign-up-page").style.display = "none";
    document.querySelector(".starting-page").style.display = "block";
    document.querySelector(".starting-page").style.animation = "fadeIn 0.5s ease";

    // Clear the timer
    clearTimeout(timer);
}

// Function to Show Sub-Buttons
function showSubButtons(buttonType) {
    // Hide all sub-buttons first
    document.querySelectorAll(".sub-buttons").forEach(subButton => {
        subButton.style.display = "none";
    });

    // Show the selected sub-buttons
    const subButtons = document.getElementById(`${buttonType}SubButtons`);
    if (subButtons) {
        subButtons.style.display = "flex";
    }
}

// Function to Send Data
function sendData(field) {
    const dataInput = document.getElementById("dataInput").value;
    if (!dataInput) {
        alert("Please enter a number!");
        return;
    }

    const usage = parseFloat(dataInput);

    // Check if usage is too high or too low
    if (usage > averageUsage) {
        alert(`Warning: Your electricity usage (${usage} kWh) is higher than the average (${averageUsage} kWh). Consider reducing consumption.`);
    } else if (usage < averageUsage) {
        alert(`Good job! Your electricity usage (${usage} kWh) is lower than the average (${averageUsage} kWh). Keep it up!`);
    }

    const url = `https://api.thingspeak.com/update?api_key=${writeAPIKey}&field${field}=${usage}`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            const output = document.getElementById("output");
            typewriterEffect(output, `Data sent to Field ${field}: ${usage} kWh\nResponse: ${data}`);
        })
        .catch(error => {
            const output = document.getElementById("output");
            typewriterEffect(output, `Error: ${error.message}`);
        });
}

// Function to Get Recent Data
function getRecentData(field) {
    const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=1`; // Retrieve only the most recent data point

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const output = document.getElementById("output");
            if (data.feeds && data.feeds.length > 0) {
                const feed = data.feeds[0];
                typewriterEffect(output, `Most Recent Data for Field ${field}:\n  Data: ${feed[`field${field}`]} kWh\n  Timestamp: ${feed.created_at}`);
            } else {
                typewriterEffect(output, "No data available.");
            }
        })
        .catch(error => {
            const output = document.getElementById("output");
            typewriterEffect(output, `Error: ${error.message}`);
        });
}

// Function to Get Analysis
function getAnalysis(field) {
    const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=60`; // Retrieve last 60 data points

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const output = document.getElementById("output");
            if (data.feeds && data.feeds.length > 0) {
                let resultString = `Analysis of Past Data for Field ${field}:\n`;
                let totalUsage = 0;

                // Calculate total usage
                data.feeds.forEach((feed) => {
                    const usage = parseFloat(feed[`field${field}`]);
                    totalUsage += usage;
                });

                // Calculate average usage
                const average = totalUsage / data.feeds.length;

                // Add analysis and suggestions
                resultString += `- Average usage: ${average.toFixed(2)} kWh\n`;
                resultString += `- Reference level: ${averageUsage} kWh\n\n`;

                if (average > averageUsage) {
                    resultString += `Suggestions:\n`;
                    resultString += `- Your average usage is higher than the reference level. Consider:\n`;
                    resultString += `  - Turning off unused appliances.\n`;
                    resultString += `  - Using energy-efficient devices.\n`;
                    resultString += `  - Reducing air conditioning usage.\n`;
                } else if (average < averageUsage) {
                    resultString += `Suggestions:\n`;
                    resultString += `- Your average usage is lower than the reference level. Great job!\n`;
                    resultString += `  - Continue practicing energy-saving habits.\n`;
                } else {
                    resultString += `Suggestions:\n`;
                    resultString += `- Your average usage matches the reference level. Keep it up!\n`;
                }

                typewriterEffect(output, resultString);
            } else {
                typewriterEffect(output, "No data available.");
            }
        })
        .catch(error => {
            const output = document.getElementById("output");
            typewriterEffect(output, `Error: ${error.message}`);
        });
}

// Function to Get Chart
function getChart(field) {
    const chartContainer = document.querySelector(".chart-container");
    const chartIframe = document.getElementById("chartIframe");

    // Set the iframe source and display it
    chartIframe.src = `https://thingspeak.com/channels/${channelID}/charts/${field}?api_key=${readAPIKey}&bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15`;
    chartContainer.style.display = "block";
    setTimeout(() => {
        chartContainer.classList.add("show");
        chartIframe.classList.add("show");
    }, 10);
}

// Typewriter Effect Function
function typewriterEffect(element, text, speed = 50) {
    element.classList.add("show");
    element.value = ""; // Clear the text area
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            element.value += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
        }
    }, speed);
}