import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc } from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {db} from './firebase.js';

const contenedor = document.querySelector("#contenedor");

window.onload = async () => {
  const boleta = localStorage.getItem('boleta') || '';
  const ref = doc(db, "Usuario", boleta);
  const querySnapshot = await getDoc(ref);
  const data = querySnapshot.data();
  
  contenedor.innerHTML = `
    <p>Nombre: ${data.nombre + " " + data.aPaterno + " " + data.aMaterno}</p>
    <p>Fecha de nacimiento: ${data.diaNac+"/"+data.mesNac+"/"+data.anioNac}</p>
    <p>Nacionalidad: ${data.nacionalidad}</p>
    <p>CURP: ${data.curp}</p>
    <p>E-mail: ${data.correo}</p>
    <p>Teléfono: ${data.telefono}</p>
    <h2>Dirección</h2>
    <p>Calle: ${data.direccion.calle}</p>
    <p>Número exterior: ${data.direccion.numExt}</p>
    <p>Número interior: ${data.direccion?.numInt || 'N/A'}</p>
    <p>Colonia: ${data.direccion.colonia}</p>
    <p>Delegacion o Municipio: ${data.direccion.delegacion}</p>
    <p>Estado: ${data.direccion.estado}</p>
  `;
}