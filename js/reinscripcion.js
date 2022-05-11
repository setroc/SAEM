import {db, datosPeriodo} from './firebase.js';
//import {jsPDF} from 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc, updateDoc } from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

let creditos = 18;
let materiasInscritas = [];

document.querySelector("#form_buscar").addEventListener('submit',async(e) => {
    e.preventDefault();
    // const turno = document.querySelector("#form_buscar")['turno'].value.toUpperCase();
    // const carrera = document.querySelector("#form_buscar")['carrera'].value;
    const grupo = document.querySelector("#form_buscar")['grupo'].value;
    const materia =  document.querySelector("#form_buscar")['materia'].value;

    try {
        if(materia) { // Se busca por materia y grupo
            console.log('hola')
            // Busco el grupo para traer las materias, el horario y el id del profe
            const gpoRef = doc(db,"Grupo",grupo.toUpperCase());
            const gpoSnap = await getDoc(gpoRef);
            
            // [idMateria||turno, {horario, profesor} || VESPERTINO/MATUTINO ]
            const materias = Object.entries(gpoSnap.data());

            for (let mt of materias) {
                if (mt[0]!=='turno') {
                    // busco la materia por el id para obtener el nombre
                    const mtRef = doc(db,"Materia",mt[0]);
                    const mtSnap = await getDoc(mtRef);
                    const nombreMt = mtSnap.data().nombre;
                    if ( materia === nombreMt) { // Solo añado la materia que se esta buscando
                        const {profesor, ...horario} = mt[1];
                        // busco el profesor por su id para obtener su nombre
                        const profRef = doc(db,'Usuario',profesor.id);
                        const profSnap = await getDoc(profRef);
                        const nombreProf = profSnap.data();

                        addMateria(grupo.toUpperCase(), nombreMt,mt[0],nombreProf,horario);
                    }
                }
            }

        } else { // Se busca solo por grupo
            // Busco el grupo para traer las materias, el horario y el id del profe
            const gpoRef = doc(db,"Grupo",grupo.toUpperCase());
            const gpoSnap = await getDoc(gpoRef);
    
            // [idMateria||turno, {horario, profesor} || VESPERTINO/MATUTINO ]
            const materias = Object.entries(gpoSnap.data());
    
            for (let mt of materias) {
                if (mt[0]!=='turno') {
                    // busco la materia por el id para obtener el nombre
                    const mtRef = doc(db,"Materia",mt[0]);
                    const mtSnap = await getDoc(mtRef);
                    const nombreMt = mtSnap.data().nombre;
    
                    const {profesor, ...horario} = mt[1];
                    // busco el profesor por su id para obtener su nombre
                    const profRef = doc(db,'Usuario',profesor.id);
                    const profSnap = await getDoc(profRef);
                    const nombreProf = profSnap.data();
                    addMateria(grupo.toUpperCase(), nombreMt,mt[0],nombreProf,horario);
    
    
                }
            }
        }


    } catch (error) {
        console.log(error);
    }
});

const addMateria = (grupo, materia, materiaId, profesor, horario, mtRef) => {

    // Añado la materia al dom
    const tabla = document.querySelector('#tabla-busqueda>tbody');
    const fila = document.createElement('tr');

    let td = document.createElement('td');
    td.innerText = grupo;
    fila.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = materia;
    fila.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = profesor.nombre+' '+profesor.aPaterno+' '+profesor.aMaterno;
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
    // boton
    td = document.createElement('td');
    td.classList.add('d-flex','justify-content-center');
    let btn = document.createElement('button');
    btn.classList.add('btn','btn-primary','btn-sm','d-flex');
    btn.innerText="Inscribir";
    btn.setAttribute('data-id',materiaId)
    // añado un event listener para cuando quiera inscribir esa materia
    const datos = { grupo, materia, materiaId, profesor, horario}
    btn.addEventListener('click',(e)=>inscribirMateria(e,datos));
    td.appendChild(btn);
    fila.appendChild(td);

    tabla.appendChild(fila);

}

