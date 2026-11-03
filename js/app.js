// ==========================================================
// app.js - Tienda de ordenadores (Practica 4)
// Misma logica del carrito de la practica anterior (localStorage)
// y ahora con componentes de Bootstrap: modal, toast y validacion.
// ==========================================================

// ---------- AVISOS CON BOOTSTRAP (modal y toast) ----------

// Modal que informa al usuario de una compra, registro, login...
function mostrarAviso(titulo, texto, icono, textoBoton, enlaceBoton) {
    let modalEl = document.getElementById("modal-aviso");

    // Se crea una sola vez y se reutiliza en todas las paginas
    if (!modalEl) {
        modalEl = document.createElement("div");
        modalEl.id = "modal-aviso";
        modalEl.className = "modal fade modal-aviso";
        modalEl.tabIndex = -1;
        modalEl.setAttribute("aria-labelledby", "modal-aviso-titulo");
        modalEl.setAttribute("aria-hidden", "true");
        modalEl.innerHTML =
            '<div class="modal-dialog modal-dialog-centered">' +
            '  <div class="modal-content text-center p-3">' +
            '    <div class="modal-header border-0 pb-0">' +
            '      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>' +
            '    </div>' +
            '    <div class="modal-body pt-0">' +
            '      <span class="icono-aviso mb-3"><i class="bi" aria-hidden="true"></i></span>' +
            '      <h2 class="h4" id="modal-aviso-titulo"></h2>' +
            '      <p class="text-secondary mb-0" id="modal-aviso-texto"></p>' +
            '    </div>' +
            '    <div class="modal-footer border-0 justify-content-center">' +
            '      <a class="btn btn-primary px-4" id="modal-aviso-boton" href="#" data-bs-dismiss="modal">Aceptar</a>' +
            '    </div>' +
            '  </div>' +
            '</div>';
        document.body.appendChild(modalEl);
    }

    modalEl.querySelector("#modal-aviso-titulo").textContent = titulo;
    modalEl.querySelector("#modal-aviso-texto").textContent = texto;
    modalEl.querySelector(".icono-aviso .bi").className = "bi " + (icono || "bi-check-lg");

    const boton = modalEl.querySelector("#modal-aviso-boton");
    boton.textContent = textoBoton || "Aceptar";
    if (enlaceBoton) {
        boton.href = enlaceBoton;
        boton.removeAttribute("data-bs-dismiss");
    } else {
        boton.href = "#";
        boton.setAttribute("data-bs-dismiss", "modal");
    }

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// Toast pequeno abajo a la derecha (al anadir al carrito)
function mostrarToast(texto) {
    let zona = document.getElementById("zona-toasts");
    if (!zona) {
        zona = document.createElement("div");
        zona.id = "zona-toasts";
        zona.className = "toast-container position-fixed bottom-0 end-0 p-3";
        document.body.appendChild(zona);
    }

    const toastEl = document.createElement("div");
    toastEl.className = "toast align-items-center text-bg-dark border-0";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.innerHTML =
        '<div class="d-flex">' +
        '  <div class="toast-body"><i class="bi bi-cart-check me-2 text-primary"></i><span></span>' +
        '    <a href="carrito.html" class="ms-2 link-light">Ver carrito</a></div>' +
        '  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>' +
        '</div>';
    toastEl.querySelector("span").textContent = texto;
    zona.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    toast.show();
}

// ---------- CARRITO (localStorage) ----------

function leerCarrito() {
    const datos = localStorage.getItem("carrito");
    return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

function anadirAlCarrito(nombre, precio, cantidad) {
    cantidad = cantidad || 1;
    const carrito = leerCarrito();
    const existe = carrito.find(p => p.nombre === nombre);
    if (existe) {
        existe.cantidad += cantidad;
    } else {
        carrito.push({ nombre: nombre, precio: precio, cantidad: cantidad });
    }
    guardarCarrito(carrito);
    mostrarToast(nombre + " anadido al carrito");
}

function cambiarCantidad(nombre, cambio) {
    const carrito = leerCarrito();
    const producto = carrito.find(p => p.nombre === nombre);
    if (!producto) return;
    producto.cantidad += cambio;
    guardarCarrito(carrito.filter(p => p.cantidad > 0));
    pintarCarrito();
}

function quitarDelCarrito(nombre) {
    guardarCarrito(leerCarrito().filter(p => p.nombre !== nombre));
    pintarCarrito();
}

function vaciarCarrito() {
    localStorage.removeItem("carrito");
    actualizarContador();
    pintarCarrito();
}

function totalCarrito() {
    return leerCarrito().reduce((suma, p) => suma + p.precio * p.cantidad, 0);
}

function actualizarContador() {
    const total = leerCarrito().reduce((suma, p) => suma + p.cantidad, 0);
    document.querySelectorAll(".contador-carrito").forEach(span => {
        span.textContent = total;
    });
}

// ---------- PAGINA DEL CARRITO ----------

function pintarCarrito() {
    const cuerpo = document.getElementById("lista-carrito");
    if (!cuerpo) return;

    const carrito = leerCarrito();
    const tabla = document.getElementById("tabla-carrito");
    const vacio = document.getElementById("carrito-vacio");
    const resumen = document.getElementById("resumen-carrito");

    cuerpo.innerHTML = "";
    const hayProductos = carrito.length > 0;
    tabla.classList.toggle("d-none", !hayProductos);
    resumen.classList.toggle("d-none", !hayProductos);
    vacio.classList.toggle("d-none", hayProductos);

    carrito.forEach(p => {
        const fila = document.createElement("tr");
        fila.innerHTML =
            '<td class="fw-semibold"></td>' +
            '<td>' + p.precio.toFixed(2) + ' EUR</td>' +
            '<td>' +
            '  <div class="btn-group btn-group-sm" role="group" aria-label="Cantidad">' +
            '    <button class="btn btn-outline-secondary btn-menos" aria-label="Quitar uno">-</button>' +
            '    <span class="btn btn-light disabled text-dark">' + p.cantidad + '</span>' +
            '    <button class="btn btn-outline-secondary btn-mas" aria-label="Anadir uno">+</button>' +
            '  </div>' +
            '</td>' +
            '<td class="fw-bold">' + (p.precio * p.cantidad).toFixed(2) + ' EUR</td>' +
            '<td class="text-end"><button class="btn btn-sm btn-outline-danger btn-quitar" aria-label="Quitar producto"><i class="bi bi-trash"></i></button></td>';
        fila.querySelector("td").textContent = p.nombre;
        fila.querySelector(".btn-menos").addEventListener("click", () => cambiarCantidad(p.nombre, -1));
        fila.querySelector(".btn-mas").addEventListener("click", () => cambiarCantidad(p.nombre, 1));
        fila.querySelector(".btn-quitar").addEventListener("click", () => quitarDelCarrito(p.nombre));
        cuerpo.appendChild(fila);
    });

    const total = totalCarrito();
    document.getElementById("subtotal-carrito").textContent = total.toFixed(2) + " EUR";
    document.getElementById("total-carrito").textContent = total.toFixed(2) + " EUR";
}

// ---------- PAGINA DE PAGO ----------

function pintarResumenPago() {
    const lista = document.getElementById("resumen-pago-lista");
    if (!lista) return;

    const carrito = leerCarrito();
    lista.innerHTML = "";
    document.getElementById("resumen-pago-cantidad").textContent =
        carrito.reduce((s, p) => s + p.cantidad, 0);

    if (carrito.length === 0) {
        lista.innerHTML = '<li class="list-group-item text-secondary">No hay productos. <a href="catalogo.html">Ir al catalogo</a></li>';
    }

    carrito.forEach(p => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between lh-sm";
        li.innerHTML =
            '<div><h3 class="h6 my-0"></h3><small class="text-body-secondary">Cantidad: ' + p.cantidad + '</small></div>' +
            '<span class="text-body-secondary">' + (p.precio * p.cantidad).toFixed(2) + ' EUR</span>';
        li.querySelector("h3").textContent = p.nombre;
        lista.appendChild(li);
    });

    // El envio es gratis, el total es el del carrito
    const total = totalCarrito();
    document.getElementById("resumen-pago-total").textContent = total.toFixed(2) + " EUR";
}

// ---------- USUARIO (registro e inicio de sesion) ----------

function leerUsuarios() {
    const datos = localStorage.getItem("usuarios");
    return datos ? JSON.parse(datos) : [];
}

function usuarioActual() {
    return localStorage.getItem("usuario");
}

function cerrarSesion() {
    localStorage.removeItem("usuario");
    pintarZonaUsuario();
    mostrarAviso("Sesion cerrada", "Has cerrado sesion correctamente. Vuelve pronto.", "bi-box-arrow-right");
}

// Botones de Entrar/Registro o el nombre del usuario en el menu
function pintarZonaUsuario() {
    const zona = document.getElementById("zona-usuario");
    if (!zona) return;
    const nombre = usuarioActual();

    if (nombre) {
        zona.innerHTML =
            '<div class="dropdown">' +
            '  <button class="btn btn-outline-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
            '    <i class="bi bi-person-circle me-1"></i><span></span></button>' +
            '  <ul class="dropdown-menu dropdown-menu-end">' +
            '    <li><a class="dropdown-item" href="carrito.html"><i class="bi bi-bag me-2"></i>Mis compras</a></li>' +
            '    <li><hr class="dropdown-divider"></li>' +
            '    <li><button class="dropdown-item text-danger" id="btn-cerrar-sesion"><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesion</button></li>' +
            '  </ul>' +
            '</div>';
        zona.querySelector("span").textContent = nombre;
        zona.querySelector("#btn-cerrar-sesion").addEventListener("click", cerrarSesion);
    } else {
        zona.innerHTML =
            '<a href="login.html" class="btn btn-outline-dark btn-sm">Entrar</a>' +
            '<a href="registro.html" class="btn btn-primary btn-sm">Registrarse</a>';
    }
}

// ---------- FORMULARIOS CON VALIDACION DE BOOTSTRAP ----------

function prepararFormularios() {
    document.querySelectorAll("form.needs-validation").forEach(form => {
        form.addEventListener("submit", evento => {
            evento.preventDefault();

            // Comprobacion extra: las dos contrasenas iguales
            const clave2 = form.querySelector("#clave2");
            if (clave2) {
                const iguales = clave2.value === form.querySelector("#clave").value;
                clave2.setCustomValidity(iguales ? "" : "Las contrasenas no coinciden");
            }

            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                return;
            }

            enviarFormulario(form);
            form.classList.remove("was-validated");
            form.reset();
        });
    });
}

