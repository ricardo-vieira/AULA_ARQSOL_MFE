import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'shell', 'dist');

let connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString && fs.existsSync(path.join(rootDir, '.env'))) {
  const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8');
  const match = envContent.match(/AZURE_STORAGE_CONNECTION_STRING=(.*)/);
  if (match) connectionString = match[1].trim();
}

if (!connectionString) {
  console.error('❌ Erro: AZURE_STORAGE_CONNECTION_STRING não configurada em process.env nem no arquivo .env.');
  process.exit(1);
}

const containerName = "$web";

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

async function deploy() {
  console.log('====================================================');
  console.log('☁️  DEPLOY AUTOMATIZADO — AZURE STATIC WEBSITE');
  console.log('====================================================\n');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Erro: A pasta shell/dist não existe.');
    console.error('👉 Execute "npm run build:all" antes do deploy.');
    process.exit(1);
  }

  console.log('🔌 Conectando ao Azure Storage Account (leilaoveiculos)...');
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const exists = await containerClient.exists();
  if (!exists) {
    console.log('📦 Criando contêiner $web...');
    await containerClient.create({ access: 'blob' });
  }

  const allFiles = await getAllFiles(distDir);
  console.log(`📤 Enviando ${allFiles.length} arquivos para o contêiner $web...\n`);

  let count = 0;
  for (const filePath of allFiles) {
    const relativePath = path.relative(distDir, filePath).replace(/\\/g, '/');
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const blockBlobClient = containerClient.getBlockBlobClient(relativePath);
    const content = fs.readFileSync(filePath);

    await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      },
    });

    count++;
    console.log(`[${count}/${allFiles.length}] ✓ ${relativePath}`);
  }

  console.log('\n====================================================');
  console.log('🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
  console.log('🌐 Acesse o leilão em:');
  console.log('👉 https://leilaoveiculos.z15.web.core.windows.net/');
  console.log('====================================================\n');
}

deploy().catch((err) => {
  console.error('\n❌ Falha no deploy:', err.message);
  process.exit(1);
});
