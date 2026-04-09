
// --- App POO ---

// Maneja la interfaz de usuario (UI)
class UIHandler {
	constructor() {
		this.searchForm = document.getElementById("searchForm");
		this.recipeSearchInput = document.getElementById("recipeSearch");
		this.resultsGrid = document.getElementById("resultsGrid");
		this.resultsMeta = document.getElementById("resultsMeta");
		this.recipeDetailModal = document.getElementById("recipeDetailModal");
		this.detailCloseBtn = document.getElementById("detailCloseBtn");
		this.detailImage = document.getElementById("detailImage");
		this.detailTitle = document.getElementById("detailTitle");
		this.detailMeta = document.getElementById("detailMeta");
		this.detailIngredients = document.getElementById("detailIngredients");
		this.detailInstructions = document.getElementById("detailInstructions");
	}

	// Limpia los resultados de recetas
	limpiarResultados() {
		this.resultsGrid.innerHTML = "";
	}

	// Muestra un mensaje en la UI
	mostrarMensaje(meta, contenido) {
		this.resultsMeta.textContent = meta;
		this.resultsGrid.innerHTML = `
			<div class="col-12">
				<p class="results-empty text-center fs-5 mb-0 py-4">${contenido}</p>
			</div>
		`;
	}

	// Muestra mensaje de sin resultados
	mostrarSinResultados() {
		this.limpiarResultados();
		this.mostrarMensaje("0 recetas encontradas", "No se encontraron recetas para ese ingrediente.");
	}

	// Muestra mensaje de error
	mostrarError() {
		this.mostrarMensaje("Error al buscar recetas", "Ocurrió un error al consultar la API. Intenta nuevamente.");
	}

	// Crea la tarjeta HTML de una receta
	crearTarjeta(receta) {
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

	// Renderiza las recetas en la UI
	renderRecetas(recetas) {
		this.limpiarResultados();
		this.resultsGrid.innerHTML = recetas.map((r) => this.crearTarjeta(r)).join("");
		this.resultsMeta.textContent = `${recetas.length} receta${recetas.length === 1 ? "" : "s"} encontrada${recetas.length === 1 ? "" : "s"}`;
	}

	// Construye la lista de ingredientes de una receta
	construirIngredientes(detalle) {
		const ingredientes = [];
		for (let i = 1; i <= 20; i++) {
			const nombre = `${detalle[`strIngredient${i}`] || ""}`.trim();
			const medida = `${detalle[`strMeasure${i}`] || ""}`.trim();
			if (!nombre) continue;
			ingredientes.push(`${medida ? `${medida} ` : ""}${nombre}`.trim());
		}
		return ingredientes;
	}

	// Abre el modal con el detalle de la receta
	abrirModalReceta(detalle) {
		this.detailImage.src = detalle.strMealThumb || "";
		this.detailImage.alt = detalle.strMeal || "Receta";
		this.detailTitle.textContent = detalle.strMeal || "Receta";
		this.detailMeta.textContent = `Categoría: ${detalle.strCategory || "-"} · Origen: ${detalle.strArea || "-"}`;
		this.detailIngredients.innerHTML = this.construirIngredientes(detalle).map((item) => `<li>${item}</li>`).join("");
		this.detailInstructions.textContent = detalle.strInstructions || "Sin preparación disponible.";
		this.recipeDetailModal.classList.remove("d-none");
		this.recipeDetailModal.setAttribute("aria-hidden", "false");
	}

	// Cierra el modal de detalle
	cerrarModalReceta() {
		this.recipeDetailModal.classList.add("d-none");
		this.recipeDetailModal.setAttribute("aria-hidden", "true");
	}
}

// Lógica principal de la app de recetas
class RecipeApp {
	constructor(ui) {
		// Diccionarios y reglas
		this.diccionarioRespaldo = {
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
		this.correcciones = { acieituna: "aceituna" };
		this.reglasAlternativas = {
			aceituna: ["green olives", "black olives"],
			aceitunas: ["green olives", "black olives"],
			fish: ["seafood", "salmon", "tuna", "prawn"],
			pescado: ["fish", "seafood", "salmon", "tuna", "prawn"],
			seafood: ["fish", "salmon", "tuna", "prawn"],
		};
		this.diccionario = { ...this.diccionarioRespaldo };
		this.ui = ui;
		this.init();
	}

	// Normaliza texto
	// Normaliza texto para búsquedas
	normalizar(texto) {
		return `${texto || ""}`.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}

	// Corrige errores ortográficos
	corregir(termino) {
		return this.correcciones[termino] || termino;
	}

	// Traduce un ingrediente usando el diccionario
	traducirIngrediente(ingrediente) {
		const termNorm = this.normalizar(ingrediente);
		const termCorr = this.corregir(termNorm);
		if (this.diccionario[termCorr]) return this.diccionario[termCorr];
		const palabras = termCorr.split(/\s+/).filter(Boolean);
		for (const palabra of palabras) {
			if (this.diccionario[palabra]) return this.diccionario[palabra];
		}
		return termCorr;
	}

	// Obtiene alternativas de búsqueda para un ingrediente
	obtenerAlternativas(ingrediente) {
		const termNorm = this.normalizar(ingrediente);
		const alternativas = [];
		const agregar = (valor) => {
			const limpio = this.normalizar(valor);
			if (limpio && !alternativas.includes(limpio)) alternativas.push(limpio);
		};
		const agregarReglas = (termino) => {
			const regla = this.reglasAlternativas[termino];
			if (!regla) return;
			for (const opcion of regla) agregar(opcion);
		};
		const principal = this.traducirIngrediente(ingrediente);
		agregar(principal);
		agregarReglas(this.normalizar(principal));
		agregarReglas(termNorm);
		const palabras = termNorm.split(/\s+/).filter(Boolean);
		for (const palabra of palabras) {
			const termPalabra = this.diccionario[palabra] || palabra;
			agregar(termPalabra);
			agregarReglas(this.normalizar(termPalabra));
			agregarReglas(palabra);
		}
		agregar(termNorm);
		return alternativas;
	}

	// Carga el diccionario extendido desde JSON
	async cargarDiccionario() {
		try {
			const response = await fetch("./data/ingredientes-basicos.json");
			if (!response.ok) return;
			const data = await response.json();
			const traducciones = data?.traducciones || {};
			const extendido = { ...this.diccionarioRespaldo };
			Object.entries(traducciones).forEach(([clave, valor]) => {
				const claveNorm = this.normalizar(clave);
				const valorNorm = this.normalizar(valor);
				if (claveNorm && valorNorm) extendido[claveNorm] = valorNorm;
			});
			this.diccionario = extendido;
		} catch {
			this.diccionario = { ...this.diccionarioRespaldo };
		}
	}

	// Busca recetas por ingrediente en la API
	async buscarPorIngrediente(ingrediente) {
		const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingrediente)}`;
		const response = await fetch(url);
		if (!response.ok) throw new Error("No se pudo consultar la API");
		const data = await response.json();
		return data.meals;
	}

	// Busca recetas probando alternativas
	async buscarRecetasConAlternativas(ingrediente) {
		const alternativas = this.obtenerAlternativas(ingrediente);
		for (const alternativa of alternativas) {
			const recetas = await this.buscarPorIngrediente(alternativa);
			if (recetas) return recetas;
		}
		return null;
	}

	// Obtiene el detalle de una receta por ID
	async obtenerDetalleReceta(idMeal) {
		const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(idMeal)}`;
		const response = await fetch(url);
		if (!response.ok) throw new Error("No se pudo consultar el detalle de la receta");
		const data = await response.json();
		return data.meals?.[0] || null;
	}

