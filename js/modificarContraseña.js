import{materiasReprobadas, promedioGeneral} from './firebase.js';
import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc, setDoc, updateDoc} from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

window.onload = async()=> {
  await materiasReprobadas();
  await promedioGeneral();
}