# Plan de Trabajo Detallado: Mesa Virtual

Este documento contiene la definición completa, características, y el paso a paso del desarrollo de la aplicación web para juegos de mesa. Lo utilizaremos como guía principal y checklist.

## 1. Visión y Objetivo del Proyecto
Crear una plataforma web **premium, rápida y fluida** que permita a los jugadores simular cualquier juego de mesa. Los usuarios podrán crear salas privadas, subir sus propios recursos gráficos (tableros, fichas, cartas) y jugar en un entorno interactivo y sincronizado en tiempo real.

## 2. Pila Tecnológica (Stack)
- **Backend:** Node.js, Express (servidor web y API), Socket.io (WebSocket en tiempo real), Multer (recepción de archivos de imagen).
- **Frontend:** Vanilla HTML5, CSS3 (diseño moderno Glassmorphism, animaciones fluidas, sin frameworks como React o Angular para mantenerlo ligero y directo), Vanilla JavaScript (Pointer Events para drag & drop).

## 3. Características Principales (Features)
- **Sistema de Salas (Rooms):** Los usuarios pueden crear o unirse a una sesión mediante un código único.
- **Multijugador en Tiempo Real:** Todos los movimientos de cartas o fichas se ven al instante en las pantallas de los demás.
- **Carga Dinámica de Assets:** Subida y aparición instantánea de tableros de fondo, cartas individuales o fichas.
- **Interacción Avanzada:**
  - *Drag & Drop:* Arrastrar piezas libremente por el tablero.
  - *Acciones contextuales:* Rotar piezas, voltearlas (boca arriba / boca abajo) y llevar al frente/fondo (control de capa Z).
- **Experiencia Inmersiva ("Wow Factor"):**
  - Rastreo de cursores: Puedes ver la flecha del ratón de tus amigos moviéndose por la mesa con sus nombres.
  - Chat en vivo.
  - Tirador de dados sincronizado.

---

## 4. Fases de Desarrollo Paso a Paso

### Fase 1: Configuración del Entorno y Backend Base
- [x] Inicializar el proyecto Node.js (`package.json`).
- [ ] Instalar dependencias mediante `npm install` (`express`, `socket.io`, `multer`, `uuid`).
- [x] Crear servidor HTTP básico en `server.js`.
- [x] Configurar Socket.io para la comunicación en tiempo real y separar las conexiones por Salas (Rooms).
- [x] Crear estructura de carpetas públicas estáticas (`public/assets`, `public/uploads`).

### Fase 2: Interfaz Visual de Inicio (Frontend)
- [x] **`index.html` (Lobby)**: Crear barra de navegación superior (Pestañas: Inicio, Secciones, Juegos) y menú de usuario desplegable (Avatar).
- [x] **`style.css`**: Implementar panel centrado con Glassmorphism para mostrar el Nombre y Apodo del usuario en grande.
- [x] Añadir un Selector de Colores (Color Picker) temporal para personalizar la paleta CSS en vivo.
- [x] Limpiar la pantalla de inicio eliminando los botones de "Crear" y "Unirse" a sala (se moverán a otra pestaña).

### Fase 3: Lógica de Navegación de Pestañas
- [x] Construir la lógica en JavaScript para ocultar/mostrar vistas al hacer clic en las pestañas del Navbar ("Inicio", "Secciones", "Juegos", "Personajes", "Inventario").
- [x] Crear la estructura visual (HTML) de la pestaña "Secciones".
    - [x] Aqui el usuario prodra:
        - [x] Crear un seccion
        - [x] Invitar a jugadores
        - [x] Unirce apartidas
        - [x] Ver historial de secciones creadas y partidas jugadas
- [x] Crear la estructura visual (HTML) de la pestaña "Juegos".
    - [x] Aqui el usuario podra ver los juegos creado en cuadriculas
        - [x] Cada cuadricula con opciones de editar, eliminar y configurar
    - [x] Boton de Crear juego.
