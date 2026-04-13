# OATec 2026 · GitHub Pages + Supabase + Panel Admin

Este paquete deja listo:

- `index.html`: formulario público de inscripción.
- `admin.html`: panel administrador para ver inscripciones.
- `styles.css`: estilos del sitio y del panel.
- `script.js`: envío público del formulario a Supabase.
- `admin.js`: login admin, listado, filtros, cambio de estado y exportación CSV.
- `config.js`: configuración de tu proyecto Supabase.
- `supabase_schema.sql`: tabla + políticas RLS.

## Cómo funciona

- El **formulario público** inserta datos usando la `anon key`.
- El **panel admin** inicia sesión con **Supabase Auth**.
- Sólo usuarios **autenticados** pueden leer y actualizar las inscripciones.

## Importante de seguridad

No conviene guardar una contraseña real dentro del código de GitHub Pages, porque cualquier visitante podría verla.  
Por eso esta versión usa **Supabase Auth**: el frontend muestra el usuario `admin`, pero la contraseña vive en Supabase y no queda hardcodeada en JavaScript.

## Paso 1 · Crear proyecto en Supabase

1. Creá un proyecto en Supabase.
2. Andá a `SQL Editor`.
3. Ejecutá completo el archivo `supabase_schema.sql`.

## Paso 2 · Crear el usuario administrador

En Supabase:

1. Andá a `Authentication > Users`.
2. Hacé clic en **Add user**.
3. Creá este usuario:

- **Email:** `admin@oatec.local`
- **Password:** `admin0342$$`

El panel te deja ingresar escribiendo:

- **Usuario:** `admin`
- **Contraseña:** `admin0342$$`

Internamente, `admin` se transforma en `admin@oatec.local`.

## Paso 3 · Completar config.js

Abrí `config.js` y pegá:

```js
window.SUPABASE_CONFIG = {
  SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
  SUPABASE_ANON_KEY: "TU_ANON_KEY",
  TABLE_NAME: "inscripciones_oatec",
  ADMIN_USERNAME: "admin",
  ADMIN_EMAIL: "admin@oatec.local"
};
```

Dónde encontrar esos datos:

- `Project URL`
- `anon public key`

en:

`Supabase > Project Settings > Data API`

## Paso 4 · Publicar en GitHub Pages

Subí estos archivos al repo de GitHub Pages:

- `index.html`
- `admin.html`
- `styles.css`
- `script.js`
- `admin.js`
- `config.js`

## Paso 5 · Cómo ver los datos

Una vez publicado:

- Formulario público: `https://TU-USUARIO.github.io/TU-REPO/`
- Panel admin: `https://TU-USUARIO.github.io/TU-REPO/admin.html`

Ingresás con:

- **Usuario:** `admin`
- **Contraseña:** `admin0342$$`

## Qué puede hacer el panel admin

- Ver todas las inscripciones
- Buscar por nombre, apellido o DNI
- Filtrar por estado
- Filtrar por curso
- Cambiar estado:
  - pendiente
  - aprobado
  - rechazado
- Exportar CSV

## Si el formulario no guarda

Revisá:

1. que `config.js` tenga URL y key reales
2. que la tabla se llame `inscripciones_oatec`
3. que el SQL se haya ejecutado completo
4. que RLS esté habilitado
5. que exista la policy de `insert` para `anon`

## Si el panel admin no entra

Revisá:

1. que el usuario exista en `Authentication > Users`
2. que el email sea `admin@oatec.local`
3. que la contraseña sea `admin0342$$`
4. que `ADMIN_EMAIL` en `config.js` coincida con ese email

## Recomendación

Después de probar que funciona, te recomiendo cambiar la contraseña admin por una más fuerte en Supabase.
