import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzFB3vK98lI9WjRKBBMmUzmwyD7yxVFD4",
  authDomain: "wattswap-953a8.firebaseapp.com",
  databaseURL: "https://wattswap-953a8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wattswap-953a8",
  storageBucket: "wattswap-953a8.appspot.com",
  messagingSenderId: "291991870594",
  appId: "1:291991870594:web:53ee785c27f8d5d9a3e89b",
  measurementId: "G-4NWE1WFRJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app)
export { database, firestore }