- [x] Crear la estructura visual (HTML) de la pestaña "Personajes" nueva.
    - [x] Aqui el usuario podra ver las diferentes archivos subido de sus personajes y informacion del personajes
- [x] Crear la estructura visual (HTML) de la pestaña "Inventario" nueva.
    - [x] Aqui el usuario podra ver las diferentes archivos subido por categorias como tambien crear categorias: Tableros, cartas, fichas etc
      
### Fase 4: Pulido de Pestaña "Secciones"
- [x] Desarrollar la lógica e interfaz visual para el botón "Crear Sección".
- [x] Implementar la interfaz de "Unirse a Partida" mediante código.
- [x] Construir un sistema para "Invitar a jugadores" (generar link o código).
- [x] Diseñar y mostrar la lista dinámica del Historial de secciones creadas/jugadas.
- [x] Conectar la creación o ingreso de sala para transicionar a la vista de "Mesa Virtual" (`#game-screen`).
- [x] Vincular a Juego 

### Fase 5: Pulido de Pestaña "Juegos"
- [x] Desarrollar el formulario o modal para "Crear Nuevo Juego".
    - [x] El formulario debe tener los siguientes campos:
        - [x] Nombre del Juego
        - [x] Icono (Un Emoji o una imagen de subida por el usuario para el juego)
        - [x] Herramientas del tablero virtual
          - [x] Un lanzador de dados (D6, D8, D10, D12, D20, D100)
          - [x] Un bloc de notas
          - [x] Contador de Vida
          - [x] Contador de Mana
          - [x] Contador de recistencia
          - [x] Ruleta (Numero, acciones, efectos, imagenes, texto etc)
          - [x] poder traer desde inventario ( token, table, etc)
            - [x] Contador de Items y categorizacion
          - [x] Los Jugadores puede tener inventario de objetos
          - [x] DM Master - Control de los jugadores, reglas, mapa, etc
            - [x] indicador lo que puede o no hacer los jugadores (por ejemplo cambiar vida, recistencia, mana etc)
          - [ ] Cambio de mapa (Traer desde inventario) poder crear mapa con los archivos subidos en inventario
          - [ ] Personajes(Traer desde personaje)
          - [ ] traer cartas personalizadas, los mismo fichas, etc desde inventario para jugar al juego
          
- [x] Programar la cuadrícula dinámica para mostrar los juegos creados por el usuario.
- [x] Añadir funcionalidad a los botones de cada juego: Editar información, Eliminar y Configurar.

### Fase 6: Pulido de Pestaña "Personajes"
- [x] Crear la interfaz y formulario para subir y crear un nuevo personaje.
    - [x] **1. Información General**
        - [x] Nombre Completo
        - [x] Apodo / Alias
        - [x] Edad (Real y Aparente)
        - [x] Fecha / Lugar de Nacimiento
        - [x] Ocupación / Rol
        - [x] Especie / Raza
    - [x] **2. Apariencia Física**
        - [x] Estructura Corporal (Altura/Peso/Complexión)
        - [x] Color de Ojos y Cabello
        - [x] Estilo de Vestimenta
        - [x] Rasgos Distintivos (Cicatrices, tatuajes, marcas, gafas)
    - [x] **3. Psicología y Personalidad**
        - [x] Rasgos Positivos (Virtudes)
        - [x] Rasgos Negativos (Defectos/Vicios)
        - [x] Mayor Temor / Fobia
        - [x] Motivación Principal (¿Qué le mueve?)
    - [x] **4. Trasfondo y Relaciones**
        - [x] Estado Actual (Soltero, casado, en una misión, prófugo)
        - [x] Aliados / Amigos Clave
        - [x] Enemigos / Rivales
        - [x] Un Breve Resumen de su Pasado
    - [x] **5. Habilidades y Pertenencias**
        - [x] Habilidad Especial / Talento
        - [x] Debilidad Física o Mental
- [x] Mostrar información detallada, notas o atributos del personaje.
- [x] Visualizar la galería o lista de personajes pertenecientes al usuario.
- [x] Subir representacion visual del personaje

