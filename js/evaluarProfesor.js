import{datosPeriodo} from './firebase.js';
import { getFirestore, collection, addDoc,query, where, getDocs, getDoc, doc, setDoc, updateDoc} from "http://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"
export const getData = () => getDocs(collection(db,'Evaluaciones',localStorage.getItem("boleta"),'Desempeño'));//Funcion para cargar las materias de la db
export const isFinished = (arrayTermino) =>{setDoc(doc(db,'Evaluaciones',localStorage.getItem("boleta"),'Materias Evaluadas','Completo'),{arrayTermino});}//Funcion para tener las materias evaluadas en la db

const db = getFirestore();
let cont = 0;
let materiasEvaluadas = 0;
let idmateria = "";
let ordenID = new Array();//almacenamos los id de las materias//ELIMINAR ORDEN ID
var arrayId = new Array();
var arrayTermino = new Array();//Almacenamos las materias evaluadas completamente
var finish = 0;//Variable que nos indica si todas las materias estan evaluadas
///////////////////////////NUEVO CODIGO PARA OBTENER LAS MATERIAS INSCRITAS////////////////////
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

                // busco el grupo por el id para obtener la referencia al profesor
                const gpoRef = doc(db,"Grupo",grupo.id);
                const gpoSnap = await getDoc(gpoRef);
                const {profesor} =gpoSnap.data()[materia.id];

                // busco el profesor por su id para obtener su nombre
                const profRef = doc(db,'Usuario',profesor.id);
                const profSnap = await getDoc(profRef);
                const nombreProf = profSnap.data();
                // Añado los datos a la tabla
                addMateria(grupo.id, nombreMt, nombreProf);
            }
        } else {
            const texto = document.createElement('h1');
            texto.innerText = 'Disfruta tus vacaciones';
            texto.classList.add('text-center')
            document.querySelector("#contenedor").appendChild(texto);//CORREGIR
            document.querySelector("#tableP").classList.add('d-none');
        }

    } catch (error) {
        console.log(error)
    }

    //funcion para enlistar los datos que tenemos en la db de las preguntas y obtener el id generado de cada documento, se carga al inicio de la pagina
    var materiaActual;
    //Para la seccion de desempeño, obtenemos los id de los documentos
    const datos = await getData();
    datos.forEach(doc =>{
        console.log("Los documentos en desempeño son:",doc.data());
        materiaActual = doc.data().opciones.Materia;
        if(doc.data().Evaluado == true){
            //Quitamos boton y marcamos como evaluado, tambien actualizamos el estado
            const nodo = document.getElementById(materiaActual);
            const padre = nodo.parentNode;
            padre.removeChild(nodo);
            const nodoN = document.getElementById(`${doc.data().opciones.Materia}1`);
            console.log("EL ESTADO A MODIFICAR ES",nodoN);
            let html = "";
            let html1 = "";
            html = `
            <p id="${idmateria}">NINGUNA</p>
            `
            padre.innerHTML = html;
            html1 += `
            <p>EVALUADO</p>
            `
            nodoN.innerHTML = html1;
            }
        arrayId.push(doc.id);
    });
    console.log(arrayId);
    //Funcion para eliminar el formulario, cargamos el numero de materias evaluadas
    const docRef = doc(db,'Evaluaciones',localStorage.getItem('boleta'),'Materias Evaluadas','Completo');
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        console.log("Hay materias evaluadas",docSnap.data());
        for(var i = 0; i < docSnap.data().arrayTermino.length; i++){
            arrayTermino.push(docSnap.data().arrayTermino[i]);
        }
        console.log("Y son:",arrayTermino);
        if(arrayTermino.length == materiasEvaluadas){
            console.log("Entramos al if");
            for(var i = 0; i<arrayTermino.length; i++){
                if(arrayTermino[i] == false){
                    finish = 1;
                }
            }
            if(finish == 0){
                const quit = document.getElementById('table-f')
                const quitButton = document.getElementById('final-button');
                console.log("TENEMOS TODAS LAS MATERIAS EVALUADAS",quit);
    
                quit.parentNode.removeChild(quit);
                quitButton.parentNode.removeChild(quitButton);
            }
        }
        }else{
            console.log("Aun no hay materias evaluadas");
        }

    });

