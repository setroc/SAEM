import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc } from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUDpKwxRW0IlZOJ17_vgCZOMeMsBzMFrA",
  authDomain: "saem-pruebas.firebaseapp.com",
  projectId: "saem-pruebas",
  storageBucket: "saem-pruebas.appspot.com",
  messagingSenderId: "60354804884",
  appId: "1:60354804884:web:b8d113aee95bb731dd4881"
};
export const app = initializeApp(firebaseConfig)
export const db = getFirestore();




export const datosPeriodo = async() => {
  try {
    const docRef = doc(db,"Datos","D0001");
    const querySnapshot = await getDoc(docRef);
    const {periodo, ets, inscripcion} = querySnapshot.data();
    return {
      periodo,
      ets,
      inscripcion
    }
} catch (error) {
    console.log(error)
}
}

export const kardex = async () =>
{
  const materias_cursadas = query(collection(db,"Alumnos"), where("boleta","==",2020630148));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.exists())
  {
    var content = '';
    querySnapshot.forEach(function(data)
    {
      var val = data.val();
      content += '<tr>';
      content += '<td>' + val.boleta + '</td>';
      content += '<td>' + val.nombre + '</td>';
      content += '<td>' + val.apellidoPaterno + '</td>';
      content += '<td>' + val.apellidoMaterno + '</td>';
      content += '<td>' + val.numeroContacto + '</td>';
      content += '</tr>';
    });
    $('#wang').append(content);
  }
}

export const getMaterias = () => getDocs(collection(db,'Materias'));

// Regresa el id de las materias reprobadas
export const materiasReprobadas = async () => {
  // Referencia del alumno 
  const alumnoRef = doc(db,'Usuario', localStorage.getItem('boleta'));
  // ref a la coleccion de inscripcion
  const inscripcionRef = collection(db, 'Inscripcion');
  // 
  const q = query(inscripcionRef, where('alumno','==',alumnoRef));
  // 
  const querySnapshot = await getDocs(q);
  // arreglo de materias reprobadas
  const materiasReprobadas = [];
  querySnapshot.forEach((documento)=> {
    const {materias} = documento.data();
    for (let mt of materias) {
      if (mt?.final <= 5) {
        materiasReprobadas.push(mt.materia.id);
      }
    }
  });

  return materiasReprobadas;
} 
// Regresa el promedio general
export const promedioGeneral = async () => {
  // Referencia del alumno 
  const alumnoRef = doc(db,'Usuario', localStorage.getItem('boleta'));
  // ref a la coleccion de inscripcion
  const inscripcionRef = collection(db, 'Inscripcion');
  // 
  const q = query(inscripcionRef, where('alumno','==',alumnoRef));
  // 
  const querySnapshot = await getDocs(q);
  // arreglo de materias reprobadas
  let promedio = 0;
  let sum = 0;
  let i = 0;
  querySnapshot.forEach((documento)=> {
    const {materias} = documento.data();
    for (let mt of materias) {
      if ( mt?.final ) {
        sum += mt.final;
        i++;
      }
    }
  });

  promedio = sum / i;
  return promedio;
} 
