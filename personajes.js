const API = "https://rickandmortyapi.com/api/character";

let personajes = [];
let paginaActual = 1;
let totalPaginas = 42;

const modalDetalle = new bootstrap.Modal(document.getElementById("modal_detalle"));


const listar = async (pagina = 1) => {
    try {
        ocultarAviso();
        const respuesta = await fetch(`${API}?page=${pagina}`);


        if (!respuesta.ok) {
            avisar("No se pudieron cargar los personajes (Error " + respuesta.status + ").", false);
            document.getElementById("contenedor_personajes").innerHTML = "";
            return;
        }

        const datos = await respuesta.json();
        personajes = datos.results;
        paginaActual = pagina;
        totalPaginas = datos.info.pages;

        mostrar();
        actualizarPaginacion(datos.info);
    } catch (error) {
        avisar("Ocurrió un error de conexión al consultar la API.", false);
        document.getElementById("contenedor_personajes").innerHTML = "";
    }
};


const mostrar = () => {
    let html = "";

    personajes.forEach(personaje => {
        html += `
        <div class="col">
            <div class="card h-100 bg-secondary bg-opacity-25 text-white border-secondary shadow-sm">
                <img src="${texto(personaje.image)}" class="card-img-top" alt="${texto(personaje.name)}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold mb-1">${texto(personaje.name)}</h5>
                    <p class="card-text mb-2">
                        ${puntoEstado(personaje.status)}${texto(personaje.status)} - ${texto(personaje.species)}
                    </p>
                    <small class="text-white-50">Última ubicación:</small>
                    <p class="card-text mb-3">${texto(personaje.location.name)}</p>
                    <button type="button" class="btn btn-primary w-100 mt-auto" onclick="verDetalle(${personaje.id})">
                        Detalle
                    </button>
                </div>
            </div>
        </div>`;
    });

    document.getElementById("contenedor_personajes").innerHTML = html;
};


const actualizarPaginacion = (info) => {
    document.getElementById("texto_pagina").textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById("boton_anterior").disabled = !info.prev;
    document.getElementById("boton_siguiente").disabled = !info.next;
};


const verDetalle = async (id) => {
    document.getElementById("titulo_modal").textContent = "Cargando...";
    document.getElementById("cuerpo_modal").innerHTML = '<p class="text-center my-3">Cargando información...</p>';
    modalDetalle.show();

    try {
        // Primero busca el personaje ya descargado en memoria (instantáneo y sin gastar peticiones)
        let p = personajes.find(item => item.id === id);

        // Si por alguna razón no está en memoria, lo pide a la API
        if (!p) {
            const respuesta = await fetch(`${API}/${id}`);
            if (!respuesta.ok) {
                document.getElementById("cuerpo_modal").innerHTML = '<div class="alert alert-danger mb-0">No se pudo cargar el detalle del personaje.</div>';
                return;
            }
            p = await respuesta.json();
        }

        const tipo = p.type ? p.type : "Sin tipo";

        document.getElementById("titulo_modal").textContent = p.name;
        document.getElementById("cuerpo_modal").innerHTML = `
        <div class="row align-items-center g-3">
            <div class="col-md-5 text-center">
                <img src="${texto(p.image)}" alt="${texto(p.name)}" class="img-fluid rounded">
            </div>
            <div class="col-md-7">
                <table class="table table-dark table-borderless mb-0">
                    <tbody>
                        <tr><th class="text-white-50">ID</th><td>${p.id}</td></tr>
                        <tr><th class="text-white-50">Estado</th><td>${puntoEstado(p.status)}${texto(p.status)}</td></tr>
                        <tr><th class="text-white-50">Especie</th><td>${texto(p.species)}</td></tr>
                        <tr><th class="text-white-50">Género</th><td>${texto(p.gender)}</td></tr>
                        <tr><th class="text-white-50">Tipo</th><td>${texto(tipo)}</td></tr>
                        <tr><th class="text-white-50">Origen</th><td>${texto(p.origin.name)}</td></tr>
                        <tr><th class="text-white-50">Última ubicación</th><td>${texto(p.location.name)}</td></tr>
                        <tr><th class="text-white-50">Episodios</th><td>${p.episode.length}</td></tr>
                        <tr><th class="text-white-50">Creado</th><td>${formatearFecha(p.created)}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;
    } catch (error) {
        document.getElementById("cuerpo_modal").innerHTML = '<div class="alert alert-danger mb-0">Error al mostrar el detalle del personaje.</div>';
    }
};


document.getElementById("boton_anterior").addEventListener("click", () => {
    if (paginaActual > 1) {
        listar(paginaActual - 1);
    }
});

document.getElementById("boton_siguiente").addEventListener("click", () => {
    if (paginaActual < totalPaginas) {
        listar(paginaActual + 1);
    }
});


const puntoEstado = (status) => {
    let color = "bg-secondary";
    if (status === "Alive") color = "bg-success";
    if (status === "Dead") color = "bg-danger";
    return `<span class="d-inline-block rounded-circle ${color} me-2" style="width: 10px; height: 10px;"></span>`;
};

const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getUTCDate()).padStart(2, "0");
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const anio = fecha.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
};

const avisar = (mensaje, correcto) => {
    const caja = document.getElementById("mensaje");
    caja.textContent = mensaje;
    caja.className = "alert " + (correcto ? "alert-success" : "alert-danger");
};

const ocultarAviso = () => {
    document.getElementById("mensaje").className = "alert d-none";
};

const texto = (valor) => {
    const div = document.createElement("div");
    div.textContent = valor ?? "";
    return div.innerHTML;
};

listar();
