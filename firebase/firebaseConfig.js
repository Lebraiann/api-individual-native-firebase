import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_27YmBdSNAhzufLFtDOZV7AAAj1akUFo",
  authDomain: "pokeapi2-9e2ec.firebaseapp.com",
  projectId: "pokeapi2-9e2ec",
  storageBucket: "pokeapi2-9e2ec.appspot.com",
  messagingSenderId: "558999792670",
  appId: "1:558999792670:web:c79d2ae033ba4c6684d20f"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ ¡Esto es necesario!

export { auth, db };