const fs = require('node:fs');
const { generateSW } = require('workbox-build');
(async () => {
  const path = 'dist/index.html';
  const html = fs.readFileSync(path, 'utf8');
  fs.writeFileSync(path, html.replace('</head>', '<script defer src="/pwa.js"></script></head>'));
  const { count, size, warnings } = await generateSW({
    globDirectory: 'dist',
    globPatterns: ['**/*.{html,js,css,ttf,woff,woff2,png,ico,svg,webmanifest}'],
    globIgnores: ['sw.js', 'workbox-*.js'],
    swDest: 'dist/sw.js',
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api\//],
    cleanupOutdatedCaches: true,
    // Updates wait until all old tabs close: no mixing old UI and new assets.
    skipWaiting: false,
    clientsClaim: true,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  });
  if (warnings.length) throw new Error(warnings.join('\n'));
  console.log(`PWA ready: ${count} files (${Math.round(size / 1024)} KB) precached.`);
})().catch(error => { console.error(error); process.exit(1); });
