var CACHE_NAME = 'DL_CACHE-V1';
var urlsToCache = [
  //PRINCIPALES
  './',
  './manifest.json',
  './app.js',
  './sw.js',
  './index.html',
  //REFERENCIAS DE BIBLIOTECAS
  './referencias/popper/popper.min.js',
  './referencias/popper/popper.min.js.map',
  './referencias/vue/vue.js',
  './referencias/vue/vue.min.js',
  './referencias/vuex/vuex.js',
  './referencias/buefy/css/materialdesignicons.css',
  './referencias/buefy/css/materialdesignicons.css.map',
  './referencias/buefy/css/materialdesignicons.min.css',
  './referencias/buefy/css/materialdesignicons.min.css.map',
  './referencias/buefy/dist/buefy.min.css',
  './referencias/buefy/dist/materialdesignicons.min.css',
  './referencias/buefy/fonts/materialdesignicons-webfont.eot',
  './referencias/buefy/fonts/materialdesignicons-webfont.ttf',
  './referencias/buefy/fonts/materialdesignicons-webfont.woff',
  './referencias/buefy/fonts/materialdesignicons-webfont.woff2',
  './referencias/fontawesome-free/webfonts/fa-solid-900.woff2',    
  './referencias/fontawesome-free/webfonts/fa-solid-900.woff',    
  './referencias/fontawesome-free/webfonts/fa-solid-900.ttf',
    
  //LOGOS
  './archivos/logos/icon-72x72.png',
  './archivos/logos/icon-96x96.png',
  './archivos/logos/icon-128x128.png',
  './archivos/logos/icon-144x144.png',
  './archivos/logos/icon-152x152.png',
  './archivos/logos/icon-192x192.png',
  './archivos/logos/icon-384x384.png',
  './archivos/logos/icon-512x512.png',

  //ICONOS

   //COMPONENTES
  './componentes/principal.js',


  //FECHAS
  './referencias/lbdate/lbdate.umd.min.js'

 //EXCEL



  //LEAFLET y TURF



];

self.addEventListener('install', function(event) {
  console.log('Se ejecuto el evento install');  
  // Perform install steps
event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Se ejecuto el evento install');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Se activo una nueva versión del service worker');
  return self.clients.claim();
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
          return caches.match(event.request).catch(function(){
            //console.log(event.request);
            return(event.request);
          });
    }) 
    )
});
