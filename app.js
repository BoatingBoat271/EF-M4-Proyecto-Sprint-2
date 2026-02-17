// Referencias del DOM.
const searchForm = document.getElementById("searchForm");
const recipeSearchInput = document.getElementById("recipeSearch");
const resultsGrid = document.getElementById("resultsGrid");
const resultsMeta = document.getElementById("resultsMeta");

const recipeDetailModal = document.getElementById("recipeDetailModal");
const detailCloseBtn = document.getElementById("detailCloseBtn");
const detailImage = document.getElementById("detailImage");
const detailTitle = document.getElementById("detailTitle");
const detailMeta = document.getElementById("detailMeta");
const detailIngredients = document.getElementById("detailIngredients");
const detailInstructions = document.getElementById("detailInstructions");

// Configuración de búsqueda.
// Diccionario de respaldo.
const diccionarioRespaldoIngredientes = {
	aceituna: "green olives",
	aceitunas: "green olives",
	ajo: "garlic",
	arroz: "rice",
	atun: "tuna",
	camaron: "prawn",
	carne: "beef",
	cebolla: "onion",
	cerdo: "pork",
	huevo: "egg",
	leche: "milk",
	limon: "lemon",
	maiz: "corn",
	manzana: "apples",
	manzanas: "apples",
	naranja: "orange",
	papa: "potato",
	pescado: "fish",
	pollo: "chicken",
	queso: "cheese",
	res: "beef",
	salmon: "salmon",
	tomate: "tomato",
};

// Correcciones ortográficas.
const correccionesIngredientes = {
	acieituna: "aceituna",
};

// Reglas de alternativas.
const reglasAlternativas = {
	aceituna: ["green olives", "black olives"],
	aceitunas: ["green olives", "black olives"],
	fish: ["seafood", "salmon", "tuna", "prawn"],
	pescado: ["fish", "seafood", "salmon", "tuna", "prawn"],
	seafood: ["fish", "salmon", "tuna", "prawn"],
};

// Diccionario activo.
let diccionarioBaseIngredientes = { ...diccionarioRespaldoIngredientes };

// Utilidades de traducción.
function normalizarTexto(texto) {
	return `${texto || ""}`
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function corregirTermino(termino) {
	return correccionesIngredientes[termino] || termino;
}

function traducirIngredienteConDiccionario(ingrediente) {
	const terminoNormalizado = normalizarTexto(ingrediente);
	const terminoCorregido = corregirTermino(terminoNormalizado);

	if (diccionarioBaseIngredientes[terminoCorregido]) {
		return diccionarioBaseIngredientes[terminoCorregido];
	}

	const palabras = terminoCorregido.split(/\s+/).filter(Boolean);
	for (const palabra of palabras) {
		if (diccionarioBaseIngredientes[palabra]) {
			return diccionarioBaseIngredientes[palabra];
		}
	}

	return terminoCorregido;
}

function obtenerAlternativasBusqueda(ingrediente) {
	const terminoNormalizado = normalizarTexto(ingrediente);
	const alternativas = [];

	const agregar = (valor) => {
		const limpio = normalizarTexto(valor);
		if (limpio && !alternativas.includes(limpio)) {
			alternativas.push(limpio);
		}
	};

	const agregarReglas = (termino) => {
		const regla = reglasAlternativas[termino];
		if (!regla) {
			return;
		}
		ruleLoop: for (const opcion of regla) {
			agregar(opcion);
		}
	};

	const traduccionPrincipal = traducirIngredienteConDiccionario(ingrediente);
	agregar(traduccionPrincipal);
	agregarReglas(normalizarTexto(traduccionPrincipal));
	agregarReglas(terminoNormalizado);

	const palabras = terminoNormalizado.split(/\s+/).filter(Boolean);
	for (const palabra of palabras) {
		const terminoPalabra = diccionarioBaseIngredientes[palabra] || palabra;
		agregar(terminoPalabra);
		agregarReglas(normalizarTexto(terminoPalabra));
		agregarReglas(palabra);
	}

	agregar(terminoNormalizado);
	return alternativas;
}

async function cargarDiccionarioIngredientes() {
	try {
		const response = await fetch("./data/ingredientes-basicos.json");
		if (!response.ok) {
			return;
		}

		const data = await response.json();
		const traducciones = data?.traducciones || {};
		const diccionarioExtendido = { ...diccionarioRespaldoIngredientes };

		Object.entries(traducciones).forEach(([clave, valor]) => {
			const claveNormalizada = normalizarTexto(clave);
			const valorNormalizado = normalizarTexto(valor);
			if (claveNormalizada && valorNormalizado) {
				diccionarioExtendido[claveNormalizada] = valorNormalizado;
			}
		});

		diccionarioBaseIngredientes = diccionarioExtendido;
	} catch {
		diccionarioBaseIngredientes = { ...diccionarioRespaldoIngredientes };
	}
}

// Acceso a API.
async function buscarPorIngrediente(ingrediente) {
	const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingrediente)}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("No se pudo consultar la API");
	}

	const data = await response.json();
	return data.meals;
}

