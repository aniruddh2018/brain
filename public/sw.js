if(!self.define){let e,s={};const t=(t,a)=>(t=new URL(t+".js",a).href,s[t]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=t,e.onload=s,document.head.appendChild(e)}else e=t,importScripts(t),s()})).then((()=>{let e=s[t];if(!e)throw new Error(`Module ${t} didn’t register its module`);return e})));self.define=(a,n)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let c={};const r=e=>t(e,i),u={module:{uri:i},exports:c,require:r};s[i]=Promise.all(a.map((e=>u[e]||r(e)))).then((e=>(n(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/404.html",revision:"901b0d5326d3158f46e5fd32b1578fb0"},{url:"/_next/app-build-manifest.json",revision:"f55574d89dc5a2117c0223be146b7e3e"},{url:"/_next/static/Py4uPVthLCELLU1HNPOah/_buildManifest.js",revision:"56fdc3c206b3026423d8bb646f683d13"},{url:"/_next/static/Py4uPVthLCELLU1HNPOah/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/172-94770ee8a396dc35.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/220-d2661c4a601d8a1e.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/222-3305dc6b59cb0a20.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/294.e72d2554be082393.js",revision:"e72d2554be082393"},{url:"/_next/static/chunks/302-b689014900600190.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/318.b75a4aeb5976b228.js",revision:"b75a4aeb5976b228"},{url:"/_next/static/chunks/341.34f2b76c309db662.js",revision:"34f2b76c309db662"},{url:"/_next/static/chunks/450.8ccb8c32a675f7e4.js",revision:"8ccb8c32a675f7e4"},{url:"/_next/static/chunks/468-6ec88876834d9413.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/472.a3826d29d6854395.js",revision:"a3826d29d6854395"},{url:"/_next/static/chunks/4bd1b696-8da2bacc04e87cd3.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/528-d5718360ed01c79c.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/551-af6dfbb9f084a0da.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/566-f9341845736d2321.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/650.662c35bc371d174e.js",revision:"662c35bc371d174e"},{url:"/_next/static/chunks/678.adf5e971eb0f0d75.js",revision:"adf5e971eb0f0d75"},{url:"/_next/static/chunks/684-79a12657b6f14475.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/749-535bea764fd29b4f.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/754-fb0317380ae452a1.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/782.9b8d62e9f60e4b3a.js",revision:"9b8d62e9f60e4b3a"},{url:"/_next/static/chunks/836.3c1e16de99a8a2c5.js",revision:"3c1e16de99a8a2c5"},{url:"/_next/static/chunks/872.4391bd6925db945e.js",revision:"4391bd6925db945e"},{url:"/_next/static/chunks/967-6e78ba0fe71098a4.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/404/page-5a518d3ce4234da3.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/_not-found/page-20c2f26227bb37ab.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/auth/callback/route-4c8c044c16b5dafd.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/auth/success/page-4ee9fdd99204b49f.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/games/page-4bf4dbae0f5869e4.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/layout-aeb4a16f60fa761d.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/my-profile/page-0f2532720e63917e.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/my-reports/layout-15cbfd90b6846412.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/my-reports/page-28124292d3df6144.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/not-found-d7ad3680e1ba93e9.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/page-1bd71b9a36e3793c.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/app/results/page-f95a970acfb618a6.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/ca377847-c3f6924548e140b1.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/framework-be704551803917a8.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/main-af06d5eee4c9766f.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/main-app-2f91e90cb216200e.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/pages/_app-b7bdcc0fd7b38f6a.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/pages/_error-6b16cd5908018963.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-15a1ccda028bc82b.js",revision:"Py4uPVthLCELLU1HNPOah"},{url:"/_next/static/css/41b1ab189e190f70.css",revision:"41b1ab189e190f70"},{url:"/_redirects",revision:"b5adc6982075790e4fc10d0f37bfd4e8"},{url:"/brain-illustration.png",revision:"bc7aff30c56ce4d6819682e556ac7649"},{url:"/icons/apple-touch-icon.png",revision:"35707bd9960ba5281c72af927b79291f"},{url:"/icons/favicon-16x16.png",revision:"e340c42456199c7415b56cf012c7d78d"},{url:"/icons/favicon-32x32.png",revision:"93dd90d20145b0c37346bb45662b75a1"},{url:"/icons/icon-144x144.png",revision:"bfdad41a2d15e5e8f617340d69160ca9"},{url:"/manifest.json",revision:"3b98a1f84689384e007cfd18b46152d2"},{url:"/placeholder-logo.png",revision:"b7d4c7dd55cf683c956391f9c2ce3f5b"},{url:"/placeholder-logo.svg",revision:"1e16dc7df824652c5906a2ab44aef78c"},{url:"/placeholder-user.jpg",revision:"82c9573f1276f9683ba7d92d8a8c6edd"},{url:"/placeholder.jpg",revision:"887632fd67dd19a0d58abde79d8e2640"},{url:"/placeholder.svg",revision:"35707bd9960ba5281c72af927b79291f"},{url:"/service-worker.js",revision:"63fedb38640610312edce198199c6121"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:t,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
