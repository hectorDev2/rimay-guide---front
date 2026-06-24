#!/usr/bin/env node
/**
 * Pipeline de optimización de modelos 3D para Rimay Guide PWA.
 * 
 * Flujo:
 * 1. Lee modelos .glb de src/public/models/source/
 * 2. Redimensiona texturas a 1024px (gltf-transform resize)
 * 3. Comprime geometría con gltfpack (-cc -si 0.5)
 * 4. Genera reporte de tamaños antes/después
 * 5. Output en src/public/ (listo para producción)
 * 
 * Requisitos (instalación global):
 *   npm i -g @gltf-transform/cli gltfpack
 * 
 * Uso:
 *   node scripts/optimize-models.mjs
 *   # O como prebuild:
 *   npm run optimize:models
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, statSync, renameSync, unlinkSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const SOURCE_DIR = join(PROJECT_ROOT, 'src', 'public', 'models', 'source');
const TEMP_DIR = join(PROJECT_ROOT, 'src', 'public', 'models', '.temp');
const OUTPUT_DIR = join(PROJECT_ROOT, 'src', 'public');

// ─── Config ───────────────────────────────────────────
const TEXTURE_SIZE = 1024;
const GLTFPACK_FLAGS = '-cc -si 0.5';

// ─── Helpers ──────────────────────────────────────────
function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function run(cmd, label) {
  console.log(`  ▶ ${label}...`);
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`    ✅ OK`);
  } catch (err) {
    console.error(`    ❌ Error: ${err.message}`);
    process.exit(1);
  }
}

function getSize(filePath) {
  return statSync(filePath).size;
}

// ─── Main ─────────────────────────────────────────────
async function main() {
  console.log('\n🔧 Rimay 3D Model Optimizer\n');

  // Check tools
  let hasTools = true;
  try { execSync('gltf-transform --version', { stdio: 'pipe' }); } catch {
    hasTools = false;
  }
  try { execSync('gltfpack -v', { stdio: 'pipe' }); } catch {
    hasTools = false;
  }
  if (!hasTools) {
    console.log('⚠️  gltf-transform/gltfpack no encontrados. Omitiendo optimización de modelos 3D.');
    console.log('   Instalá: npm i -g @gltf-transform/cli gltfpack (opcional, solo para desarrollo)');
    return;
  }

  // Check source directory
  if (!existsSync(SOURCE_DIR)) {
    console.log(`📁 Creando ${SOURCE_DIR} (poné tus .glb aquí)`);
    mkdirSync(SOURCE_DIR, { recursive: true });
    return;
  }

  const models = readdirSync(SOURCE_DIR).filter(f => extname(f).toLowerCase() === '.glb');
  if (models.length === 0) {
    console.log('📭 No hay modelos en src/public/models/source/');
    return;
  }

  console.log(`📦 ${models.length} modelo(s) encontrado(s)\n`);

  // Prepare temp dir
  mkdirSync(TEMP_DIR, { recursive: true });

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const modelName of models) {
    const sourcePath = join(SOURCE_DIR, modelName);
    const baseName = basename(modelName, '.glb');
    const tempResized = join(TEMP_DIR, `${baseName}_resized.glb`);
    const tempPacked = join(TEMP_DIR, `${baseName}_packed.glb`);
    const outputPath = join(OUTPUT_DIR, `${baseName}.glb`);

    const originalSize = getSize(sourcePath);
    totalOriginal += originalSize;

    console.log(`📐 ${baseName}.glb (${fmtBytes(originalSize)})`);

    // Step 1: Resize textures
    run(
      `gltf-transform resize "${sourcePath}" "${tempResized}" --width ${TEXTURE_SIZE} --height ${TEXTURE_SIZE}`,
      `Texturas → ${TEXTURE_SIZE}px`
    );

    // Step 2: Compress geometry
    run(
      `gltfpack -i "${tempResized}" -o "${tempPacked}" ${GLTFPACK_FLAGS}`,
      `Geometría → gltfpack ${GLTFPACK_FLAGS}`
    );

    // Step 3: Move to output
    renameSync(tempPacked, outputPath);
    
    const optimizedSize = getSize(outputPath);
    totalOptimized += optimizedSize;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(`  📊 ${fmtBytes(originalSize)} → ${fmtBytes(optimizedSize)} (🔽 ${reduction}%)\n`);

    // Cleanup temp
    if (existsSync(tempResized)) unlinkSync(tempResized);
  }

  // Summary
  const totalReduction = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);
  console.log('━'.repeat(50));
  console.log(`📊 TOTAL: ${fmtBytes(totalOriginal)} → ${fmtBytes(totalOptimized)} (🔽 ${totalReduction}%)`);
  console.log(`✅ Listo — modelos en src/public/`);
  console.log('━'.repeat(50));

  // Cleanup
  try { unlinkSync(TEMP_DIR); } catch { /* dir not empty, fine */ }
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
