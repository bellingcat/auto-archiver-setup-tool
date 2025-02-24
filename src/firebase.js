import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEawXAq9pajlVKQtLopWyd_ELDwoUlbDo",
  authDomain: "bellingcat-auto-archiver-b85db.firebaseapp.com",
  projectId: "bellingcat-auto-archiver-b85db",
  storageBucket: "bellingcat-auto-archiver-b85db.appspot.com",
  messagingSenderId: "406209235111",
  appId: "1:406209235111:web:f27327bed2db7295a43382",
};

const firebaseApp = initializeApp(firebaseConfig);

const firebaseAuth = getAuth(firebaseApp);

const firebaseFirestore = getFirestore(firebaseApp);

export { firebaseApp, firebaseAuth, firebaseFirestore, firebaseConfig };
