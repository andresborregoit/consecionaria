// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbhI5RJPfAt9P658jXY0C4G8zk6966bqo",
  authDomain: "bdconcesionaria.firebaseapp.com",
  projectId: "bdconcesionaria",
  storageBucket: "bdconcesionaria.appspot.com",
  messagingSenderId: "6521466216",
  appId: "1:6521466216:web:4c18f788803c9263cb7add",
  measurementId: "G-1WK677Q4GK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export { database };