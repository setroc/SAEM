import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc, updateDoc } from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {db} from './firebase.js';


const boleta = localStorage.getItem('boleta') || '';
window.onload = async () => {
  const ref = doc(db, "Usuario", boleta);
  const querySnapshot = await getDoc(ref);
  const data = querySnapshot.data();
  cargarDatos(data);

  const form = document.querySelector('#form');
  form.addEventListener('submit', guardarDatos);
}

const cargarDatos = (data) => {
  document.querySelector('#nombre').value= data.nombre + " " + data.aPaterno + " " + data.aMaterno;
  document.querySelector('#nacimiento').value= data.diaNac+"/"+data.mesNac+"/"+data.anioNac;
  document.querySelector('#nacionalidad').value= data.nacionalidad;
  document.querySelector('#CURP').value= data.curp;
  document.querySelector('#email').value= data.correo;
  document.querySelector('#telefono').value= data.telefono;
  document.querySelector('#calle').value= data.direccion.calle;
  document.querySelector('#num_exteriror').value= data.direccion.numExt;
  document.querySelector('#num_interior').value= data.direccion?.numInt || '';
  document.querySelector('#colonia').value= data.direccion.colonia;
  document.querySelector('#delegacion').value= data.direccion.delegacion;
  document.querySelector('#estado').value= data.direccion.estado;
}
const guardarDatos = async (e) => {
  e.preventDefault();
  let error = false;
  const nombre = document.querySelector('#nombre');
  const nacimiento = document.querySelector('#nacimiento');
  const nacionalidad = document.querySelector('#nacionalidad');
  const curp = document.querySelector('#CURP');
  const email = document.querySelector('#email');
  const telefono = document.querySelector('#telefono');
  const calle = document.querySelector('#calle');
  const num_interior = document.querySelector('#num_interior');
  const num_exteriror = document.querySelector('#num_exteriror');
  const colonia = document.querySelector('#colonia');
  const delegacion = document.querySelector('#delegacion');
  const estado = document.querySelector('#estado');
  if ( nombre.value.trim().length <= 0 ) {
    nombre.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text: 'Debe añadir un valor para el campo nombre',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( nacimiento.value.trim().length <= 0 ) {
    nacimiento.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo nacimiento',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( nacionalidad.value.trim().length <= 0 ) {
    nacionalidad.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo nacionalidad',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( curp.value.trim().length <= 0 ) {
    curp.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo CURP',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( email.value.trim().length <= 0 ) {
    email.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo email',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( telefono.value.trim().length <= 0 ) {
    telefono.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo teléfono',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( calle.value.trim().length <= 0 ) {
    calle.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo calle',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( num_exteriror.value.trim().length <= 0 ) {
    num_exteriror.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo número exterior',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( colonia.value.trim().length <= 0 ) {
    colonia.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo colonia',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( delegacion.value.trim().length <= 0 ) {
    delegacion.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo delegación',
      confirmButtonText: 'Aceptar'
    })
  }
  if ( estado.value.trim().length <= 0 ) {
    estado.classList.add('is-invalid');
    error=true;
    Swal.fire({
      icon: 'error',
      title: 'Faltan campos obligatorios',
      text:'Debe añadir un valor para el campo estado',
      confirmButtonText: 'Aceptar'
    })
  }
  if (!error) { // se pueden actualizar los datos
    try {
      await actualizar(boleta,{
        // nombre,
        // nacimiento,
        // nacionalidad,
        // curp,
        correo: email.value,
        telefono: Number(telefono.value),
        direccion: {
          calle: calle.value,
          numInt: Number(num_interior.value),
          numExt: Number(num_exteriror.value),
          colonia: colonia.value,
          delegacion: delegacion.value,
          estado: estado.value
        }
      });
      Swal.fire({
        icon: 'success',
        title: 'Datos guardados con éxito',
        text: 'Los datos han sido modificados correctamente',
        confirmButtonText: 'Aceptar'
      })
      window.location.href='./visualizarDatos.html'
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Datos no guardados',
        text: 'Revise los datos ingresados e intente de nuevo',
        confirmButtonText: 'Aceptar'
      })
    }
  }
}
const actualizar = async (boleta, datos) => await updateDoc(doc(db,'Usuario',boleta),datos);