/**
 * Optimiza las imágenes de src/assets para web.
 *
 * Las fotos de drone vienen a 4096px o más y pesan varios MB cada una. En la
 * galería se ven como mucho a 2048px, así que todo lo que sobra es peso puro.
 *
 * Reescribe los .webp en el lugar (mismo nombre, sin tocar los imports) y sólo
 * si el resultado pesa menos. Los .png y .jpg los reporta pero no los toca,
 * porque convertirlos cambia la extensión y hay que editar los imports a mano.
 *
 * Requiere cwebp y sips (macOS):  brew install webp
 * Uso:  npm run optimize-images  [--dry]
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '../src/assets');

// Lado largo máximo. La galería nunca muestra más que esto, ni en pantallas retina.
const MAX_EDGE = 2048;
const QUALITY = 82;

// Por debajo de esto no vale la pena reencodear: la ganancia es marginal y cada
// pasada de webp->webp pierde un poco de calidad. Hace que el script sea
// seguro de correr varias veces.
const MIN_BYTES = 300 * 1024;

const dryRun = process.argv.includes('--dry');

function listarImagenes(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const completa = path.join(dir, entrada.name);
    if (entrada.isDirectory()) return listarImagenes(completa);
    return /\.(webp|png|jpe?g)$/i.test(entrada.name) ? [completa] : [];
  });
}

function medir(archivo) {
  const salida = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', archivo], {
    encoding: 'utf8',
  });
  const ancho = Number(salida.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const alto = Number(salida.match(/pixelHeight:\s*(\d+)/)?.[1]);
  return Number.isFinite(ancho) && Number.isFinite(alto) ? { ancho, alto } : null;
}

// cwebp toma un solo eje y calcula el otro. Hay que elegir el lado largo, si no
// una foto vertical de 3024x4032 termina en 2048x2730, más grande de lo pedido.
function argsDeResize({ ancho, alto }) {
  if (Math.max(ancho, alto) <= MAX_EDGE) return [];
  return ancho >= alto ? ['-resize', String(MAX_EDGE), '0'] : ['-resize', '0', String(MAX_EDGE)];
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

const imagenes = listarImagenes(ASSETS_DIR).sort();
const paraConvertir = [];
let pesoAntes = 0;
let pesoDespues = 0;
let optimizadas = 0;

for (const archivo of imagenes) {
  const relativa = path.relative(ASSETS_DIR, archivo);
  const bytesAntes = fs.statSync(archivo).size;

  if (!/\.webp$/i.test(archivo)) {
    if (bytesAntes > MIN_BYTES) paraConvertir.push({ relativa, bytesAntes });
    continue;
  }

  pesoAntes += bytesAntes;

  const dims = medir(archivo);
  const resize = dims ? argsDeResize(dims) : [];

  if (bytesAntes < MIN_BYTES && resize.length === 0) {
    pesoDespues += bytesAntes;
    continue;
  }

  const temporal = archivo + '.tmp.webp';
  execFileSync('cwebp', ['-quiet', '-q', String(QUALITY), ...resize, archivo, '-o', temporal]);
  const bytesDespues = fs.statSync(temporal).size;

  // Si no achica, nos quedamos con el original: reencodear por nada sólo degrada.
  if (bytesDespues >= bytesAntes) {
    fs.unlinkSync(temporal);
    pesoDespues += bytesAntes;
    continue;
  }

  if (dryRun) fs.unlinkSync(temporal);
  else fs.renameSync(temporal, archivo);

  pesoDespues += bytesDespues;
  optimizadas++;
  const ahorro = Math.round((1 - bytesDespues / bytesAntes) * 100);
  console.log(`  ${relativa}\n    ${mb(bytesAntes)} -> ${mb(bytesDespues)}  (-${ahorro}%)`);
}

console.log(`\n${optimizadas} de ${imagenes.filter((f) => /\.webp$/i.test(f)).length} .webp optimizadas`);
console.log(`Total webp: ${mb(pesoAntes)} -> ${mb(pesoDespues)}  (-${Math.round((1 - pesoDespues / pesoAntes) * 100)}%)`);
if (dryRun) console.log('\n(--dry: no se escribió nada)');

if (paraConvertir.length) {
  console.log('\nPNG/JPG pesados que el script no toca (convertirlos cambia el import):');
  for (const { relativa, bytesAntes } of paraConvertir) {
    console.log(`  ${relativa}  ${mb(bytesAntes)}`);
  }
}
