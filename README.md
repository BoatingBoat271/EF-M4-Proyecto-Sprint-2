# 🥗 Proyecto Integrador: Buscador de Recetas

¡Bienvenido a tu nuevo buscador de recetas inteligente! Este proyecto fue creado como parte del Sprint 2 del Módulo 4 de EducaciónIT, combinando creatividad, buenas prácticas de desarrollo web y pasión por la cocina.

## 🚀 ¿Qué hace esta app?

- Permite buscar recetas de cocina por ingredientes, en español o inglés.
- Traduce automáticamente los ingredientes para encontrar resultados internacionales.
- Muestra tarjetas visuales de cada receta, con imagen, nombre y acceso rápido al detalle.
- Al hacer clic en una receta, despliega un modal con ingredientes, instrucciones y detalles.
- Al cargar la página, muestra automáticamente recetas con "pollo" para inspirarte desde el inicio.
- Utiliza la API pública de [TheMealDB](https://www.themealdb.com/) para obtener recetas reales y variadas.

## ✨ ¿Por qué es especial?

- **Interfaz moderna y responsiva:** Pensada para usarse en cualquier dispositivo.
- **Experiencia de usuario cuidada:** Mensajes claros, búsquedas inteligentes y feedback visual.
- **Código estructurado con POO:** Separación clara entre lógica de UI y lógica de negocio.
- **Internacionalización:** Traducción automática de ingredientes y sugerencias alternativas.
- **Inspiración instantánea:** Siempre tendrás una receta sugerida al abrir la app.

## 🛠️ ¿Cómo se hizo?

- **HTML5 + CSS3:** Maquetado semántico y estilos modernos.
- **JavaScript (ES6+):** Programación orientada a objetos, asincronía con fetch y manejo avanzado del DOM.
- **Consumo de API REST:** Integración con TheMealDB para obtener datos en tiempo real.
- **JSON externo:** Diccionario de ingredientes ampliable y fácil de mantener.

## 📦 Estructura del proyecto

```
├── app.js                  # Lógica principal y UI
├── index.html              # Página principal
├── style.css               # Estilos personalizados
└── data/
    └── ingredientes-basicos.json  # Diccionario de ingredientes
```

## 💡 Instalacion y uso local

```bash
# 1) Clonar el repositorio
git clone https://github.com/BoatingBoat271/EF-M4-Proyecto-Sprint-2.git

# 2) Entrar al proyecto
cd EF-M4-Proyecto-Sprint-2
```

Opciones para ejecutarlo:

```bash
# Opcion A: abrir index.html directamente
# Opcion B: levantar servidor local (recomendado)
npx --yes serve . -l 5502
```

Abre `http://localhost:5502` o visita la demo en vivo: https://boatingboat271.github.io/EF-M4-Proyecto-Sprint-2/

## 🌟 Demo rápida

- Al abrir la app, verás recetas de "pollo" automáticamente.
- Escribe cualquier ingrediente (en español o inglés) y obtén recetas al instante.
- Haz clic en cualquier receta para ver los detalles completos.

## 👨‍💻 Autor

Desarrollado por Pablo para el Sprint 2 del Módulo 4 de EducaciónIT.

---

¡Explora, cocina y disfruta! 🍽️
