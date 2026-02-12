import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for product-2778e
const firebaseConfig = {
    apiKey: "AIzaSyDHwDueHtTGnuoedNTVaPhERZ5eT10sFjU",
    authDomain: "product-2778e.firebaseapp.com",
    projectId: "product-2778e",
    storageBucket: "product-2778e.firebasestorage.app",
    messagingSenderId: "212439259428",
    appId: "1:212439259428:web:72f17df9937f73aa1fbbb1",
    measurementId: "G-6BG4WM57P5"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
