import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import storage

const firebaseConfig = {
  apiKey: "AIzaSyDhS60urkOWirwN32eWcGrTum_UuW1F03E",
  authDomain: "fuelq-864ff.firebaseapp.com",
  projectId: "fuelq-864ff",
  storageBucket: "fuelq-864ff.appspot.com",
  messagingSenderId: "377378522514",
  appId: "1:377378522514:web:2f87674735f98184d5ed4b",
  measurementId: "G-2H3W4B7Z8L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize storage

export { app, analytics, auth, storage };