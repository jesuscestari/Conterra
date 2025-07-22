const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const videoPath = path.join(__dirname, '../src/assets/video.mp4');
const outputDir = path.join(__dirname, '../src/assets/videos');

// Crear directorio de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Configuraciones de compresión
const compressionConfigs = [
  {
    name: 'video-1080p.mp4',
    crf: 28,
    preset: 'medium',
    scale: '1920:1080',
    description: 'Calidad alta - 1080p'
  },
  {
    name: 'video-720p.mp4',
    crf: 30,
    preset: 'fast',
    scale: '1280:720',
    description: 'Calidad media - 720p'
  },
  {
    name: 'video-480p.mp4',
    crf: 35,
    preset: 'fast',
    scale: '854:480',
    description: 'Calidad baja - 480p'
  }
];

// Función para ejecutar FFmpeg
function runFFmpeg(config) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outputDir, config.name);
    const command = `ffmpeg -i "${videoPath}" -c:v libx264 -crf ${config.crf} -preset ${config.preset} -vf scale=${config.scale} -c:a aac -b:a 128k -movflags +faststart "${outputPath}"`;
    
    console.log(`\n🔄 Comprimiendo: ${config.description}`);
    console.log(`📁 Salida: ${outputPath}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error comprimiendo ${config.name}:`, error);
        reject(error);
        return;
      }
      
      // Obtener tamaño del archivo comprimido
      const stats = fs.statSync(outputPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`✅ ${config.name} comprimido exitosamente`);
      console.log(`📊 Tamaño: ${fileSizeInMB} MB`);
      
      resolve({ config, size: fileSizeInMB });
    });
  });
}

// Función principal
async function optimizeVideo() {
  console.log('🎬 Iniciando optimización de video...');
  console.log(`📁 Video original: ${videoPath}`);
  
  // Verificar que el video original existe
  if (!fs.existsSync(videoPath)) {
    console.error('❌ No se encontró el video original en src/assets/video.mp4');
    process.exit(1);
  }
  
  // Obtener tamaño del video original
  const originalStats = fs.statSync(videoPath);
  const originalSizeInMB = (originalStats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 Tamaño original: ${originalSizeInMB} MB`);
  
  try {
    const results = [];
    
    // Comprimir con todas las configuraciones
    for (const config of compressionConfigs) {
      try {
        const result = await runFFmpeg(config);
        results.push(result);
      } catch (error) {
        console.error(`❌ Falló la compresión de ${config.name}`);
      }
    }
    
    // Mostrar resumen
    console.log('\n📋 Resumen de optimización:');
    console.log('='.repeat(50));
    console.log(`Original: ${originalSizeInMB} MB`);
    
    results.forEach(result => {
      const compressionRatio = ((originalSizeInMB - result.size) / originalSizeInMB * 100).toFixed(1);
      console.log(`${result.config.name}: ${result.size} MB (${compressionRatio}% reducción)`);
    });
    
    console.log('\n✅ Optimización completada!');
    console.log(`📁 Archivos guardados en: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  optimizeVideo();
}

module.exports = { optimizeVideo }; 