function enviarFormulario(form) {
    const accion = form.dataset.accion;

    if (accion === "registro") {
        const nombre = form.querySelector("#nombre").value.trim();
        const email = form.querySelector("#email").value.trim().toLowerCase();
        const usuarios = leerUsuarios();
        if (usuarios.some(u => u.email === email)) {
            mostrarAviso("Correo ya registrado", "Ya existe una cuenta con ese correo. Inicia sesion.", "bi-exclamation-lg", "Ir a iniciar sesion", "login.html");
            return;
        }
        // Practica sin servidor: solo se guarda nombre y correo, nunca la contrasena
        usuarios.push({ nombre: nombre, email: email });
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        localStorage.setItem("usuario", nombre);
        pintarZonaUsuario();
        mostrarAviso("Registro completado", "Bienvenido/a " + nombre + ". Tu cuenta se ha creado y ya puedes comprar.", "bi-person-check", "Ir a la tienda", "catalogo.html");
    }

    if (accion === "login") {
        const email = form.querySelector("#email").value.trim().toLowerCase();
        const usuario = leerUsuarios().find(u => u.email === email);
        const nombre = usuario ? usuario.nombre : email.split("@")[0];
        localStorage.setItem("usuario", nombre);
        pintarZonaUsuario();
        mostrarAviso("Sesion iniciada", "Hola de nuevo, " + nombre + ". Has iniciado sesion correctamente.", "bi-unlock", "Ir al inicio", "index.html");
    }

    if (accion === "contacto") {
        mostrarAviso("Mensaje enviado", "Gracias por escribirnos. Te responderemos en menos de 24 horas.", "bi-envelope-check");
    }

    if (accion === "boletin") {
        mostrarAviso("Suscripcion confirmada", "Te avisaremos de las novedades y promociones de la tienda.", "bi-bell");
    }

    if (accion === "reserva") {
        mostrarAviso("Reserva confirmada", "Te avisaremos por correo el dia del lanzamiento para completar la compra.", "bi-calendar-check");
    }

    if (accion === "pago") {
        if (leerCarrito().length === 0) {
            mostrarAviso("Carrito vacio", "Anade algun producto antes de pagar.", "bi-cart-x", "Ir al catalogo", "catalogo.html");
            return;
        }
        const total = totalCarrito().toFixed(2);
        const pedido = "PC-" + Date.now().toString().slice(-6);
        vaciarCarrito();
        pintarResumenPago();
        mostrarAviso("Compra realizada", "Pedido " + pedido + " por " + total + " EUR. Recibiras un correo con los detalles del envio.", "bi-bag-check", "Volver a la tienda", "index.html");
    }
}

