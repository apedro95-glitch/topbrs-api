# Auto update da URL do Cloudflare Tunnel no Firestore

Este script lê a URL atual `https://...trycloudflare.com` dos logs do `cloudflared` na VPS e atualiza o documento `system/apiConfig` no Firestore.

## 1. Baixe um service account do Firebase
No console do Firebase/Google Cloud, gere uma chave de service account com acesso ao Firestore e salve o JSON na VPS, por exemplo em:

`/root/topbrs-api/service-account.json`

## 2. Instale a dependência na VPS

```bash
cd /root/topbrs-api
npm install firebase-admin
```

## 3. Copie o script para a VPS
Suba a pasta `tools` deste ZIP para a VPS ou copie os arquivos manualmente.

## 4. Configure o ambiente
Copie `tools/cloudflare_url_sync.env.example` para `.env.cloudflare-sync` e ajuste os caminhos.

## 5. Teste uma vez

```bash
cd /root/topbrs-api
export $(grep -v '^#' tools/cloudflare_url_sync.env.example | xargs)
node tools/cloudflare_url_sync.js --dry-run
```

Se aparecer a URL correta, rode sem `--dry-run`:

```bash
node tools/cloudflare_url_sync.js
```

## 6. Deixar automático com PM2

```bash
pm2 start tools/cloudflare_url_sync.js --name cloudflare-url-sync -- --watch
pm2 save
```

## Estrutura esperada no Firestore

Coleção: `system`
Documento: `apiConfig`

```json
{
  "clashApiBase": "https://sua-url.trycloudflare.com"
}
```
