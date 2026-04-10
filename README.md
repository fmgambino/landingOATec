# Proyecto de inscripción OATec 2026 - Instituto San Miguel

Este proyecto incluye una landing con formulario de inscripción hecha en **HTML, CSS y JavaScript**, conectada a **Google Sheets** mediante **Google Apps Script**.

## Archivos incluidos

- `index.html`: landing y formulario de inscripción.
- `styles.css`: estilos responsive con modo claro/oscuro.
- `script.js`: validaciones, envío del formulario y lógica de interfaz.
- `google-apps-script.gs`: backend para guardar los datos en Google Sheets.

## Datos solicitados

- Nombres
- Apellidos
- Edad
- Fecha de nacimiento
- DNI
- Curso (4, 5, 6, 7)
- División (A, B o C)

## Video promocional

La landing incluye embebido este video:

- https://youtu.be/5Ek1QFVk0hs

## Cómo conectarlo con Google Sheets

### 1) Crear la planilla

- Crear un Google Sheet nuevo.
- Copiar el ID del archivo desde la URL.

Ejemplo:

`https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit`

### 2) Crear el Apps Script

- Ir a `Extensiones > Apps Script` dentro del Google Sheet.
- Reemplazar el contenido por el archivo `google-apps-script.gs`.
- En la constante `SPREADSHEET_ID`, pegar el ID real de la planilla.

### 3) Publicar como Web App

- Hacer clic en `Implementar > Nueva implementación`.
- Elegir tipo `Aplicación web`.
- Ejecutar como: `Tu cuenta`.
- Quién tiene acceso: `Cualquiera`.
- Implementar y copiar la URL del Web App.

### 4) Pegar la URL en el frontend

En `script.js`, reemplazar:

```js
const GOOGLE_SCRIPT_URL = "PEGAR_AQUI_LA_URL_DEL_WEB_APP";
```

por la URL pública del Web App.

## Cómo usarlo

- Abrir `index.html` en un hosting estático o servidor web.
- Completar el formulario.
- Al enviar, los datos se registrarán en la hoja `Inscripciones OATec`.

## Sugerencia de publicación

Podés subir el frontend a:

- GitHub Pages
- Netlify
- Vercel
- Hosting propio del instituto

## Personalizaciones rápidas

- Cambiar textos en `index.html`.
- Modificar colores en `styles.css`.
- Ajustar validaciones en `script.js`.
