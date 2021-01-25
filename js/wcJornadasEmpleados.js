class WCJornadasEmpleados extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.empleados = new Array();
        this.jornadas = new Array();

        let shadowRoot = this.attachShadow({ mode: "open" });

        const template = document.querySelector("#plantilla3");
        const plantilla = template.content.cloneNode(true);
        shadowRoot.appendChild(plantilla);

        let thNombre = shadowRoot.querySelector("#thNombre");
        let thApellidos = shadowRoot.querySelector("#thApellidos");
        //let tbody = shadowRoot.querySelector("#tbody");
        let tabla = shadowRoot.querySelector("#tabla");

        this.ordenarPorApellidos(this.empleados, this.jornadas, this.rellenarTabla, tabla, thApellidos);
        this.ordenarPorNombre(this.empleados, this.jornadas, this.rellenarTabla, tabla, thNombre);
        
        this.cargaEmpleados(this.empleados, this.jornadas, tabla, this.rellenarTabla, this.url, this.url2);

        this.rellenarTabla(this.empleados, this.jornadas, tabla);

    }

    cargaEmpleados(empleados, jornadas, tabla, funcion, url, url2) {
        getData(url).then(function (datos) {
            Array.prototype.forEach.call(datos, dato => {
                empleados.push(dato);

            })
            getData(url2).then(function (datos) {
                Array.prototype.forEach.call(datos, dato => {
                    jornadas.push(dato);
                })
                funcion(empleados, jornadas, tabla);
            });

        });
    }

    ordenarPorApellidos (empleados, jornadas, rellenarTabla, tabla, thApellidos){
        thApellidos.addEventListener("click", function(){
            //console.log("apellidos");
            empleados.sort(dynamicSort("apellidos"));                
            rellenarTabla(empleados, jornadas, tabla);        
        });       
    }

    ordenarPorNombre (empleados, jornadas, rellenarTabla, tabla, thNombre){
        thNombre.addEventListener("click", function(){
            //console.log("nombre");
            empleados.sort(dynamicSort("nombre"));                
            rellenarTabla(empleados, jornadas, tabla);        
        });       
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "url")
            this.url = newValue;
        else
            this.url2 = newValue;

    }

    static get observedAttributes() {
        return ["url", "url2"];
    }

    rellenarTabla(empleados, jornadas, tabla) {
        //empleados.sort(dynamicSort("apellidos"));
        let tbodyAntiguo = tabla.lastChild;
        if (tbodyAntiguo!==null)
            tabla.removeChild(tbodyAntiguo);
        let tbody = document.createElement("tbody");

        empleados.forEach(empleado => {
            if (empleado.fecha_baja != null)
                return;
            let fila = document.createElement("tr");

            let nombre = document.createElement("td");
            let apellidos = document.createElement("td");
            let jornada = document.createElement("td");
            let jornadaSelect = document.createElement("select");

            let option = [];
            option[0] = document.createElement("option");
            option[0].innerHTML = "Seleccione una jornada...";
            jornadaSelect.appendChild(option[0]);
            let i = 1;
            jornadas.forEach(jornada => {
                option[i] = document.createElement("option");
                option[i].innerHTML = jornada.descripcion;
                option[i].value = jornada.id;
                jornadaSelect.appendChild(option[i]);
                if (empleado.jornada == jornada.id)
                    jornadaSelect.selectedIndex = i;
                else if (empleado.jornada == null)
                    jornadaSelect.selectedIndex = "0";
                i++;
            });

            nombre.innerHTML = empleado.nombre;
            apellidos.innerHTML = empleado.apellidos;

            jornada.appendChild(jornadaSelect);

            fila.appendChild(nombre);
            fila.appendChild(apellidos);
            fila.appendChild(jornada);

            tbody.appendChild(fila);
            

            jornadaSelect.addEventListener("change", function () {
                let jornadaSeleccionada = option[jornadaSelect.selectedIndex].text;
                let idJornadaSeleccionada = option[jornadaSelect.selectedIndex].value;
                console.log("Ha seleccionado la jornada \""+jornadaSeleccionada +" "+idJornadaSeleccionada+"\" para " + empleado.apellidos);
            });

        });
        tabla.appendChild(tbody);

    }

}
window.customElements.define("wc-jornadasempleados", WCJornadasEmpleados);


function getData(url) {
    return new Promise(function (resolve, reject) {
        fetch(url).then(function (response) {
            if (response.status == 200)
                resolve(response.json());
            else
                reject(response.status);
        }).catch(function (error) {
            reject(error);
        });
    });
}

function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}