	// Inicializa eventos y carga diccionario
	// Busca recetas iniciales para inspirar
	async cargarRecetasIniciales() {
		try {
			this.ui.resultsMeta.textContent = "Cargando recetas de inspiración...";
			const recetas = await this.buscarRecetasConAlternativas("pollo");
			if (recetas) {
				this.ui.renderRecetas(recetas);
			}
		} catch {
			// Si falla, simplemente no muestra error
		}
	}

	// Inicializa eventos y carga el diccionario
	init() {
		this.cargarDiccionario();
		// Cargar recetas iniciales
		this.cargarRecetasIniciales();
		// Evento: ver receta
		this.ui.resultsGrid.addEventListener("click", async (event) => {
			const boton = event.target.closest("[data-ver-receta-id]");
			if (!boton) return;
			try {
				const detalle = await this.obtenerDetalleReceta(boton.dataset.verRecetaId);
				if (detalle) this.ui.abrirModalReceta(detalle);
			} catch {
				this.ui.mostrarError();
			}
		});
		// Evento: cerrar modal
		this.ui.detailCloseBtn.addEventListener("click", () => this.ui.cerrarModalReceta());
		this.ui.recipeDetailModal.addEventListener("click", (event) => {
			if (event.target?.dataset?.closeDetail === "true") this.ui.cerrarModalReceta();
		});
		// Evento: buscar
		this.ui.searchForm.addEventListener("submit", async (event) => {
			event.preventDefault();
			const ingrediente = this.ui.recipeSearchInput.value.trim();
			if (!ingrediente) {
				this.ui.resultsMeta.textContent = "Escribe un ingrediente para buscar recetas";
				this.ui.limpiarResultados();
				return;
			}
			this.ui.resultsMeta.textContent = "Buscando recetas...";
			this.ui.limpiarResultados();
			try {
				const recetas = await this.buscarRecetasConAlternativas(ingrediente);
				if (!recetas) {
					this.ui.mostrarSinResultados();
					return;
				}
				this.ui.renderRecetas(recetas);
			} catch {
				this.ui.mostrarError();
			}
		});
	}
}

// Inicialización de la app
const ui = new UIHandler();
const app = new RecipeApp(ui);