const inscribirMateria = async(e, datos) => {
    try {
        // obtengo el id de la materia a inscribir
        const idMt = e.target.getAttribute('data-id');

        // Comprobar si la materia no esta inscrita
        if (!document.querySelector(`#${idMt}`)) { // No esta inscrita
            // Obtengo los creditos de la materia
            const mtRef = doc(db,"Materia",idMt);
            const mtSnap = await getDoc(mtRef);
            const { creditos:cr} = mtSnap.data();
    
            // cmpruebo si  tengo creditos para inscribir la materia
            if (creditos - cr >= 0 ) { // Puedo inscribir la materia
                // Reducimos los creditos de la materia
                creditos -= cr;
                // Añadimos la materia al array de materias inscritas
                materiasInscritas.push({grupo: datos.grupo, materia: datos.materiaId});
                // Añadimos la materia en la tabla de horario actual (DOM)
                addMateriaInscrita(datos.grupo, datos.materia, datos.materiaId, datos.profesor, datos.horario);
                Swal.fire({
                    icon: 'success',
                    title: 'Materia inscrita',
                    text: 'Créditos disponibles: '${creditos},
                    confirmButtonText: 'Aceptar'
                })
            } else { // No puedo inscribir la materia
                Swal.fire({
                    icon: 'error',
                    title: 'Materia no inscrita',
                    text: 'Créditos insuficientes',
                    confirmButtonText: 'Aceptar'
                })
            }
        } else { // esta inscrita
            Swal.fire({
                icon: 'error',
                title: 'Inscripción de materia inválida',
                text: 'La materia ya está inscrita',
                confirmButtonText: 'Aceptar'
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const addMateriaInscrita = (grupo, materia, materiaId, profesor, horario) => {
    const tabla = document.querySelector('#inscripcion-tabla>tbody');
    const fila = document.createElement('tr');
    fila.setAttribute('id',materiaId);

    let td = document.createElement('td');
    td.innerText = grupo;
    fila.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = materia;
    fila.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = profesor.nombre+' '+profesor.aPaterno+' '+profesor.aMaterno;
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
    // boton
    td = document.createElement('td');
    td.classList.add('d-flex','justify-content-center');
    let btn = document.createElement('button');
    btn.classList.add('btn','btn-danger','btn-sm','d-flex');
    btn.innerText="Borrar";
    btn.setAttribute('data-id',materiaId)
    // añado un event listener para cuando quiera eliminar esa materia
    btn.addEventListener('click',()=>eliminarMateria(materiaId, grupo));
    td.appendChild(btn);
    fila.appendChild(td);

    tabla.appendChild(fila);
}
// Funcion que elimina la materia de la tabla de las materias inscritas
const eliminarMateria = async (materiaId, grupo) => {
    try {
        const tabla = document.querySelector('#inscripcion-tabla>tbody');
        const fila = document.querySelector(`#${materiaId}`);
        if ( fila ) {
            // Obtengo los creditos de la materia
            const mtRef = doc(db,"Materia",materiaId);
            const mtSnap = await getDoc(mtRef);
            const { creditos:cr} = mtSnap.data();
            // Agrgeo los creditos de la materia borrada
            creditos += cr;
            // Elimino la fila de la materia del DOM
            tabla.removeChild(fila);
            // Elimino la materia del array de materias inscritas
            materiasInscritas = materiasInscritas.filter((elemento)=>elemento.grupo !== grupo || elemento.materia !== materiaId );
        }
    } catch (error) {
        console.log(error);
    }
}

const btnFinalizarInscripcion = document.querySelector('#finalizar');
btnFinalizarInscripcion.addEventListener('click',()=>finalizarInscripcion());

const finalizarInscripcion = async () => {
    // console.log(t)
    try {
        const {periodo} = await datosPeriodo();
        // Referencia a la coleccion Inscripcion
        const inscripcionRef = collection(db,"Inscripcion");
        // Referencia al alumno
        const alumnoRef = doc(db,"Usuario",localStorage.getItem('boleta'));
        // Query donde me traera la inscricion de un alumno por su boleta y el periodo
        const q = query(inscripcionRef, where("periodo","==",periodo), where("alumno","==",alumnoRef));
        // Ejecucion de la query
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async(documento)=>{
            const materias = materiasInscritas.map(({grupo, materia})=>{
                // referenica de la materia
                const mtRef = doc(db,"Materia",materia);
                // referencia del grupo
                const gpoRef = doc(db,"Grupo",grupo);
                return  {
                    materia: mtRef,
                    grupo: gpoRef
                }
            });
            await updateDoc(doc(db,'Inscripcion',documento.id),{materias});
            Swal.fire({
                icon: 'success',
                title: 'Reinscripción realizada',
                text: 'Has concluido el proceso de reinscripción',
                confirmButtonText: 'Aceptar'
            })
            window.location.href = './index.html';
        })
    } catch (error) {
        console.log(error);
    }
}