async function buscarRecetasConAlternativas(ingrediente) {
	const alternativas = obtenerAlternativasBusqueda(ingrediente);

	for (const alternativa of alternativas) {
		const recetas = await buscarPorIngrediente(alternativa);
		if (recetas) {
			return recetas;
		}
	}

	return null;
}

async function obtenerDetalleReceta(idMeal) {
	const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(idMeal)}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("No se pudo consultar el detalle de la receta");
	}

	const data = await response.json();
	return data.meals?.[0] || null;
}

// Render y estado UI.
function limpiarResultados() {
	resultsGrid.innerHTML = "";
}

function mostrarMensaje(textoMeta, textoContenido) {
	resultsMeta.textContent = textoMeta;
	resultsGrid.innerHTML = `
		<div class="col-12">
			<p class="results-empty text-center fs-5 mb-0 py-4">${textoContenido}</p>
		</div>
	`;
}

function mostrarSinResultados() {
	limpiarResultados();
	mostrarMensaje("0 recetas encontradas", "No se encontraron recetas para ese ingrediente.");
}

function mostrarError() {
	mostrarMensaje("Error al buscar recetas", "Ocurrió un error al consultar la API. Intenta nuevamente.");
}

function crearTarjeta(receta) {
	return `
		<div class="col-12 col-md-6 col-lg-4">
			<article class="card recipe-card h-100">
				<img src="${receta.strMealThumb}" class="card-img-top" alt="${receta.strMeal}" />
				<div class="card-body d-flex flex-column">
					<h5 class="card-title">${receta.strMeal}</h5>
					<button type="button" class="btn btn-primary mt-auto" data-ver-receta-id="${receta.idMeal}">Ver receta</button>
				</div>
			</article>
		</div>
	`;
}

function renderRecetas(recetas) {
	limpiarResultados();
	resultsGrid.innerHTML = recetas.map((receta) => crearTarjeta(receta)).join("");
	resultsMeta.textContent = `${recetas.length} receta${recetas.length === 1 ? "" : "s"} encontrada${recetas.length === 1 ? "" : "s"}`;
}

function construirIngredientes(detalle) {
	const ingredientes = [];

	for (let indice = 1; indice <= 20; indice += 1) {
		const nombre = `${detalle[`strIngredient${indice}`] || ""}`.trim();
		const medida = `${detalle[`strMeasure${indice}`] || ""}`.trim();

		if (!nombre) {
			continue;
		}

		ingredientes.push(`${medida ? `${medida} ` : ""}${nombre}`.trim());
	}

	return ingredientes;
}

function abrirModalReceta(detalle) {
	detailImage.src = detalle.strMealThumb || "";
	detailImage.alt = detalle.strMeal || "Receta";
	detailTitle.textContent = detalle.strMeal || "Receta";
	detailMeta.textContent = `Categoría: ${detalle.strCategory || "-"} · Origen: ${detalle.strArea || "-"}`;
	detailIngredients.innerHTML = construirIngredientes(detalle)
		.map((item) => `<li>${item}</li>`)
		.join("");
	detailInstructions.textContent = detalle.strInstructions || "Sin preparación disponible.";

	recipeDetailModal.classList.remove("d-none");
	recipeDetailModal.setAttribute("aria-hidden", "false");
}

function cerrarModalReceta() {
	recipeDetailModal.classList.add("d-none");
	recipeDetailModal.setAttribute("aria-hidden", "true");
}

// Eventos e inicialización.
resultsGrid.addEventListener("click", async (event) => {
	const boton = event.target.closest("[data-ver-receta-id]");
	if (!boton) {
		return;
	}

	try {
		const detalle = await obtenerDetalleReceta(boton.dataset.verRecetaId);
		if (detalle) {
			abrirModalReceta(detalle);
		}
	} catch {
		mostrarError();
	}
});

detailCloseBtn.addEventListener("click", cerrarModalReceta);
recipeDetailModal.addEventListener("click", (event) => {
	if (event.target?.dataset?.closeDetail === "true") {
		cerrarModalReceta();
	}
});

searchForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const ingrediente = recipeSearchInput.value.trim();

	if (!ingrediente) {
		resultsMeta.textContent = "Escribe un ingrediente para buscar recetas";
		limpiarResultados();
		return;
	}

	resultsMeta.textContent = "Buscando recetas...";
	limpiarResultados();

	try {
		const recetas = await buscarRecetasConAlternativas(ingrediente);
		if (!recetas) {
			mostrarSinResultados();
			return;
		}

		renderRecetas(recetas);
	} catch {
		mostrarError();
	}
});

cargarDiccionarioIngredientes();
