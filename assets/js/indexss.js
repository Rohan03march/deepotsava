
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
        import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
        import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

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
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);

        let userId;

        document.addEventListener("DOMContentLoaded", () => {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    userId = user.uid;
                    await loadImages("uploadImage");
                } else {
                    window.location.href = "login.html"; // Redirect if not logged in
                }
            });

            document.getElementById("dropZone").addEventListener("click", () => {
                document.getElementById("fileInput").click();
            });

            document.getElementById("fileInput").addEventListener("change", (e) => {
                handleFiles(e.target.files);
            });

            async function handleFiles(files) {
                for (let file of files) {
                    if (!file.type.startsWith("image/")) {
                        continue;
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
                        },
                        (error) => {
                            document.getElementById("status").innerText = "Upload failed: " + error.message;
                            progressContainer.style.display = "none";
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            const imageObject = { 
                                url: downloadURL, 
                                name: newFileName, 
                                timestamp: new Date().toLocaleString(),
                                source: "uploadImage"
                            };

                            const userDocRef = doc(db, "users", userId);
                            await updateDoc(userDocRef, {
                                images: arrayUnion(imageObject),
                                imagePoints: increment(10),
                            });

                            displayImage(imageObject);
                            progressContainer.style.display = "none";
                        }
                    );
                }
            }

            async function loadImages(source) {
                const userDocRef = doc(db, "users", userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const images = userDoc.data().images || [];
                    const filteredImages = images.filter(image => image.source === source);
                    filteredImages.forEach((image) => {
                        displayImage(image);
                    });
                }
            }

            function displayImage(image) {
              const imageGrid = document.getElementById("imageGrid");
          
              const imageContainer = document.createElement("div");
              imageContainer.classList.add("imageContainer");
          
              const img = document.createElement("img");
              img.src = image.url;
              img.alt = image.name;
          
              // Format the date and time
              const formattedDate = formatDate(new Date(image.timestamp));
          
              const timestamp = document.createElement("p");
              timestamp.innerText = `Uploaded on: ${formattedDate}`;
              timestamp.style.fontSize = "15px";
              timestamp.style.textAlign = "center";
              timestamp.style.color = "black"; // Set color to black
              timestamp.style.fontWeight = "bold"; // Make the text bold
          
              const deleteButton = document.createElement("button");
              deleteButton.innerText = "Delete";
              deleteButton.classList.add("deleteButton");
          
              deleteButton.addEventListener("click", async () => {
                  const storageRef = ref(storage, `${userId}/${image.name}`);
                  try {
                      await deleteObject(storageRef);
                      const userDocRef = doc(db, "users", userId);
                      await updateDoc(userDocRef, {
                          images: arrayRemove(image),
                          imagePoints: increment(-10),
                      });
                      imageGrid.removeChild(imageContainer);
                  } catch (error) {
                      alert("Error deleting image: " + error.message);
                  }
              });
          
              imageContainer.appendChild(img);
              imageContainer.appendChild(timestamp);
              imageContainer.appendChild(deleteButton);
              imageGrid.appendChild(imageContainer);
          }
          
          
          function formatDate(date) {
              const options = { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: true 
              };
              return new Intl.DateTimeFormat('en-IN', options).format(date);
          }
        });
    