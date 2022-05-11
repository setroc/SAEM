import {db, datosPeriodo, promedioGeneral, materiasReprobadas } from './firebase.js';
import {getFirestore, collection, addDoc, query, where, getDocs, getDoc, doc} from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

window.addEventListener('DOMContentLoaded', async () => {

    try {
        const promedio = await promedioGeneral();
        const materiasRp = await materiasReprobadas();
        const {periodo, inscripcion} = await datosPeriodo();

        if (inscripcion) { // se pueden inscribir
            // Referencia a la coleccion Inscripcion
            const inscripcionRef = collection(db,"Inscripcion");
            // Referencia al alumno
            const alumnoRef = doc(db,"Usuario",localStorage.getItem('boleta'));
            // Query donde me traera la inscricion de un alumno por su boleta y el periodo
            const q = query(inscripcionRef, where("periodo","==",periodo), where("alumno","==",alumnoRef));
            // Ejecución de la query
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(doc=>{
                const {citaInscripcion} = doc.data();
                // Le doy formato a la cita
                let cita = citaInscripcion.toDate();

                addFila(getFecha(cita),getFecha(new Date(cita.setHours(cita.getHours()+1))), promedio.toFixed(2), materiasRp.length);


            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'No hay información para mostrar',
                text: 'No existe información',
                confirmButtonText: 'Aceptar'
            })
            console.log('No es epoca de inscripción');
        }
    } catch (error) {
        console.log(error)
    }
})

//Añade a la tabla de la cita de reinscripción los siguientes datos:
//promedio, número de materias reprobadas, fecha de inscripción y fecha de caducidad
function addFila(cita, citaFin, promedio, materiasReprobadas) {
    let tabla = document.getElementById("tablaCitaReinscripcion");
    let cuerpoTabla = document.createElement("tbody");
    let fila = document.createElement("tr");
    // promedio
    let td = document.createElement("td");
    td.innerText = promedio;
    fila.appendChild(td);
    // cantidad de materias reprobadas
    td = document.createElement("td");
    td.innerText = materiasReprobadas;
    fila.appendChild(td);
    // fecha de inscripcion
    td = document.createElement("td");
    td.innerText = cita;
    fila.appendChild(td);
    // fecha de caducidad
    td = document.createElement("td");
    td.innerText = citaFin;
    fila.appendChild(td);
    
    cuerpoTabla.appendChild(fila);

    tabla.appendChild(cuerpoTabla);
}
//Regresa una fecha con el sigueinte formato: DD/MM/AAAA hh:mm:ss
function getFecha(date) {

    let día = date.getDate();
    let mes = date.getMonth() + 1; //Se suma 1 porque la función regresa un valor entre 0 y 11
    const año = date.getFullYear();
    let hora = date.getHours();
    let minutos = date.getMinutes();
    let segundos = date.getSeconds();

    //En caso de que el valor solo tenga una cifra
    if(día <= 9)
        día = "0" + día;
    
    if(mes <= 9)
        mes = "0" + mes;

    if(hora <= 9)
        hora = "0" + hora;
    
    if(minutos <= 9)
        minutos = "0" + minutos;
    
    if(segundos <= 9)
        segundos = "0" + segundos;

    return día + "/" + mes + "/" + año + " " + hora + ":" + minutos + ":" + segundos;
}

