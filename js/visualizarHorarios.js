import {db, datosPeriodo} from './firebase.js';
import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc } from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

window.addEventListener('DOMContentLoaded', async () => {

    try {
        const {periodo, inscripcion} = await datosPeriodo();
        // Si es periodo de inscripción, entonces no hay materias ni calificaciones que mostrar
        if (!inscripcion) {
            // Referencia a la coleccion Inscripcion
            const inscripcionRef = collection(db,"Inscripcion");
            // Referencia al alumno
            const alumnoRef = doc(db,"Usuario",localStorage.getItem('boleta'));
            // Query donde me traera la inscricion de un alumno por su boleta y el periodo
            const q = query(inscripcionRef, where("periodo","==",periodo), where("alumno","==",alumnoRef));
            // Ejecucion de la query
            const querySnapshot = await getDocs(q);
            let materiasInscritas = [];
            // Obtengo solo las materias de la inscripcion actual y los guardo en un array "materiasInscritas"
            querySnapshot.forEach((doc)=>{
                materiasInscritas = doc.data().materias;
            })
            // Recorro el arreglo de materiasInscritas el cual tiene las materias inscritas con sus calificaciones, grupo y id de la materia
            for ( let mt of materiasInscritas ) {
                const {materia, grupo} = mt;
                // busco la materia por el id para obtener el nombre
                const mtRef = doc(db, "Materia", materia.id);
                const mtSnap = await getDoc(mtRef);
                const nombreMt = mtSnap.data().nombre;

                // busco el grupo por el id para obtener el horario y la referencia al profesor
                const gpoRef = doc(db,"Grupo",grupo.id);
                const gpoSnap = await getDoc(gpoRef);
                const {profesor, ...horario} =gpoSnap.data()[materia.id];

                // busco el profesor por su id para obtener su nombre
                const profRef = doc(db,'Usuario',profesor.id);
                const profSnap = await getDoc(profRef);
                const nombreProf = profSnap.data();
                // Añado los datos a la tabla
                addMateria(grupo.id, nombreMt, nombreProf, horario);
            }
        } else {
            const texto = document.createElement('h1');
            texto.innerText = 'No hay información para mostrar';
            texto.classList.add('text-center')
            document.querySelector("#contenedor").appendChild(texto);
            document.querySelector("#tablaHorario").classList.add('d-none');
        }

    } catch (error) {
        console.log(error)
    }
})

function addMateria(grupo, materia, profesor, horario) {
    let tabla = document.getElementById('tablaHorario');
    let cuerpoTabla = document.createElement('tbody');

    let fila = document.createElement('tr');

    let td = document.createElement('td');
    td.innerText = grupo;
    fila.appendChild(td);

    td = document.createElement('td');
    td.innerText = materia;
    fila.appendChild(td);

    td = document.createElement('td');
    td.innerText = profesor.nombre+' '+profesor.aPaterno+' '+profesor.aMaterno;
    fila.appendChild(td);
    // Edificio
    td = document.createElement('td');
    td.innerText = ' ';
    fila.appendChild(td);
    // Lunes
    td = document.createElement('td');
    td.innerText = horario?.lunes || '';
    fila.appendChild(td);
    // martes
    td = document.createElement('td');
    td.innerText = horario?.martes || '';
    fila.appendChild(td);
    // miercoles
    td = document.createElement('td');
    td.innerText = horario?.miercoles || '';
    fila.appendChild(td);
    // jueves
    td = document.createElement('td');
    td.innerText = horario?.jueves || '';
    fila.appendChild(td);
    // viernes
    td = document.createElement('td');
    td.innerText = horario?.viernes || '';
    fila.appendChild(td);

    cuerpoTabla.appendChild(fila);
    tabla.appendChild(cuerpoTabla);
}