### Fase 7: Pulido de Pestaña "Inventario" (Gestión de Archivos Base)
- [x] Configurar el backend (`multer`) en `/api/upload` para recibir imágenes.
- [x] Crear la interfaz para subir archivos y organizarlos.
- [x] Permitir al usuario crear y gestionar "Categorías" (Tableros, Fichas, Cartas, etc.).
- [x] Lógica con `fetch()` para guardar referencias de los archivos subidos.
- [x] Las Categorias se pueden crear, editar, eliminar y ver las imagenes que contiene cada categoria
- [x] Las imagenes se pueden ver, editar, eliminar y ver las categorias a la que pertenece
- [ ] Las imagenes pueden tener imagenes personalizadas en los iconos de la categoria
- [x] la imagen puede tenes faces (cara de la imagen y contraface de la imagen )
- [ ] las images se puede agrupar a los juegos, secciones, inventario para mostrar solo esas imagenes en esa seccion
- [x] las images se pueden crear y editar desde inventario 
- [ ] las images se pueden editar desde los juegos, secciones, inventario
- [x] las imagenes se pueden eliminar desde inventario
- [ ] las imagenes se pueden eliminar desde los juegos, secciones, inventario
- [x] crear categoria
- [x] editar categoria
- [x] eliminar categoria



### Fase 8: Herramientas de la Mesa Virtual
- [x] Implementar la interfaz visual de las herramientas en la Mesa Virtual (paneles laterales y modales).
- [x] Programar el Lanzador de dados (D6, D8, D10, D12, D20, D100).
- [x] Programar el Bloc de notas persistente.   
- [x] Programar la lógica de Contadores (Vida, Maná, Resistencia, Items).
- [x] Programar la Ruleta Dinámica (Números, acciones, efectos).
- [x] Conectar el Inventario Base y la galería de Personajes para poder visualizarlos dentro de la partida.
- [x] Aplicar permisos del DM (ocultar herramientas si no están permitidas).
- [ ] Crear mapa personalizado-modular subidos desde inventario
- [x] segunda pantalla  para el Dm



### Fase 9: Motor de Interacción en la Mesa Virtual (Drag & Drop)
- [x] Lógica para extraer (hacer spawn) imágenes, cartas, fichas o personajes desde el inventario hacia el tablero.
- [x] Implementar sistema matemático en `client.js` (`pointerdown`, `pointermove`, `pointerup`) para arrastrar piezas.
- [x] Programar funciones contextuales para rotar piezas (ej. girar 90 grados).
- [x] Programar función de voltear carta (cambiar entre frente y reverso estandarizado).
- [x] Cambio de mapa o fondo del tablero.

### Fase 10: Sincronización en Tiempo Real (Socket.io)
- [ ] Emitir posiciones y rotaciones de los objetos al moverlos.
- [ ] Retransmitir (broadcast) los eventos instantáneamente a los demás jugadores en la misma sala.
- [ ] Guardar y mantener el estado de los objetos en memoria dentro de `server.js` (`rooms`).
- [ ] Sincronizar los cambios de atributos (vida, maná) y tiradas de dados.

### Fase 11: Inmersión y Funciones Adicionales
- [ ] Rastrear y mostrar los cursores del mouse de otros jugadores en tiempo real (con sus colores y nombres).
- [ ] Implementación de chat de texto en vivo.

---

## 5. Arquitectura de Estado (Memoria del Servidor)
La información activa de la sala se guardará en memoria mientras la partida dure (en `server.js`):
```javascript
const rooms = {
  "sala-123": {
    players: {
      "socketId_A": { name: "Joan", color: "#FF5733", cursor: {x: 0, y: 0} }
    },
    elements: {
      "uuid_elemento_1": {
        type: "card", // carta o ficha
        x: 150,
        y: 300,
        rotation: 0,
        isFlipped: false,
        imageUrl: "/uploads/imagen1.png",
        zIndex: 10
      }
    },
    background: "/uploads/tablero-epic.jpg"
  }
}
```
