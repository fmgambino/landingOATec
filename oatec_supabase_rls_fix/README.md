# Fix de RLS para OATec + Supabase

## Qué estaba fallando
El formulario público usa la `anon key` para insertar en `public.inscripciones_oatec`.

El error:

`new row violates row-level security policy for table "inscripciones_oatec"`

significa que **RLS está activado pero falta una política `INSERT` para el rol `anon`**,
o bien la política existe pero no permite ese insert.

## Cómo corregirlo

1. Abrí tu proyecto de Supabase.
2. Entrá en **SQL Editor**.
3. Ejecutá completo el archivo `supabase_schema_fix.sql`.
4. Volvé a probar el formulario.

## Qué hace este fix

- permite `INSERT` público desde GitHub Pages con `anon key`
- deja `SELECT / UPDATE / DELETE` sólo para el admin autenticado
- agrega grants necesarios
- mantiene la tabla `inscripciones_oatec`

## Usuario admin esperado

El panel admin está pensado para el usuario:

- email: `admin@oatec.local`
- contraseña: la que definas en Supabase Auth

## Nota importante
No guardes una contraseña real fija en el frontend. El frontend puede mostrar "admin",
pero la seguridad real debe vivir en Supabase Auth + RLS.
