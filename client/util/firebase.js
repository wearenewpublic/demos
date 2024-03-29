import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, onValue, push, ref, set } from "firebase/database";
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
const database = getDatabase(app);

var global_firebaseUser = null;

export function useFirebaseUser() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            global_firebaseUser = user;
            setUser(user);
        });
        return unsubscribe;
    }, []);
    return user;           
}

export function getFirebaseUser() {
    return global_firebaseUser;
}

onAuthStateChanged(auth, (user) => {
    global_firebaseUser = user;
});

export async function getFirebaseIdTokenAsync() {
    return await auth.currentUser?.getIdToken() || null;
}

export function firebaseSignOut() {
    auth.signOut();
}

export function onFbUserChanged(callback) {
    return onAuthStateChanged(auth, callback);
}

export function firebaseNewKey() {
	return push(ref(database)).key;
}

export function firebaseWriteAsync(pathList, data) {
    const pathString = makeFirebasePath(pathList);
    return set(ref(database, pathString), data);
}

export function firebaseWatchValue(pathList, callback) {
    const pathString = makeFirebasePath(pathList);
    return onValue(ref(database, pathString), snapshot => {
        callback(snapshot.val())
    });
}

export function useFirebaseData(pathList, defaultValue=null) {
    const [data, setData] = useState(null);
    const pathString = makeFirebasePath(pathList);
    const nullPath = pathList.some(p => p == null || p == undefined);

    useEffect(() => {
        if (nullPath) return;
        const unsubscribe = onValue(ref(database, pathString), snapshot => {
            setData(snapshot.val() || defaultValue)
        });
        return unsubscribe;
    }, [pathString]);
    return data;
}

export function getFirebaseDataAsync(pathList) {
    const pathString = makeFirebasePath(pathList);
    return ref(database, pathString).get().then(snapshot => snapshot.val());
}

function makeFirebasePath(pathList) {
    return pathList.join('/');
}

export {auth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithEmailAndPassword};

