import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

const createConfig = (browser) => [
  // Content script bundle
  {
    input: 'src/content.js',
    output: {
      file: `dist/${browser}/content.js`,
      format: 'iife',
      sourcemap: false
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  // Background script bundle
  {
    input: 'src/background.js',
    output: {
      file: `dist/${browser}/background.js`,
      format: 'iife',
      sourcemap: false
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  // Popup script bundle
  {
    input: 'src/popup.js',
    output: {
      file: `dist/${browser}/popup.js`,
      format: 'iife',
      sourcemap: false
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      // Only copy assets once, with the popup bundle
      copy({
        targets: [
          // Copy static assets
          { src: 'src/popup.html', dest: `dist/${browser}` },
          { src: 'src/popup.css', dest: `dist/${browser}` },
          { src: 'src/styles.css', dest: `dist/${browser}` },
          { src: 'src/icons/**/*', dest: `dist/${browser}/icons` },
          
          // Copy webextension polyfill
          { src: 'src/lib/webextension-polyfill.js', dest: `dist/${browser}/lib` },
          
          // Copy browser-specific manifest
          { src: `manifests/${browser}.json`, dest: `dist/${browser}`, rename: 'manifest.json' }
        ]
      })
    ]
  }
];

export default [
  ...createConfig('chrome'),
  ...createConfig('firefox')
];