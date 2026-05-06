// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjxe75Ogq1D2XPe7_PCtRfFXBq_O73CBE",
  authDomain: "lutfi-store.firebaseapp.com",
  projectId: "lutfi-store",
  storageBucket: "lutfi-store.firebasestorage.app",
  messagingSenderId: "107703172900",
  appId: "1:107703172900:web:3657339372fe0bb9f7bdb1",
  measurementId: "G-KMFS3SZZK6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);