// ---------- CATALOGO: buscador y filtro por categoria ----------

function filtrarProductos() {
    const buscador = document.getElementById("buscador");
    if (!buscador) return;
    const texto = buscador.value.toLowerCase();
    const activo = document.querySelector(".filtro-categoria.active");
    const categoria = activo ? activo.dataset.categoria : "todas";
    let visibles = 0;

    document.querySelectorAll(".columna-producto").forEach(col => {
        const nombre = col.querySelector(".card-title").textContent.toLowerCase();
        const okTexto = nombre.includes(texto);
        const okCategoria = categoria === "todas" || col.dataset.categoria === categoria;
        const mostrar = okTexto && okCategoria;
        col.classList.toggle("d-none", !mostrar);
        if (mostrar) visibles++;
    });

    const sinResultados = document.getElementById("sin-resultados");
    if (sinResultados) sinResultados.classList.toggle("d-none", visibles > 0);
}

function prepararFiltros() {
    document.querySelectorAll(".filtro-categoria").forEach(boton => {
        boton.addEventListener("click", () => {
            document.querySelectorAll(".filtro-categoria").forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
            boton.classList.add("active");
            boton.setAttribute("aria-pressed", "true");
            filtrarProductos();
        });
    });
}

// ---------- DETALLE: galeria y selector de cantidad ----------

