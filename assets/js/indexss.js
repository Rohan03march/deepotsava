import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

// Your Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let userId;

document.addEventListener("DOMContentLoaded", () => {
  // Handle authentication state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userId = user.uid;
      await loadImages(); // Load images after user is authenticated
      await updatePointsDisplay(); // Display initial points
    } else {
      window.location.href = "index.html"; // Redirect if not logged in
    }
  });

  document.getElementById("dropZone").addEventListener("click", () => {
    document.getElementById("fileInput").click();
  });

  document.getElementById("dropZone").addEventListener("dragover", (e) => {
    e.preventDefault();
    document.getElementById("dropZone").style.backgroundColor = "#e8f0ff";
  });

  document.getElementById("dropZone").addEventListener("dragleave", () => {
    document.getElementById("dropZone").style.backgroundColor = "";
  });

  document.getElementById("dropZone").addEventListener("drop", (e) => {
    e.preventDefault();
    document.getElementById("dropZone").style.backgroundColor = "";
    handleFiles(e.dataTransfer.files);
  });

  document.getElementById("fileInput").addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });

  async function handleFiles(files) {
    for (let file of files) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Check if the user has already uploaded an image today
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      let canUpload = true; // Flag to check if user can upload
      if (userDoc.exists()) {
        const lastImageTimestamp = userDoc.data().lastUploadTimestamp;
        const currentDate = new Date();
        
        // Check if the last upload timestamp exists and is for today
        if (lastImageTimestamp) {
          const lastUploadDate = lastImageTimestamp.toDate();
          if (
            lastUploadDate.getFullYear() === currentDate.getFullYear() &&
            lastUploadDate.getMonth() === currentDate.getMonth() &&
            lastUploadDate.getDate() === currentDate.getDate()
          ) {
            canUpload = false; // User has already uploaded an image today
          }
        }
      }
      

      if (!canUpload) {
        document.getElementById("status").innerText = "You can only upload one image per day.";
        return; // Exit if user cannot upload
      }

      const originalName = file.name.split(".")[0];
      const extension = file.name.split(".").pop();
      const newFileName = `${originalName}_${Date.now()}.${extension}`;

      const storageRef = ref(storage, `${userId}/${newFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const progressContainer = document.getElementById("progressContainer");
      const progressBar = document.getElementById("progressBar");
      const progressText = document.getElementById("progressText");
      progressContainer.style.display = "block";

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBar.style.width = `${progress}%`;
          progressText.innerText = `${Math.floor(progress)}%`;

          if (progress < 100) {
            progressBar.style.backgroundColor = "blue";
          }
        },
        (error) => {
          document.getElementById("status").innerText = "Upload failed: " + error.message;
          progressContainer.style.display = "none";
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          document.getElementById("status").innerText = "Upload successful!";
          progressBar.style.backgroundColor = "green";
          progressText.innerText = "100%";

          const imageObject = { 
            url: downloadURL, 
            name: newFileName, 
            timestamp: new Date().toLocaleString() // Add timestamp here
          };

          // Update user's document with the new image and the last upload timestamp
          await updateDoc(userDocRef, {
            images: arrayUnion(imageObject),
            imagePoints: increment(10),
            lastUploadTimestamp: new Date() // Store the current timestamp
          });

          displayImage(imageObject);
          await updatePointsDisplay(); // Update points display after upload
          progressContainer.style.display = "none";
        }
      );
    }
  }

  async function loadImages() {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const images = userDoc.data().images || [];
      images.forEach((image) => {
        displayImage(image);
      });
    }
  }

  async function updatePointsDisplay() {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const imagePoints = userDoc.data().imagePoints || 0;
      document.getElementById("totalPoints").innerText = `Total Points: ${imagePoints}`;
    }
  }

  function displayImage(image) {
    const imageGrid = document.getElementById("imageGrid");

    const imageContainer = document.createElement("div");
    imageContainer.classList.add("imageContainer");

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.name;

    const timestamp = document.createElement("p");
    timestamp.innerText = `Uploaded on: ${image.timestamp}`; // Display timestamp
    timestamp.style.fontSize = "15px";
    timestamp.style.textAlign = "center";
    timestamp.style.color = "black";
    imageContainer.appendChild(img);
    imageContainer.appendChild(timestamp); // Append timestamp below the image
    imageGrid.appendChild(imageContainer);
  }
});
