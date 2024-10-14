// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBypZ0BZnoY-UVzb_3Hs0116vwu6OWmrCc",
    authDomain: "iskcon-contest-3bf89.firebaseapp.com",
    projectId: "iskcon-contest-3bf89",
    storageBucket: "iskcon-contest-3bf89.appspot.com",
    messagingSenderId: "216348940232",
    appId: "1:216348940232:web:1c8de66866f589ce1f92fd",
    measurementId: "G-CJJLTTHHFJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore();

// Function to check if the user has already downloaded the manual
const checkDownloadStatus = async (userId) => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() && userDoc.data().downloaded === true;
};

// Function to handle downloads
const handleDownload = async (manualKey, filePath) => {
    const userId = localStorage.getItem("loggedInUserId");

    if (userId) {
        // Check download status
        const hasDownloaded = await checkDownloadStatus(userId);
        if (hasDownloaded) {
            return; // Exit if the user has already downloaded
        }

        // Set the download flag in Firestore
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, { downloaded: true }, { merge: true });
    }

    // Trigger the download
    window.location.href = filePath;
};

// Check user download status on page load
const userId = localStorage.getItem("loggedInUserId");
if (userId) {
    checkDownloadStatus(userId).then(hasDownloaded => {
        if (hasDownloaded) {
            // Show alert if the user has downloaded the manual
            setTimeout(() => {
                alert("Thank you for downloading!");
                document.getElementById("download").style.display = "none"; // Hide the download section
            }, 0); // Delay the alert to ensure it shows after page load
        }
    });
}

// Attach event listeners to download buttons
document.getElementById("downloadKannada").addEventListener("click", (event) => {
    event.preventDefault();
    handleDownload("downloadKannada", "./PDF/Damodara-Vrata Kannada.pdf");
});

document.getElementById("downloadHindi").addEventListener("click", (event) => {
    event.preventDefault();
    handleDownload("downloadHindi", "./PDF/Damodara-Vrata Hindi.pdf");
});

document.getElementById("downloadEnglish").addEventListener("click", (event) => {
    event.preventDefault();
    handleDownload("downloadEnglish", "./PDF/Damodara-Vrata English.pdf");
});

document.getElementById("downloadTelugu").addEventListener("click", (event) => {
    event.preventDefault();
    handleDownload("downloadTelugu", "./PDF/Damodara-Vrata Telegu.pdf");
});
