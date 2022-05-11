import {db, datosPeriodo} from './firebase.js';
import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc } from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"


window.onload = async () => {
  try {
    const alumnoRef = doc(db, 'Usuario', localStorage.getItem('boleta'));
    const {periodo} = await datosPeriodo();
    const inscripcionEtsRef = collection(db, 'InscripcionEts');
    const q = query(inscripcionEtsRef, where('alumno','==',alumnoRef), where('periodo','==',periodo));

    const querySnapshot = await getDocs(q);

    let mts = [];
    querySnapshot.forEach(async(docu)=>{
      const {materias, calificacion} = docu.data();
      mts = materias;
    })
    for(let mt of mts) {
      const mtNombre = await getMateriaPorId(mt.materia.id);
      const calificacion = mt.calificacion < 0 ? '' : mt.calificacion;

      addFila(mtNombre, calificacion);
    }
  } catch (error) {
    console.log(error)
  }
} 
const getMateriaPorId = async(id)=>{
  try {
    const mtRef = doc(db, 'Materia', id);
    const mtSnap = await getDoc(mtRef);
    return mtSnap.data().nombre;    
  } catch (error) {
    console.log(error)
  }
}

const addFila = (materia, calificacion) => {
  const tabla = document.querySelector('#wang>tbody');
  const tr = document.createElement('tr');
  let td = document.createElement('td');
  td.textContent = materia;
  tr.appendChild(td);
  td = document.createElement('td');
  td.textContent = calificacion;
  tr.appendChild(td);

  tabla.appendChild(tr)
}