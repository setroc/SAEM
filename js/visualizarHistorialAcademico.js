import {db, datosPeriodo, promedioGeneral} from './firebase.js';
import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc } from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"


window.onload = async () => {
  try {
    const promedio = await promedioGeneral();
    document.querySelector('#promedio').textContent = promedio.toFixed(2);

    const {periodo} = await datosPeriodo();
    // Referencia a la coleccion Inscripcion
    const inscripcionRef = collection(db,"Inscripcion");
    // Referencia al alumno
    const alumnoRef = doc(db,"Usuario",localStorage.getItem('boleta'));
    // query para traer todas las inscripciones del usuario, excepto del periodo actual
    const q = query(inscripcionRef, where('alumno','==',alumnoRef), where('periodo','!=',periodo));
    // ejecucion del query
    const querySnapshot = await getDocs(q);
    
    let periodoSemestre;
    let materias = [];
    querySnapshot.forEach((documento)=>{
      // console.log(documento.id, '=>',documento.data());
      const {periodo, materias:mts} = documento.data();
      // inserto en la tabla los datos de ese periodo
      insertarTabla(periodo, mts);
    })
  } catch (error) {
    console.log(error)
  }


}

const insertarTabla = async (periodo, materias) => {
  const tablaContenedor = document.querySelector('#tablas');
  // tabla
  const table = document.createElement('table');
  table.classList.add('table','table-stripped','table-primary');
  // head de la tabla
  let body = `
    <thead>
      <tr>
        <th scope="col" colspan="6" >${periodo}</th>
      </tr>
    </thead>
    <tbody>
        <tr class="cabecera">
          <th>Clave</th>
          <td>Materia</td>
          <td>Periodo</td>
          <td>Forma de evaluación</td>
          <td>Calificación</td>
        </tr>
  `;
  // materias inscritas de ese periodo
  for (let mt of materias ) {
    const nombreMt = await getNombreMateriaPorId(mt.materia.id);
    const idMt = mt.materia.id;
    const calificacion = mt.final;
    body += `
        <tr>
          <th>${idMt}</th>
          <th>${nombreMt}</th>
          <th>${periodo}</th>
          <th>Ordinaria</th>
          <th>${calificacion}</th>
        </tr>
    `
  }
  body += '</tbody>';
  table.innerHTML = body;
  tablaContenedor.appendChild(table);

} 

const getNombreMateriaPorId = async (materiaId) => {
  const materiaRef = doc(db, 'Materia', materiaId);
  const materiaSnap = await getDoc(materiaRef);
  const nombreMt = materiaSnap.data().nombre;
  return nombreMt;
}

  