import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAMfdw6DcFqIlw3zU_6Mk_4_rp0ZIzm9yA",
    authDomain: "lingoplay-945c2.firebaseapp.com",
    projectId: "lingoplay-945c2",
    storageBucket: "lingoplay-945c2.firebasestorage.app",
    messagingSenderId: "682937615930",
    appId: "1:682937615930:web:f8509ee2ae72331166d703",
    measurementId: "G-JEQNEGVYS2"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);