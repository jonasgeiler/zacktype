if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise((async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()}))),r.then((()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]}))},r=(r,i)=>{Promise.all(r.map(e)).then((e=>i(1===e.length?e[0]:e)))},i={require:Promise.resolve(r)};self.define=(r,s,c)=>{i[r]||(i[r]=Promise.resolve().then((()=>{let i={};const n={uri:location.origin+r.slice(1)};return Promise.all(s.map((r=>{switch(r){case"exports":return i;case"module":return n;default:return e(r)}}))).then((e=>{const r=c(...e);return i.default||(i.default=r),i}))})))}}define("./sw.js",["./workbox-8ce990e4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index.06cd2fb7.css",revision:"b2ba4c565c026e556cc1cfc2f71dc8a7"},{url:"assets/index.0d4cadd7.js",revision:"9d152cd234a77b2846a550ca51fdd748"},{url:"assets/vendor.45293bec.js",revision:"23983a744fbdbefc1fb3c9eca8146565"},{url:"index.html",revision:"666559a2d55650bc9e1558c5e448039e"},{url:"favicon.svg",revision:"7b8406326e91bcd946851f2af98c35c3"},{url:"favicon.ico",revision:"e21d875233f3b3266930991d45ea44fc"},{url:"favicon-16x16.png",revision:"2b210b37372bd0de5da31ca9b6b068fe"},{url:"favicon-32x32.png",revision:"5aa9a0abe00fb9c5d3354451ea79bea7"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"apple-touch-icon.png",revision:"8dee090cfb31572b1d29d28b5e8b30fa"},{url:"android-chrome-192x192.png",revision:"c70db211e3f62afacb3b0846368c9b46"},{url:"android-chrome-512x512.png",revision:"b3a33f620fb9673aa53a27462d06149a"},{url:"manifest.webmanifest",revision:"4d5dd3899eac2fde8b2372a94c5d2439"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