function addMateria(grupo, materia, profesor) {
    let tabla = document.getElementById('tableP');
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
    //Estado de evaluacion
    td = document.createElement('td');
    td.innerHTML = 'SIN EVALUAR';
    fila.appendChild(td);
    td.setAttribute('id',`${materia}1`);
    //Boton para evaluar
    td = document.createElement('td');
    let btn = document.createElement('button');
    btn.classList.add('btn','btn-primary','btn-lg','btn-sm');
    btn.innerText = 'EVALUAR PROFESOR';
    btn.setAttribute('type','button');
    //td.innerHTML ='<button type="button" class="btn btn-primary btn-lg btn-sm">EVALUARLO</button>';
    btn.setAttribute('id',materia);
    btn.addEventListener('click',() => idmateria = actualizarProfesor(profesor.nombre+' '+profesor.aPaterno+' '+profesor.aMaterno,idmateria,materia));
    td.appendChild(btn);
    fila.appendChild(td);

    cuerpoTabla.appendChild(fila);
    tabla.appendChild(cuerpoTabla);
    materiasEvaluadas +=1;
}
//////////////////////////////////////////////////////////
//Hacemos las cosultas para obtener las preguntas por seccion en la db
//Seccion Conocimientos
let arrayPreguntas = new Array();
const table2 = document.getElementById("tabla-conocimientos");
const seccionPreguntas = doc(db,"Preguntas","Conocimientos");
//const preguntas = query(seccionPreguntas, where("ID","==","Conocimientos"));
//let longitud = 0;
const pregunta = await getDoc(seccionPreguntas);
if (pregunta.exists()){
    console.log("Datos del documento:",pregunta.data());
    //longitud = Object.keys(pregunta.data()).length - 1;//Object keys devuelve las claves del objeto
    arrayPreguntas = Object.values(pregunta.data());//Object value devuelve el valor en cada clave del array 
    var indice = arrayPreguntas.indexOf('Conocimientos');//Obtenemos el indice del id
    arrayPreguntas.splice(indice,1);//eliminamos el id para solo tener las preguntas
}else{
    console.log("No hay nada");
}
let content = '';
for(cont = 0; cont < arrayPreguntas.length; cont++){
    content += `
    <tr class="table-table-light">
        <th scope="row">${cont+1}. ${arrayPreguntas[cont]} </th>

        <fieldset class="form-group">
            <td>
                <div class="form-check">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input2" name="optionsRadios2-${cont+1}" id="optionsRadios1" value="option1">
                            Excelente
                        </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input2" name="optionsRadios2-${cont+1}" id="optionsRadios2" value="option2">
                        Buena
                    </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input2" name="optionsRadios2-${cont+1}" id="optionsRadios3" value="option3">
                        Mediana
                    </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input2" name="optionsRadios2-${cont+1}" id="optionsRadios4" value="option4">
                        Mala
                    </label>
                </div>
            </td>

        </fieldset>
    </tr>
    ` 
};
table2.innerHTML = content;
//Seccion Desempeño
let arrayPreguntas1 = new Array();
const table1 = document.getElementById('tabla-desempeño');
const seccionPreguntas1 = doc(db,"Preguntas","Desempeño");
const pregunta1 = await getDoc(seccionPreguntas1);
if(pregunta1.exists()){
    console.log("Datos del documento Desempeño:",pregunta1.data());
    arrayPreguntas1 = Object.values(pregunta1.data());
    indice = arrayPreguntas1.indexOf('Desempenio');
    arrayPreguntas1.splice(indice,1);//Eliminamos el ID y solamente dejamos las preguntas
}else{
    console.log("No hay nada");
}
content = '';
for(cont = 0; cont < arrayPreguntas1.length; cont++){
    content += `
    <tr class="table-table-light">
        <th scope="row">${cont+1}. ${arrayPreguntas1[cont]} </th>

        <fieldset class="form-group">
            <td>
                <div class="form-check">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input1" name="optionsRadios1-${cont+1}" id="optionsRadios1" value="option1">
                            Excelente
                        </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input1" name="optionsRadios1-${cont+1}" id="optionsRadios2" value="option2">
                        Buena
                    </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input1" name="optionsRadios1-${cont+1}" id="optionsRadios3" value="option3">
                        Mediana
                    </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input1" name="optionsRadios1-${cont+1}" id="optionsRadios4" value="option4">
                        Mala
                    </label>
                </div>
            </td>

        </fieldset>
    </tr>
    `
}
table1.innerHTML = content;
//Seccion Material Didactico
let arrayPreguntas3 = new Array();
const table3 = document.getElementById('tabla-material');
const seccionPreguntas3 = doc(db,"Preguntas","MaterialDidactico");
const pregunta3 = await getDoc(seccionPreguntas3);
if(pregunta3.exists()){
    console.log("Datos del documento material:",pregunta3.data());
    arrayPreguntas3 = Object.values(pregunta3.data());
    indice = arrayPreguntas3.indexOf('Material');
    arrayPreguntas3.splice(indice,1);
}else{
    console.log("No hay nada");
}
content = '';
for(cont = 0; cont < arrayPreguntas3.length; cont++){
    content += `
    <tr class="table-table-light">
        <th scope="row">${cont+1}. ${arrayPreguntas3[cont]} </th>

        <fieldset class="form-group">
            <td>
                <div class="form-check">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input3" name="optionsRadios3-${cont+1}" id="optionsRadios1" value="option1">
                            Excelente
                        </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input3" name="optionsRadios3-${cont+1}" id="optionsRadios2" value="option2">
                        Buena
                    </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input3" name="optionsRadios3-${cont+1}" id="optionsRadios3" value="option3">
                        Mediana
                    </label>
                </div>
            </td>

            <td>
                <div class="form-check">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input3" name="optionsRadios3-${cont+1}" id="optionsRadios4" value="option4">
                        Mala
                    </label>
                </div>
            </td>

        </fieldset>
    </tr>
    `
}
table3.innerHTML = content;
//Codigo para obtener el id de materia que se esta evaluando
var i = 0;
//var idmateria = "";
var test = document.getElementsByClassName('btn btn-primary btn-lg btn-sm');//Obtenemos los elementos cuya clase sean los mismos para recuperar el id de materias
console.log(test.length);
for(i = 0; i< test.length; i++){
    test[i].addEventListener("click", function(){
        idmateria = this.id;
        console.log(idmateria);
    })
}
console.log(test);
//Funcionalidad de los botones para la evaluación
//funcion para guardar los radiobuttons de la seccion desempeño
const saveOptions = (opciones) => {
     //setDoc(doc(db,"Evaluaciones",localStorage.getItem("boleta"),'Desempeño','b3JStNugQJQCsmxSozgV'), opciones);
     console.log(opciones);
     setDoc(doc(db,'Evaluaciones',localStorage.getItem("boleta"),'Desempeño',idmateria), {opciones});
}
//funcion para guardar las opciones de la seccion conocimientos
const saveOptions2 = (opciones) => {
    setDoc(doc(db,'Evaluaciones',localStorage.getItem("boleta"),'Conocimientos',idmateria),{opciones});
} 
//funcion para guardar las opciones de la seccion material didactico
const saveOptions3 = (opciones) =>{
    setDoc(doc(db,'Evaluaciones',localStorage.getItem("boleta"),'Material',idmateria),{opciones});
}
//funcion para guardar los comentarios de un profesor
const saveComents =(coments) =>{
    setDoc(doc(db,'Evaluaciones',localStorage.getItem("boleta"),'Comentarios',idmateria),{coments});
}
//Para el de desempeño
let opcionesSelect = new Array();
let noPregunta = new Array();
let bandera1 =false;
const formulario1 = document.getElementById('formulario1');
formulario1.addEventListener('submit', (e) =>{
    bandera1 = false;
    opcionesSelect = [];//limpiamos el arreglo
    noPregunta = [];//limpiamos el arreglo
    cont = 0;//reseteamos el contador
    //Codigo para obtener la respuesta y el # de pregunta asociada a la respuesta
    const respuestas = document.getElementsByClassName('form-check-input1');
    cont = 0;
    for(var i = 0; i<arrayPreguntas1.length * 4; i++){
        if(respuestas[i].checked == true){
            opcionesSelect.push(respuestas[i].value);
            noPregunta.push(cont+1);
            cont+=1;
            if(i % 4 == 0){//La respuesta es primera opcion
                i += 3;
            }else if (i % 4 == 1){//La respuesta es segunda opcion
                i += 2; 
            }else if(i % 4 == 2){//La respuesta es tercera opcion
                i += 1;
            }
        }else if(i % 4 == 3){//No se contesto la pregunta
            bandera1 = true;//si la bandera termina en true entonces no se respondieron todas las preguntas
            cont+=1;
        }
    }
    e.preventDefault();
    const opcion = opcionesSelect;
    //Creamos el objeto con las opciones
    const docData = {
        ID: "Desempeño",
        Materia: idmateria,
        Opciones: opcionesSelect,
        Pregunta: noPregunta,
        Bandera: bandera1,
        Evaluado: false
    }
    console.log(opcion);
    console.log(localStorage.getItem('boleta'));
    console.log("Idmateria vale",idmateria);
    if(idmateria == ""){
        Swal.fire({
            icon: 'error',
            title: 'Profesor no seleccionado',
            text: 'Por favor, seleccione un profesor a evaluar',
            confirmButtonText: 'Aceptar'
        })
    }else{
        saveOptions(docData);
        console.log('submitted form1');//Probamos el boton del formulario
        Swal.fire({
            icon: 'success',
            title: 'Sección terminada',
            text: 'Se han guardado las respuestas',
            confirmButtonText: 'Aceptar'
        })
    }
});
//SECCION CONOCIMIENTOS
let bandera2 = false;
const formulario2 = document.getElementById('formulario2');
formulario2.addEventListener('submit', (e) =>{
    bandera2 = false;
    opcionesSelect = [];//limpiamos el arreglo
    noPregunta = [];//limpiamos el arreglo
    cont = 0;//reseteamos el contador
    //Codigo para obtener la respuesta y el # de pregunta asociada a la respuesta
    const respuestas2 = document.getElementsByClassName('form-check-input2');
    e.preventDefault();
    for(var i = 0; i<arrayPreguntas.length * 4; i++){
        if(respuestas2[i].checked == true){
            opcionesSelect.push(respuestas2[i].value);//almacenamos el valor de la respuesta
            noPregunta.push(cont+1);
            cont +=1;
            if( i % 4 == 0){
                i += 3;
            }else if(i % 4 == 1){
                i += 2;
            }else if(i % 4 == 2){
                i += 1;
            }
        }else if(i % 4 == 3){
            bandera2 = true;//alzamos bandera
            cont +=1;//actualizamos pregunta
        }
    } 
    const opcion2 = opcionesSelect;
    //Creamos el objeto 
    const docData2 ={
        ID: "Conocimientos",
        Materia: idmateria,
        Opciones: opcionesSelect,
        Pregunta: noPregunta,
        Bandera: bandera2,
        Evaluado: false
    }
    if(idmateria == ""){
        Swal.fire({
            icon: 'error',
            title: 'Profesor no seleccionado',
            text: 'Por favor, seleccione un profesor a evaluar',
            confirmButtonText: 'Aceptar'
        })
    }else{
        saveOptions2(docData2);
        console.log('submitted form2');
        Swal.fire({
            icon: 'success',
            title: 'Sección terminada',
            text: 'Se han guardado las respuestas',
            confirmButtonText: 'Aceptar'
        })
    }
});
//SECCION MATERIAL DIDACTICO
let bandera3 = false;
const formulario3 = document.getElementById('formulario3');
formulario3.addEventListener('submit',(e) =>{
    bandera3 = false;
    opcionesSelect = [];//limpiamos el arreglo
    noPregunta = [];//limpiamos el arreglo
    cont = 0;//reseteamos el contador
    //Codigo para obtener la respuesta y el # de pregunta asociada a la respuesta
    const respuestas3 = document.getElementsByClassName('form-check-input3');
    e.preventDefault();
    for(var i = 0; i<arrayPreguntas3.length * 4; i++){
        if(respuestas3[i].checked == true){
            opcionesSelect.push(respuestas3[i].value);//almacenamos el valor de la respuesta
            noPregunta.push(cont+1);
            cont +=1;
            if( i % 4 == 0){
                i += 3;
            }else if(i % 4 == 1){
                i += 2;
            }else if(i % 4 == 2){
                i += 1;
            }
        }else if(i % 4 == 3){
            bandera3 = true;//alzamos bandera
            cont +=1;//actualizamos pregunta
        }
    } 
    const docData3 = {
        ID: "Material",
        Materia: idmateria,
        Opciones: opcionesSelect,
        Pregunta: noPregunta,
        Bandera: bandera3,
        Evaluado: false
    }
    if(idmateria == ""){
        Swal.fire({
            icon: 'error',
            title: 'Profesor no seleccionado',
            text: 'Por favor, seleccione un profesor a evaluar',
            confirmButtonText: 'Aceptar'
        })
    }else{
        saveOptions3(docData3);
        console.log('submitted form3')
        Swal.fire({
            icon: 'success',
            title: 'Sección terminada',
            text: 'Se han guardado las respuestas',
            confirmButtonText: 'Aceptar'
        })
    }

});
//SECCION COMENTARIOS
const formulario4 = document.getElementById('formulario4');
let comentarios = new Array();
formulario4.addEventListener('submit',(e) =>{
    comentarios = [];//limpiamos el arreglo de comentarios
    e.preventDefault();
    const comentario = document.getElementById('comentario');
    comentarios = comentario.value;
    const docData4 = {
        ID: 'Comentarios',
        Materia: idmateria,
        Comentarios: comentarios
    }
    if(idmateria == ""){
        Swal.fire({
            icon: 'error',
            title: 'Profesor no seleccionado',
            text: 'Por favor, seleccione un profesor a evaluar',
            confirmButtonText: 'Aceptar'
        })
    }else{
        saveComents(docData4);
        console.log('submitted form4')
        Swal.fire({
            icon: 'success',
            title: 'Sección terminada',
            text: 'Se han guardado las respuestas',
            confirmButtonText: 'Aceptar'
        })
    }
});
//BOTON FINALIZAR EVALUACION, CHECAR ESTA SECCION
//Funcion para validar los campos de desempeño
var objetoMateria = new Array();
export const validar = async () =>{
    objetoMateria = [];//limpiamos arreglo
    //Funcion para obtener la bandera de Desempeño
    const q = query(collection(db,"Evaluaciones",localStorage.getItem("boleta"),'Desempeño'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const variable = doc.data();
        //objeto = Object.keys(doc.data());
        if(variable.opciones.Materia == idmateria){
            console.log(variable);
            objetoMateria.push(variable.opciones.Bandera);
            console.log(objetoMateria);

        }else{
            console.log("No hay materias que evaluar");
        }
    });
    //Funcion para obtener la bandera de Conocimientos
    const q1 = query(collection(db,"Evaluaciones",localStorage.getItem("boleta"),'Conocimientos'));
    const querySnapshot1 = await getDocs(q1);
    querySnapshot1.forEach((doc) =>{
        const variable1 = doc.data();
        if(variable1.opciones.Materia == idmateria){
            objetoMateria.push(variable1.opciones.Bandera);
            console.log(objetoMateria);
        }else{
            console.log("No hay materias que evaluar");
        }
    });
    //Funcion para obtener la bandera de Material Didactico
    const q2 = query(collection(db,"Evaluaciones",localStorage.getItem("boleta"),'Material'));
    const querySnapshot2 = await getDocs(q2);
    querySnapshot2.forEach((doc) =>{
        const variable2 = doc.data();
        if(variable2.opciones.Materia == idmateria){
            objetoMateria.push(variable2.opciones.Bandera);
            console.log(objetoMateria);
        }else{
            console.log("No hay materias que evaluar");
        }
    });
}
//funcion de continuar
export const getDatap = () => getDocs(collection(db,'Evaluaciones',localStorage.getItem("boleta"),'Desempeño'));
async function continuar(){
    await validar();
    for(const propiedad in objetoMateria){
        console.log(`${propiedad}: ${objetoMateria[propiedad]}`);
    }
    //Verificamos que todas las secciones hayan sido contestadas
    console.log("LAS BANDERAS SON:",objetoMateria);
    if(objetoMateria[0] == false && objetoMateria[1] == false && objetoMateria[2] == false){
        var respuesta = confirm("¿Esta seguro que desea enviar las respuestas? Posteriormente no se permiten cambios");
        if(respuesta == true){
            const IDMateria =  await getDatap();
            IDMateria.forEach(doc =>{
            if(doc.data().opciones.Materia == idmateria){
                console.log(doc.data());
                ordenID.push(doc.data().opciones.Materia);
                ordenID.push(doc.id);
                console.log("EL ORDEN DE LAS MATERIAS ES:",ordenID);
            }
        });
        //Aqui continuamos con la actualizacion de los campos
        actualizar();
    }

    }else{
        ////NO VALIDAMOS
        Swal.fire({
            icon: 'error',
            title: 'Faltan secciones por contestar',
            text: 'Por favor, conteste y guarde todas las respuestas de las secciones del formulario',
            confirmButtonText: 'Aceptar'
        })
        console.log("Faltan secciones por contestar");
    }

}
//FUNCION PARA MANDAR LA EVALUACION A LA DB
const finalButton = document.getElementById('final-button');
finalButton.addEventListener('click',(e) => {
    
    e.preventDefault();
    continuar();
});
//Funcion para actualizar boton a modificar
//funcion para actualizar datos

