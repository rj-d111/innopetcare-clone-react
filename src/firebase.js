// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import "firebase/compat/performance";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNWx6D1QyaezRE9TM8C-b6_gbxJXepLWU",
  authDomain: "innopetcare-2a866.firebaseapp.com",
  databaseURL: "https://innopetcare-2a866-default-rtdb.firebaseio.com",
  projectId: "innopetcare-2a866",
  storageBucket: "innopetcare-2a866.appspot.com",
  messagingSenderId: "485214746152",
  appId: "1:485214746152:web:872da38df2d3c8df82e71d",
  measurementId: "G-SCXNZK8VMZ"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyCUUnn8RNKS-32CclPHhTGEcvSTysG1pSo",
//   authDomain: "innopetcare-final.firebaseapp.com",
//   projectId: "innopetcare-final",
//   storageBucket: "innopetcare-final.firebasestorage.app",
//   messagingSenderId: "1068691259140",
//   appId: "1:1068691259140:web:984b715a76116ab66e5a51",
//   measurementId: "G-3BCXS46RY8"
// };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// const perf = firebase.performance();