function prepararDetalle() {
    const principal = document.getElementById("imagen-principal");
    document.querySelectorAll(".galeria-miniaturas img").forEach(mini => {
        mini.addEventListener("click", () => {
            principal.src = mini.src;
            principal.alt = mini.alt;
            document.querySelectorAll(".galeria-miniaturas img").forEach(m => m.classList.remove("activa"));
            mini.classList.add("activa");
        });
    });

    const cantidad = document.getElementById("cantidad");
    if (!cantidad) return;
    document.getElementById("btn-menos").addEventListener("click", () => {
        cantidad.value = Math.max(1, Number(cantidad.value) - 1);
    });
    document.getElementById("btn-mas").addEventListener("click", () => {
        cantidad.value = Math.min(10, Number(cantidad.value) + 1);
    });
}

// Boton "Anadir al carrito" del detalle, usa la cantidad elegida
function anadirDesdeDetalle(nombre, precio) {
    const cantidad = Number(document.getElementById("cantidad").value) || 1;
    anadirAlCarrito(nombre, precio, cantidad);
}

// ---------- NOVEDADES: cuenta atras del lanzamiento ----------

function prepararCuentaAtras() {
    const caja = document.querySelector(".cuenta-atras");
    if (!caja) return;
    const fin = new Date(caja.dataset.fecha).getTime();

    function pintar() {
        const resto = Math.max(0, fin - Date.now());
        const dias = Math.floor(resto / 86400000);
        const horas = Math.floor(resto / 3600000) % 24;
        const minutos = Math.floor(resto / 60000) % 60;
        const segundos = Math.floor(resto / 1000) % 60;
        caja.querySelector(".dias").textContent = dias;
        caja.querySelector(".horas").textContent = String(horas).padStart(2, "0");
        caja.querySelector(".minutos").textContent = String(minutos).padStart(2, "0");
        caja.querySelector(".segundos").textContent = String(segundos).padStart(2, "0");
    }

    pintar();
    setInterval(pintar, 1000);
}

// Barra de fuerza de la contrasena en el registro
function prepararFuerzaClave() {
    const clave = document.getElementById("clave");
    const barra = document.querySelector(".fuerza-clave .progress-bar");
    if (!clave || !barra) return;

    clave.addEventListener("input", () => {
        const v = clave.value;
        let puntos = 0;
        if (v.length >= 8) puntos++;
        if (/[A-Z]/.test(v)) puntos++;
        if (/[0-9]/.test(v)) puntos++;
        if (/[^A-Za-z0-9]/.test(v)) puntos++;
        const colores = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"];
        barra.style.width = (puntos * 25) + "%";
        barra.className = "progress-bar " + colores[puntos];
        barra.parentElement.setAttribute("aria-valuenow", puntos * 25);
    });
}

// ---------- AL CARGAR CUALQUIER PAGINA ----------

document.addEventListener("DOMContentLoaded", () => {
    actualizarContador();
    pintarZonaUsuario();
    pintarCarrito();
    pintarResumenPago();
    prepararFormularios();
    prepararFiltros();
    prepararDetalle();
    prepararCuentaAtras();
    prepararFuerzaClave();

    // Tooltips de Bootstrap
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));

    // Ano actual en el footer
    document.querySelectorAll(".ano-actual").forEach(el => {
        el.textContent = new Date().getFullYear();
    });
});