export const updateDat = (id, newFields) => updateDoc(doc(db,'Evaluaciones',localStorage.getItem("boleta"),'Desempeño',idmateria), newFields);

//aqui va el codigo
//Funcion para actualizar el estado y los botones
 function actualizar(){
    if(idmateria == ordenID[0] )
    console.log("LOS ARRAYS SON:",arrayId);
    updateDat(idmateria,{
        Evaluado: true,
    });
    arrayTermino.push(idmateria);
    isFinished(arrayTermino);
    const nodo = document.getElementById(idmateria);
    const padre = nodo.parentNode;
    nodo.parentNode.removeChild(nodo)
    const nodoN1 = document.getElementById(`${idmateria}1`);
    let html = "";
    let html1 = "";
     html = `
     <p id="${idmateria}">NINGUNA</p>
    `
    padre.innerHTML = html;
    html1 += `
         <p>EVALUADO</p>
         `
         nodoN1.innerHTML = html1;
        
    //FUNCION PARA QUITAR EL FORMULARIO, cargamos el # de materias evaluadas en la db
    if(arrayTermino.length == materiasEvaluadas){
        console.log("Entramos al if");
        for(var i = 0; i<arrayTermino.length; i++){
            if(arrayTermino[i] == false){
                finish = 1;
            }
        }
        if(finish == 0){
            const quit = document.getElementById('table-f')
            const quitButton = document.getElementById('final-button');
            console.log("TENEMOS TODAS LAS MATERIAS EVALUADAS",quit);

            quit.parentNode.removeChild(quit);
            quitButton.parentNode.removeChild(quitButton);
        }
    }
    idmateria = "";//Limpiamos el idmateria para evitar que se vuelvan a enviar respuestas
}