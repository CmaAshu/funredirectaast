import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            "AIzaSyBcZusmovncachIGDreXJ0c_U-pHDzJQQk",
  authDomain:        "prepogy-8394c.firebaseapp.com",
  projectId:         "prepogy-8394c",
  storageBucket:     "prepogy-8394c.firebasestorage.app",
  messagingSenderId: "14046429380",
  appId:             "1:14046429380:web:e8d0ab7f63ea18c459c991",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
setPersistence(auth, browserLocalPersistence)
