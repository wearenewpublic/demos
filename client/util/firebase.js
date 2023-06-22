import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

const firebaseConfig = {
    apiKey: "AIzaSyBLcy9WE1RVzRZd95b1d9EE-ncd4kZmvks",
    authDomain: "new-public-demo.firebaseapp.com",
    projectId: "new-public-demo",
    storageBucket: "new-public-demo.appspot.com",
    messagingSenderId: "404606427399",
    appId: "1:404606427399:web:e9249eb61f7e76891a65a2",
    measurementId: "G-2YYTM8W42P"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log('firebase initialized', {app, auth});

export function useFirebaseUser() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('auth state', user);
            setUser(user);
        });
        return unsubscribe;
    }, []);
    return user;           
}

onAuthStateChanged(auth, (user) => {
    console.log('auth state', user);
});

export function firebaseSignOut() {
    auth.signOut();
}

export {auth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithEmailAndPassword};

