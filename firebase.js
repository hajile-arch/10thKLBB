// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAL4TPGkhr1Z3z42wFTwawVfKVcmEshLTk",
  authDomain: "thklbb-74984.firebaseapp.com",
  projectId: "thklbb-74984",
  storageBucket: "thklbb-74984.firebasestorage.app",
  messagingSenderId: "599072173803",
  appId: "1:599072173803:web:56ebec3d2be4f29e04d8ae",
  measurementId: "G-VDZVS082J6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

