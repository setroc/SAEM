import {db, materiasReprobadas, datosPeriodo } from './firebase.js';
import {getFirestore, collection, addDoc, query, where, getDocs, getDoc, doc, updateDoc} from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

let etsInscritos = [];
window.onload = async () => {
  try {
    const materiasRp = await materiasReprobadas();

    // const mtInfo = await getMateriasPorId(materiasRp);
    const mtHorarios = await getHorariosMateriasReprobadas(materiasRp);
    await agregarMateriasReprobadas(mtHorarios);
  } catch (error) {
    console.log(error);
  }
}
const agregarMateriasReprobadas = async (materias = []) => {
  const tabla = document.querySelector('#materiasReprobadas>tbody');
  for (let mt of materias) {
    const {nombre, id, fecha, turno, salon } = mt;
    const tr = document.createElement('tr');
    
    let td = document.createElement('td');
    td.innerText = nombre;
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = id;
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = getFecha(fecha.toDate());
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = turno;
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = salon;
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.classList.add('d-flex','justify-content-center');
    let btn = document.createElement('button');
    btn.classList.add('btn','btn-primary','btn-sm','d-flex');
    btn.innerText="Inscribir";
    btn.setAttribute('data-id',id);
    btn.addEventListener('click',()=>inscribirETS(mt));
    td.appendChild(btn);
    tr.appendChild(td);


    tabla.appendChild(tr);

  }
}
const inscribirETS = async (materia) => {
  const tabla = document.querySelector('#materiasReprobadasInscritas>tbody');
  const {nombre, id, fecha, turno, salon } = materia;
  if (!document.querySelector(`#${id}` )) {
    const tr = document.createElement('tr');
    tr.setAttribute('id',id);
    
    let td = document.createElement('td');
    td.innerText = nombre;
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = id;
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = getFecha(fecha.toDate());
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = turno;
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.innerText = salon;
    tr.appendChild(td);
    
    td = document.createElement('td');
    td.classList.add('d-flex','justify-content-center');
    let btn = document.createElement('button');
    btn.classList.add('btn','btn-danger','btn-sm','d-flex');
    btn.innerText="Eliminar";
    btn.setAttribute('data-id',id);
    btn.addEventListener('click',()=>eliminarETS(id));
    td.appendChild(btn);
    tr.appendChild(td);
  
  
    tabla.appendChild(tr);
    etsInscritos.push(id);

  } else {
    Swal.fire({
      icon: 'error',
      title: 'ETS ya inscrito',
      text: 'El ETS que esta intentando inscribir ya está inscrito',
      confirmButtonText: 'Aceptar'
    })
  }
}

const eliminarETS = (id) => {
  const tabla = document.querySelector('#materiasReprobadasInscritas>tbody');
  const fila = document.querySelector(`#${id}`);
  if ( fila ) {
      // Elimino la fila de la materia del DOM
      tabla.removeChild(fila);
      // Elimino la materia del array de materias inscritas
      etsInscritos = etsInscritos.filter((elemento)=>elemento!==id);
  }
}
const getHorariosMateriasReprobadas = async (materias=[])=>{
  try {
    const materiasHorarios = [];
    const etsRef = collection(db, 'ETS');
    for (let mt of materias) {
      const mtRef = doc(db,'Materia',mt);
      const q = query(etsRef, where('materia','==',mtRef));
      const querySnapshot = await getDocs(q);
      const mtSnap = await getDoc(mtRef);
      const {nombre} = mtSnap.data();

      querySnapshot.forEach((documento)=>{
        materiasHorarios.push({nombre, id: mtSnap.id, ...documento.data()})
      })
    }
    return materiasHorarios;
  } catch (error) {
    console.log(error);
  }
}


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

const btnFinalizarInscripcion = document.querySelector('#finalizar');
btnFinalizarInscripcion.addEventListener('click',()=>finalizarInscripcion());

const finalizarInscripcion = async () => {
  try {
    const {periodo} = await datosPeriodo();
    // Referencia a la coleccion Inscripcion
    const inscripcionRef = collection(db,"InscripcionEts");
    // Referencia al alumno
    const alumnoRef = doc(db,"Usuario",localStorage.getItem('boleta'));
    // Query donde me traera la inscricion de un alumno por su boleta y el periodo
    const q = query(inscripcionRef, where("periodo","==",periodo), where("alumno","==",alumnoRef));
    // Ejecucion de la query
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async(documento)=>{
        const materias = etsInscritos.map(id=>{
            // referenica de la materia
            const mtRef =  doc(db,"Materia",id);
            return {
              materia: mtRef,
              calificacion: -10
            }
        });
        await updateDoc(doc(db,'InscripcionEts',documento.id),{materias});
      await Swal.fire({
        icon: 'success',
        title: 'Inscripción de ETS finalizada',
        text: 'Has concluido el proceso de inscripción de ETS',
        confirmButtonText: 'Aceptar'
      })
        window.location.href = './index.html';
    })
  } catch (error) {
      console.log(error);
  }
}