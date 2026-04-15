#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import process from 'process';
import { execSync } from 'child_process';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.resolve('./tools/service-account.json');
const firestoreDocPath = process.env.FIRESTORE_DOC_PATH || 'system/apiConfig';
const [collectionName, docId] = firestoreDocPath.split('/');
const fieldName = process.env.FIRESTORE_API_FIELD || 'clashApiBase';
const sourceName = process.env.CLOUDFLARE_SOURCE || 'journalctl';
const dryRun = process.argv.includes('--dry-run');
const watchMode = process.argv.includes('--watch');
const intervalMs = Number(process.env.SYNC_INTERVAL_MS || 15000);

function loadServiceAccount(){
  if(!fs.existsSync(serviceAccountPath)){
    throw new Error(`Arquivo de service account não encontrado em: ${serviceAccountPath}`);
  }
  return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
}

function initFirebase(){
  if(!getApps().length){
    initializeApp({ credential: cert(loadServiceAccount()) });
  }
  return getFirestore();
}

function extractUrl(text=''){
  const matches = String(text).match(/https:\/\/[-a-zA-Z0-9.]*trycloudflare\.com/g);
  return matches?.length ? matches[matches.length - 1] : '';
}

function readCloudflaredUrl(){
  if(sourceName === 'file'){
    const filePath = process.env.CLOUDFLARED_LOG_PATH || '/tmp/cloudflared.log';
    return extractUrl(fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '');
  }
  const output = execSync('journalctl -u cloudflared -n 200 --no-pager', { encoding:'utf8' });
  return extractUrl(output);
}

async function updateDoc(){
  const db = initFirebase();
  const nextUrl = readCloudflaredUrl();
  if(!nextUrl) throw new Error('Nenhuma URL trycloudflare encontrada nos logs do cloudflared.');
  const ref = db.collection(collectionName).doc(docId);
  const snap = await ref.get();
  const current = snap.exists ? String(snap.get(fieldName) || '') : '';
  if(current === nextUrl){
    console.log(`Sem mudança: ${nextUrl}`);
    return;
  }
  if(dryRun){
    console.log(`[DRY RUN] Atualizaria ${firestoreDocPath}.${fieldName} para ${nextUrl}`);
    return;
  }
  await ref.set({
    [fieldName]: nextUrl,
    updatedAt: FieldValue.serverTimestamp(),
    source: 'cloudflare-tunnel-sync'
  }, { merge:true });
  console.log(`Atualizado ${firestoreDocPath}.${fieldName} => ${nextUrl}`);
}

async function main(){
  if(!collectionName || !docId){
    throw new Error(`FIRESTORE_DOC_PATH inválido: ${firestoreDocPath}`);
  }
  if(watchMode){
    console.log(`Monitorando cloudflared a cada ${intervalMs}ms...`);
    await updateDoc().catch(err => console.error(err.message));
    setInterval(()=>{ updateDoc().catch(err => console.error(err.message)); }, intervalMs);
    return;
  }
  await updateDoc();
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
