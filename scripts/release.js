import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distElectronDir = path.join(rootDir, 'dist-electron');
const backupDir = path.join(rootDir, 'Versiones anteriores');
const lynxSyncDir = 'C:\\Users\\astud\\OneDrive\\LYNX\\10- DOPE WOD';

console.log('🚀 Iniciando proceso automático de Release y Sincronización...\n');

// 1. Respaldo de versión anterior
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

if (fs.existsSync(distElectronDir)) {
  console.log('📦 Buscando instalador anterior para respaldar...');
  const files = fs.readdirSync(distElectronDir);
  const exeFiles = files.filter(f => f.endsWith('.exe') && !f.includes('uninstaller'));
  
  if (exeFiles.length > 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    for (const exe of exeFiles) {
      const oldPath = path.join(distElectronDir, exe);
      const newFileName = exe.replace('.exe', `_${timestamp}.exe`);
      const newPath = path.join(backupDir, newFileName);
      fs.renameSync(oldPath, newPath);
      console.log(`✅ Archivo respaldado en: Versiones anteriores/${newFileName}`);
    }
  } else {
    console.log('ℹ️ No se encontró ningún instalador previo para respaldar.');
  }
}

// 2. Construcción y Publicación en GitHub
console.log('\n🔨 Construyendo la aplicación y publicando en GitHub...');
try {
  // Asegurar que usemos electron-builder -p always
  execSync('npm run build && npx electron-builder -p always', { 
    cwd: rootDir, 
    stdio: 'inherit' 
  });
  console.log('✅ Publicación exitosa.');
} catch (error) {
  console.error('❌ Error durante la construcción o publicación.');
  process.exit(1);
}

// 3. Sincronización con LYNX (OneDrive)
console.log('\n🔄 Sincronizando código fuente con OneDrive LYNX...');
try {
  if (!fs.existsSync(lynxSyncDir)) {
    fs.mkdirSync(lynxSyncDir, { recursive: true });
  }

  // Usamos robocopy. /MIR hace espejo (borra lo que no está en origen), 
  // /XD excluye directorios para no copiar dependencias masivas ni compilados.
  // Robocopy devuelve códigos > 7 como error real.
  const robocopyCmd = `robocopy "${rootDir}" "${lynxSyncDir}" /MIR /XD node_modules .git dist dist-electron "Versiones anteriores"`;
  
  try {
    execSync(robocopyCmd, { cwd: rootDir, stdio: 'ignore' });
  } catch (err) {
    // robocopy exit code 1 to 7 are considered success statuses (files copied, no errors)
    if (err.status && err.status > 7) {
      throw err;
    }
  }
  
  console.log('✅ Sincronización completada hacia LYNX.');
} catch (error) {
  console.error('⚠️ Advertencia: Ocurrió un problema durante la sincronización.');
  console.error(error.message);
}

console.log('\n🎉 ¡Proceso finalizado con éxito!');
