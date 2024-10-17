            // Import Firebase SDKs
            import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
            import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
            import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
            import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
    import { onSnapshot } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

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
    
            // Function to check download status
            const checkDownloadStatus = async (userId) => {
                const userRef = doc(db, "users", userId);
                const userDoc = await getDoc(userRef);
                return userDoc.exists() && userDoc.data().downloaded === true;
            };
    
            // Update manual image based on selection
            window.updateManual = () => { // Make it a global function
                const select = document.getElementById("languageSelect");
                const selectedOption = select.options[select.selectedIndex];
                const imagePath = selectedOption.getAttribute("data-image");
                const manualImage = document.getElementById("manualImage");
    
                console.log("Selected option:", selectedOption.value);
                console.log("Image path:", imagePath);
    
                if (imagePath) {
                    manualImage.src = imagePath;
                } else {
                    manualImage.src = './assets/img/book.jpeg'; // Default image path
                }
            };
    
            // Handle downloads
            const handleDownload = async () => {
                const select = document.getElementById("languageSelect");
                const selectedOption = select.options[select.selectedIndex];
                const filePath = selectedOption.getAttribute("data-pdf");
                const userId = localStorage.getItem("loggedInUserId");
    
                if (userId) {
                    const hasDownloaded = await checkDownloadStatus(userId);
                    if (hasDownloaded) {
                        alert("You have already downloaded the manual.");
                        return;
                    }
    
                    const link = document.createElement('a');
                    link.href = filePath;
                    link.download = ''; 
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
    
                    const userRef = doc(db, "users", userId);
                    await setDoc(userRef, { downloaded: true }, { merge: true });
    
                    setTimeout(() => {
                        alert("Thank you for downloading!");
                        document.getElementById("download").style.display = "none";
                        document.getElementById("Grid").style.display = "block";
                        document.getElementById("Grids").style.display = "block";
                        document.getElementById("sec").style.display = "block";
                    }, 5000);
                } else {
                    alert("Please log in to download the manual.");
                }
            };
    
            // Call updateManual on page load to set the initial image
            window.onload = () => {
                updateManual(); // Ensure the image is set on page load
                const userId = localStorage.getItem("loggedInUserId");
                if (userId) {
                    checkDownloadStatus(userId).then(hasDownloaded => {
                        if (hasDownloaded) {
                            document.getElementById("download").style.display = "none";
                            document.getElementById("Grid").style.display = "block";
                            document.getElementById("Grids").style.display = "block";
                            document.getElementById("sec").style.display = "block";
                        }
                    });
                }
            };
    
            // Add event listener for the download button
            document.getElementById("downloadLink").addEventListener("click", handleDownload);


            // Function to fetch user points and calculate total points
const fetchUserPoints = async (userId) => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
        const data = userDoc.data();
        const imagePoints = data.imagePoints || 0; // Default to 0 if not present
        const points = data.commentPoints || 0; // Default to 0 if not present
        const answerpoints = data.Answerpoints || 0;
        const totalPoints = imagePoints + points+answerpoints ;
        
        
        // Display total points
        document.getElementById("totalPoints").innerText = `Total Points: ${totalPoints}`;
    } else {
        console.log("User document does not exist.");
    }
};

// Call fetchUserPoints on page load if user is logged in
// Function to fetch copyright text from Firestore
const fetchCopyrightText = async () => {
    const copyrightRef = doc(db, "settings", "copyright");
    const copyrightDoc = await getDoc(copyrightRef);
    
    if (copyrightDoc.exists()) {
        const copyrightText = copyrightDoc.data().text;
        document.getElementById("copyrightText").innerHTML = copyrightText;
    } else {
        console.error("Copyright document does not exist.");
    }
};

// Call fetchCopyrightText on page load
window.onload = () => {
    updateManual(); // Ensure the image is set on page load
    fetchCopyrightText(); // Fetch and set copyright text
    const userId = localStorage.getItem("loggedInUserId");
    if (userId) {
        checkDownloadStatus(userId).then(hasDownloaded => {
            if (hasDownloaded) {
                document.getElementById("download").style.display = "none";
                document.getElementById("Grid").style.display = "block";
                document.getElementById("Grids").style.display = "block";
                document.getElementById("sec").style.display = "block";
            }
        });
        fetchUserPoints(userId);
    }
};


const updateButtonHref = () => {
    const urlDoc = doc(db, "urls", "participateLink");
    onSnapshot(urlDoc, (doc) => {
        if (doc.exists()) {
            const url = doc.data().link;
            document.getElementById('participate-button').href = url;
        } else {
            console.error('No such document!');
        }
    }, (error) => {
        console.error('Error fetching URL from Firestore:', error);
    });
};

// Call the function to update the button when the script runs
updateButtonHref();
