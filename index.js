document.addEventListener("DOMContentLoaded", () => {
    obtenerDatos();
    document.getElementById("post-creation-form").addEventListener("submit", crearPost);
});

async function obtenerDatos() {
    renderizarEstadoCargando();
    try {
        const [respuestaPosts, respuestaUsuarios] = await Promise.all([
            fetch("http://localhost:3004/posts"),
            fetch("http://localhost:3004/users")
        ]);

        if (!respuestaPosts.ok || !respuestaUsuarios.ok) {
            throw new Error("Network response was not ok");
        }

        const posts = await respuestaPosts.json();
        const usuarios = await respuestaUsuarios.json();

        const datos = posts.map(post => {
            const usuario = usuarios.find(u => u.id === post.userId.toString());
            return {
                ...post,
                nombreUsuario: usuario ? usuario.name : "Usuario Desconocido"
            };
        });

        renderizarDatos(datos);
    } catch (error) {
        renderizarEstadoError();
    }
}

function renderizarEstadoError() {
    const contenedor = document.getElementById("posts-display-container");
    contenedor.innerHTML = "<p>Failed to load data</p>";
}

function renderizarEstadoCargando() {
    const contenedor = document.getElementById("posts-display-container");
    contenedor.innerHTML = "<p>Loading...</p>";
}

function renderizarDatos(datos) {
    const contenedor = document.getElementById("posts-display-container");
    contenedor.innerHTML = "";

    datos.sort((a, b) => (b.isUserCreated ? 1 : 0) - (a.isUserCreated ? 1 : 0));

    if (datos.length > 0) {
        datos.forEach((item) => {
            const div = document.createElement("div");
            div.className = "post-item";

            const titulo = document.createElement("h2");
            titulo.textContent = `${item.title} (by ${item.nombreUsuario})`;

            const cuerpo = document.createElement("p");
            cuerpo.textContent = item.body;

            const botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.addEventListener("click", () => eliminarPost(item.id));

            div.appendChild(titulo);
            div.appendChild(cuerpo);
            div.appendChild(botonEliminar);
            contenedor.appendChild(div);
        });
    }
}

async function crearPost(event) {
    event.preventDefault();
    
    const userId = document.getElementById("user-id").value;
    const titulo = document.getElementById("title").value;
    const cuerpo = document.getElementById("body").value;

    try {
        const respuesta = await fetch("http://localhost:3004/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, title: titulo, body: cuerpo, isUserCreated: true })
        });

        if (!respuesta.ok) {
            throw new Error("Failed to create post");
        }

        obtenerDatos(); 
    } catch (error) {
        console.error(error);
    }
}

async function eliminarPost(postId) {
    try {
        const respuesta = await fetch(`http://localhost:3004/posts/${postId}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("Failed to delete post");
        }

        obtenerDatos(); 
    } catch (error) {
        console.error(error);
    }
}
