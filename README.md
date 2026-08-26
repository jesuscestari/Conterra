# Conterra Desarrollos

Sitio institucional de Conterra: React 19 + Vite, desplegado en Netlify como
sitio estático.

```bash
pnpm install
npm run dev
```

## Estructura

El sitio es un SPA con React Router. Cada proyecto inmobiliario vive como una
entrada en `proyectosData`, dentro de [`src/pages/ProyectoDetalle.jsx`](src/pages/ProyectoDetalle.jsx).

Un proyecto puede además tener un **plano de lotes interactivo**. Hoy solo lo
tiene El Madrigal; es la única parte del sitio con base de datos.

## Imágenes

Las fotos de drone vienen a 4096 px o más y pesan varios MB. En la galería se
ven a menos de 400 px, así que todo lo que sobra es peso puro.

```bash
npm run optimize-images        # reencodea src/assets a 2048 px, calidad 82
npm run optimize-images -- --dry
```

Es seguro correrlo de nuevo: no vuelve a tocar lo que ya está optimizado.
Conviene pasarlo cada vez que se suman fotos de un proyecto nuevo.

## Plano de lotes

Portado desde una app Next que hizo un equipo externo. Vive nativo acá: no hay
iframe, ni proxy, ni servidor aparte.

| Pieza | Dónde |
|---|---|
| Mapa y panel | `src/components/plano`, `src/components/lote`, `src/components/auth` |
| Lógica y acceso a datos | `src/lib` |
| API | `netlify/functions` (5 funciones) |
| Esquema y seed | `prisma/` |
| Geometría de los polígonos | `public/data/plano-geometria.json` |
| Vectorizador del plano | `scripts/vectorizar-plano` |

Rutas: el plano en `/proyectos/el-madrigal/plano` y el acceso de
administradores en `/admin`. Las dos se cargan diferidas, así que no le suman
peso al resto del sitio.

### Levantarlo en local

No hace falta Neon ni Docker: `db:local` levanta un Postgres real (PGlite,
compilado a WebAssembly) y guarda los datos en `.pglite/`.

```bash
cp .env.example .env           # completar SESSION_SECRET y SEED_ADMIN_*
npm run db:local               # dejar corriendo en una terminal
npm run db:seed                # en otra: crea el admin y los 462 lotes
netlify dev                    # sitio + funciones en :8888
```

`npm run dev` sirve el sitio pero no las funciones, así que el plano se ve sin
estados ni precios. Para trabajar sobre el plano hay que usar `netlify dev`.

### Quién entra al panel

La tabla de administradores es nuestra, así que las cuentas se manejan desde acá
y no se le piden a nadie. La contraseña se toma del entorno y nunca se imprime.

```bash
npm run admins                          # lista quién tiene acceso
npm run admins -- --crear               # crea una cuenta con ADMIN_*
npm run admins -- --resetear            # le cambia la clave a ADMIN_EMAIL
npm run admins -- --desactivar a@b.com  # le corta el acceso, sin borrarla
```

Se desactiva en vez de borrar porque `Lote.editadoPor` apunta a la cuenta:
borrarla dejaría sin autor los lotes que esa persona editó. El guardia revisa
`activo` en cada pedido, así que el acceso se corta en la petición siguiente.

### Tests

```bash
npm test
```

Los de integración levantan cada uno su propio Postgres en memoria, con las
mismas migraciones que corren en producción. No necesitan `.env` ni base previa.

### Regenerar la geometría

Si cambia el plano, hay que volver a vectorizarlo. Los polígonos se derivan de
la imagen buscando el verde de las parcelas.

```bash
npm run vectorizar -- --diagnostico   # mide los colores del plano
npm run vectorizar
```

Los umbrales están en [`scripts/vectorizar-plano/config.ts`](scripts/vectorizar-plano/config.ts),
calibrados para el plano de El Madrigal. Para otro proyecto hay que recalibrar
con `--diagnostico`.

Ojo: la imagen que se vectoriza tiene que ser la misma que se muestra
(`public/plano.webp`, 1657×1081). Si cambia de tamaño, los polígonos dejan de
calzar con el dibujo.

## Despliegue

Netlify compila con `npm run build`. El `postinstall` genera el cliente de
Prisma, así que no hay que hacer nada especial.

Las migraciones **no** corren en el build, a propósito: así un problema con la
base no rompe el deploy del sitio. Cuando haya una migración nueva:

```bash
npm run db:deploy
```

Variables a cargar en Netlify: `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET`.
Las `SEED_ADMIN_*` solo se usan al correr el seed a mano.
