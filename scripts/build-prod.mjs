import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🚀 [ETAPA 1/3] Compilando os Microfrontends (Remotes)');
console.log('====================================================\n');

console.log('📦 Compilando mfe-cadastro...');
execSync('npm run build --prefix mfe-cadastro', { cwd: rootDir, stdio: 'inherit' });

console.log('\n📦 Compilando mfe-leilao...');
execSync('npm run build --prefix mfe-leilao', { cwd: rootDir, stdio: 'inherit' });

console.log('\n====================================================');
console.log('📋 [ETAPA 2/3] Integrando MFE Assets em shell/public');
console.log('====================================================\n');

function copyFederationAssets(mfeName) {
  const srcDir = path.join(rootDir, mfeName, 'dist', 'assets');
  const destDir = path.join(rootDir, 'shell', 'public', mfeName, 'assets');

  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir);
  let count = 0;

  for (const file of files) {
    // Ignora singletons compartilhados (React, MUI, Emotion), pois o Shell já os fornece em runtime
    if (file.startsWith('__federation_shared_')) {
      continue;
    }
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    count++;
  }

  console.log(`✓ [${mfeName}] ${count} arquivos de federação copiados para shell/public/${mfeName}/assets/`);
}

copyFederationAssets('mfe-cadastro');
copyFederationAssets('mfe-leilao');

console.log('\n====================================================');
console.log('🏛️  [ETAPA 3/3] Compilando o Shell Host (Produção)');
console.log('====================================================\n');

execSync('npm run build --prefix shell', { cwd: rootDir, stdio: 'inherit' });

console.log('\n====================================================');
console.log('🎉 COMPILAÇÃO MFE CONCLUÍDA COM SUCESSO!');
console.log('📁 Artefatos finais prontos em: shell/dist');
console.log('====================================================\n');
