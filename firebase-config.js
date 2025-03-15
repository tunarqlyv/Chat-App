// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7DTrXHDDPMsbzoDy1jZ4GgblJGzzmF8o",
  authDomain: "paint-word-c95df.firebaseapp.com",
  databaseURL: "https://paint-word-c95df-default-rtdb.firebaseio.com",
  projectId: "paint-word-c95df",
  storageBucket: "paint-word-c95df.appspot.com",
  messagingSenderId: "327023711325",
  appId: "1:327023711325:web:bbb1bdc855307dcc2969b4",
  measurementId: "G-YHM2R62SVP"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
