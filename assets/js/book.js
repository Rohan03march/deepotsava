import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBypZ0BZnoY-UVzb_3Hs0116vwu6OWmrCc",
    authDomain: "iskcon-contest-3bf89.firebaseapp.com",
    projectId: "iskcon-contest-3bf89",
    storageBucket: "iskcon-contest-3bf89.appspot.com",
    messagingSenderId: "216348940232",
    appId: "1:216348940232:web:1c8de66866f589ce1f92fd",
    measurementId: "G-CJJLTTHHFJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore();

const commentInput = document.getElementById("commentInput");
const submitButton = document.getElementById("submitButton");
const commentsList = document.getElementById("commentsList");
const totalPoints = document.getElementById("totalPoints"); // Element to display points

const keywords = {
    "krishna": 5,
    "bhagavad gita": 5,
    "hindu mythology": 5,
    "radha krishna": 5,
    "vrindavan": 5,
    "karma": 5,
    "dharma": 5,
    "krishna leela": 5,
    "divine play": 5,
    "incarnation": 5,
    "vishnu": 5,
};

const greetings = [
    "hi",
    "hello",
    "good morning",
    "good afternoon",
    "good evening",
    "hey",
    "what's up"
];

// Function to check if a word is a greeting
const isGreeting = (word) => {
    return greetings.includes(word.toLowerCase());
};

// Function to create or get the user document
const createUserDocument = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
        await setDoc(userRef, {
            comments: [],
            commentPoints: 0 // Initialize commentPoints
        });
    }
};

// Function to update the displayed points
const updatePointsDisplay = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const commentPoints = userDoc.data().commentPoints || 0; // Fetch commentPoints
    totalPoints.innerText = `Total Points: ${commentPoints}`;
};

submitButton.addEventListener("click", async () => {
    const user = auth.currentUser;
    const commentText = commentInput.value.trim();

    if (user && commentText) {
        try {
            let points = 0; // Start with 0 points

            // Check for keywords
            for (const keyword in keywords) {
                if (commentText.toLowerCase().includes(keyword)) {
                    points += keywords[keyword]; // Add keyword points
                }
            }

            // Check for greetings and add points
            const words = commentText.split(/\s+/);
            for (const word of words) {
                if (isGreeting(word)) {
                    points += 5; // Add 5 points for each greeting
                }
            }

            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef); // Fetch current user document
            const currentCommentPoints = userDoc.data().commentPoints || 0; // Get current commentPoints

            await updateDoc(userRef, {
                comments: arrayUnion({
                    text: commentText,
                    timestamp: new Date(), // Store the current date and time
                }),
                commentPoints: currentCommentPoints + points // Update commentPoints
            });

            // Update points display after submitting a comment
            await updatePointsDisplay(user);

            commentInput.value = ""; // Clear the input field
        } catch (error) {
            console.error("Error adding comment: ", error);
        }
    } else {
        console.log("User is not authenticated or comment is empty.");
    }
});

// Fetch comments and points
onAuthStateChanged(auth, (user) => {
    if (user) {
        createUserDocument(user); // Ensure user document exists
        const userRef = doc(db, "users", user.uid);

        // Listen for updates to user document
        onSnapshot(userRef, async (doc) => {
            commentsList.innerHTML = ""; // Clear the list before displaying
            const comments = doc.data().comments || [];
            comments.forEach((comment) => {
                const li = document.createElement("li");
                li.className = "comment";

                // Format the timestamp
                const timestamp = comment.timestamp.toDate(); // Convert Firestore timestamp to JavaScript Date
                const day = String(timestamp.getDate()).padStart(2, '0');
                const month = String(timestamp.getMonth() + 1).padStart(2, '0');
                const year = timestamp.getFullYear();
                let hours = timestamp.getHours();
                const minutes = String(timestamp.getMinutes()).padStart(2, '0');

                // Determine AM or PM suffix
                const amPm = hours >= 12 ? 'PM' : 'AM';
                // Convert to 12-hour format
                hours = hours % 12 || 12; // Convert 0 to 12 for midnight

                const formattedDate = `${day}/${month}/${year}`;
                const formattedTime = `${hours}:${minutes} ${amPm}`;

                // Format comment text
                const formattedComment = comment.text.replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');

                // Combine comment and formatted date
                li.innerHTML = `<span class="timestamp">(${formattedDate} ${formattedTime})</span> ${formattedComment}`;
                commentsList.appendChild(li);
            });

            // Update the displayed points
            await updatePointsDisplay(user);
        });
    }
});
