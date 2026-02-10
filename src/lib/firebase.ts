import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqt8U0qHGmxVpgf-MoJl1PggUXZffbo3Y",
  authDomain: "vitiligo-cure.firebaseapp.com",
  projectId: "vitiligo-cure",
  storageBucket: "vitiligo-cure.firebasestorage.app",
  messagingSenderId: "735775571501",
  appId: "1:735775571501:web:cb6f96950b035d8a3142a4",
  measurementId: "G-9RZ31J863M",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
