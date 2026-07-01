/**
 * DOPE WOD - Script de Migración: Supabase CSV → Firebase Firestore
 * 
 * INSTRUCCIONES DE USO:
 * 1. Completar la variable firebaseConfig abajo con tus credenciales de Firebase
 * 2. Ejecutar: node scripts/migrate-to-firebase.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// PASO 1: Completar con la ruta a tu archivo serviceAccountKey.json de Firebase
// Descargarlo desde: Firebase Console > Project Settings > Service Accounts > Generate new private key
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ ERROR: No se encontró el archivo serviceAccountKey.json');
  console.error('   Descargarlo desde: Firebase Console > Project Settings > Service Accounts > Generate new private key');
  console.error(`   Guardarlo en: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

// Inicializar Firebase Admin
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();
const TABLES_DIR = path.join(__dirname, '..', 'tables');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function readCsv(filename) {
  const filePath = path.join(TABLES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`   ⚠️  Archivo no encontrado: ${filename} (se omite)`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true });
}

function cleanRecord(record) {
  // Convertir strings vacíos a null, y parsear JSON donde corresponda
  const cleaned = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === '' || value === undefined) {
      cleaned[key] = null;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

async function batchImport(collectionName, records, getDocId) {
  if (records.length === 0) {
    console.log(`   ℹ️  Sin registros para importar en "${collectionName}"`);
    return;
  }

  // Firestore permite máximo 500 operaciones por batch
  const chunkSize = 400;
  let totalImported = 0;

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const batch = db.batch();

    for (const record of chunk) {
      const cleaned = cleanRecord(record);
      const docId = getDocId(cleaned);
      const ref = db.collection(collectionName).doc(docId);
      batch.set(ref, cleaned);
    }

    await batch.commit();
    totalImported += chunk.length;
    console.log(`   ✅ ${totalImported}/${records.length} documentos importados en "${collectionName}"`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MIGRACIÓN DE COLECCIONES
// ─────────────────────────────────────────────────────────────────────────────

async function migrateExercises() {
  console.log('\n📦 Migrando exercises...');
  const records = readCsv('exercises_rows.csv');
  await batchImport('exercises', records, (r) => r.id);
}

async function migrateProfiles() {
  console.log('\n👤 Migrando profiles...');
  const records = readCsv('profiles_rows.csv');
  await batchImport('profiles', records, (r) => r.id);
  console.log(`   ⚠️  NOTA: Los usuarios de Auth (email/contraseña) deben registrarse nuevamente en Firebase.`);
  console.log(`   ⚠️  Los IDs de perfil serán los mismos que los de Supabase.`);
}

async function migratePrograms() {
  console.log('\n📋 Migrando programs...');
  const records = readCsv('programs_rows.csv');
  await batchImport('programs', records, (r) => r.id);
}

async function migrateEquipment() {
  console.log('\n🏋️  Migrando equipment...');
  const records = readCsv('equipment_rows.csv');
  await batchImport('equipment', records, (r) => r.id || r.name);
}

async function migrateMovements() {
  console.log('\n🏃 Migrando movements...');
  const records = readCsv('movements_rows.csv');
  await batchImport('movements', records, (r) => r.id || r.name);
}

async function migrateSystemLogs() {
  console.log('\n📝 Migrando system_logs...');
  const records = readCsv('system_logs_rows.csv');
  await batchImport('system_logs', records, (r) => r.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// CREACIÓN DE COLECCIONES VACÍAS CON DOCUMENTOS PLACEHOLDER
// (Firebase no crea colecciones vacías - se crean al insertar el primer documento)
// ─────────────────────────────────────────────────────────────────────────────

async function createEmptyCollections() {
  console.log('\n🗂️  Creando colecciones vacías con documento inicial...');

  const emptyCollections = [
    {
      name: 'weekly_plans',
      schema: {
        _placeholder: true,
        group_id: '',
        day_code: '',
        week_number: 0,
        title: '',
        exercises: [],
        updated_at: new Date().toISOString(),
        program_id: null,
      }
    },
    {
      name: 'personal_records',
      schema: {
        _placeholder: true,
        user_id: null,
        exercise_name: '',
        weight: 0,
        unit: 'kg',
        recorded_at: new Date().toISOString(),
        notes: null,
      }
    },
    {
      name: 'wod_feedback',
      schema: {
        _placeholder: true,
        athlete_id: null,
        plan_id: null,
        group_id: null,
        day_code: null,
        comment: null,
        perceived_exertion: null,
        created_at: new Date().toISOString(),
      }
    },
    {
      name: 'workout_sessions',
      schema: {
        _placeholder: true,
        user_id: null,
        title: '',
        date: new Date().toISOString(),
        parts: null,
        is_completed: false,
      }
    }
  ];

  for (const col of emptyCollections) {
    await db.collection(col.name).doc('_schema_placeholder').set(col.schema);
    console.log(`   ✅ Colección "${col.name}" creada con documento placeholder`);
  }

  console.log('\n   ℹ️  Los documentos placeholder (_schema_placeholder) pueden eliminarse manualmente');
  console.log('       desde la consola de Firebase una vez que haya datos reales.');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando migración de Supabase → Firebase Firestore...');
  console.log(`📁 Leyendo CSVs desde: ${TABLES_DIR}`);

  try {
    await migrateExercises();
    await migrateProfiles();
    await migratePrograms();
    await migrateEquipment();
    await migrateMovements();
    await migrateSystemLogs();
    await createEmptyCollections();

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Verificar los datos en la consola de Firebase.');
    console.log('   2. Eliminar los documentos placeholder "_schema_placeholder" de Firestore.');
    console.log('   3. Re-registrar los usuarios en la app (ya que Firebase Auth es nuevo).');
    console.log('   4. Actualizar el código de la app para usar Firebase SDK.');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  }
}

main();
