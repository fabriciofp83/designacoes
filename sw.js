/* Guarda o app no aparelho para ele abrir sem internet.
   Quando você subir uma versão nova no GitHub, mude o número do CACHE
   (de v1 para v2, v3...) para o celular buscar a versão nova. */
const CACHE = 'designacoes-v4';

const ESSENCIAIS = [
  './',
  './index.html',
  './manifest.json',
  './icone-192.png',
  './icone-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      /* addAll falha inteiro se um item falhar, então guardamos um a um */
      .then(c => Promise.all(ESSENCIAIS.map(u =>
        c.add(u).catch(() => console.warn('não guardei:', u)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    /* tenta a rede primeiro para pegar atualizações; sem rede, usa o que está guardado */
    fetch(e.request)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
