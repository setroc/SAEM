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
                const {grupo, primerParcial, segundoParcial, tercerParcial, final, materia} = mt;
                // busco la materia por el id para obtener el nombre
                const mtRef = doc(db, "Materia", materia.id);
                const mtSnap = await getDoc(mtRef);
                const nombreMt = mtSnap.data().nombre;
                // añado la materia a la tabla
                addMateria(grupo.id, primerParcial, segundoParcial, tercerParcial, final, nombreMt);
    
            }
        } else {
            document.querySelector("#titulo").innerText="No hay información para mostrar";
            document.querySelector("#contenedorCalificaciones").classList.add('d-none');
        }

    } catch (error) {
        console.log(error)
    }
})

function addMateria(grupo, primerParcial, segundoParcial, tercerParcial, finalParcial, nombreMateria, extraordinario = 100) {
    let tabla = document.getElementById('tablaCalificaciones');
    let cuerpoTabla = document.createElement('tbody');
    let fila = document.createElement('tr');
    let td = document.createElement('td');
    td.innerText = grupo;
    fila.appendChild(td);
    td = document.createElement('td');
    td.innerText = nombreMateria;
    fila.appendChild(td);
    td = document.createElement('td');
    td.innerText = primerParcial ? primerParcial : '';
    fila.appendChild(td);
    td = document.createElement('td');
    td.innerText = segundoParcial ? segundoParcial : '';
    fila.appendChild(td);
    td = document.createElement('td');
    td.innerText = tercerParcial ? tercerParcial : '';
    fila.appendChild(td);
    td = document.createElement('td');
    td.innerText = finalParcial ? finalParcial : '';
    fila.appendChild(td);
    td = document.createElement('td');
    td.innerText = extraordinario > 10 ? 'NP': extraordinario;
    fila.appendChild(td);
    cuerpoTabla.appendChild(fila);
    tabla.appendChild(cuerpoTabla);
}