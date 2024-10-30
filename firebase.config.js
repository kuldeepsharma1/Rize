// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDastE9jHuTQq917IYfLRW4pzePdpOBx8",
  authDomain: "rize-e8d24.firebaseapp.com",
  projectId: "rize-e8d24",
  storageBucket: "rize-e8d24.appspot.com",
  messagingSenderId: "914179038403",
  appId: "1:914179038403:web:e5f8255db06dae41089676",
  measurementId: "G-KQ3HNQZGMR"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth =getAuth(app);
const analytics = getAnalytics(app);