#!/usr/bin/env node
/**
 * OpenClaw Sidecar Builder
 * 
 * RECOMMENDED APPROACH (2026): Node.js 25+ Single Executable Application (SEA)
 * 
 * Node.js 25.5.0 introduced `--build-sea` which simplifies creating standalone
 * executables. Combined with esbuild for bundling ESM → CJS, this is now the
 * most reliable approach.
 * 
 * IMPORTANT: SEA only supports CommonJS, so we must bundle ESM to CJS first.
 * 
 * References:
 * - Node.js SEA: https://nodejs.org/api/single-executable-applications.html
 * - Node.js 25.5 blog: https://nodejs.org/en/blog/release/v25.5.0
 * - esbuild: https://esbuild.github.io/
 * 
 * ALTERNATIVE APPROACHES:
 * 1. npx (current) - Uses npx at runtime, requires Node.js installed
 * 2. @yao-pkg/pkg - Has ESM issues, use --no-bytecode
 * 3. boxednode - MongoDB's tool, compiles Node.js from source (slow but reliable)
 * 4. AppThreat caxa - Maintained fork with good compression
 * 
 * Run: pnpm build:sidecar
 */

import { exec } from 'node:child_process';
import { mkdir, rm, writeFile, chmod, access, constants } from 'node:fs/promises';
import { promisify } from 'node:util';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Tauri target triples
const TARGETS = [
  { tauri: 'aarch64-apple-darwin', os: 'darwin', arch: 'arm64', ext: '' },
  { tauri: 'x86_64-apple-darwin', os: 'darwin', arch: 'x64', ext: '' },
  { tauri: 'x86_64-unknown-linux-gnu', os: 'linux', arch: 'x64', ext: '' },
  { tauri: 'x86_64-pc-windows-msvc', os: 'win32', arch: 'x64', ext: '.exe' },
];

function getCurrentTarget() {
  const { platform, arch } = process;
  if (platform === 'darwin') {
    return arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
  } else if (platform === 'linux') {
    return 'x86_64-unknown-linux-gnu';
  } else if (platform === 'win32') {
    return 'x86_64-pc-windows-msvc';
  }
  return null;
}

async function checkNodeVersion() {
  const version = process.versions.node;
  const major = parseInt(version.split('.')[0], 10);
  return { version, major, supportsSEA: major >= 25 };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   OpenClaw Sidecar Builder                               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const nodeInfo = await checkNodeVersion();
  console.log(`Node.js version: ${nodeInfo.version}`);
  console.log(`SEA support (--build-sea): ${nodeInfo.supportsSEA ? '✓ Yes' : '✗ No (requires Node.js 25+)'}\n`);

  // Current approach info
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CURRENT IMPLEMENTATION: npx approach');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('The app uses `npx --yes openclaw gateway` at runtime.');
  console.log('This works automatically if Node.js is installed.\n');
  
  console.log('Benefits:');
  console.log('  • No build step required');
  console.log('  • Always uses latest openclaw version');
  console.log('  • Smaller app bundle\n');

  console.log('Trade-off:');
  console.log('  • Users need Node.js installed');
  console.log('  • First run downloads openclaw (~30 seconds)\n');

  // Clean up old binaries if they exist
  const binDir = join(ROOT, 'src-tauri', 'binaries');
  if (existsSync(binDir)) {
    console.log('Cleaning up old binaries...');
    await rm(binDir, { recursive: true, force: true });
    console.log('  ✓ Removed src-tauri/binaries/\n');
  }

  // Show alternative approaches
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ALTERNATIVE: Build standalone binaries (2026 methods)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (nodeInfo.supportsSEA) {
    console.log('✓ Node.js 25+ SEA method available!');
    console.log('  To build standalone executables:\n');
    console.log('  1. Bundle with esbuild (ESM → CJS):');
    console.log('     npx esbuild openclaw/dist/entry.js --bundle --platform=node --format=cjs --outfile=bundle.cjs\n');
    console.log('  2. Create sea-config.json:');
    console.log('     { "main": "bundle.cjs", "output": "openclaw" }\n');
    console.log('  3. Build SEA:');
    console.log('     node --build-sea sea-config.json\n');
  } else {
    console.log('✗ Node.js 25+ required for built-in SEA support');
    console.log('  Current: Node.js ' + nodeInfo.version);
    console.log('  Install: https://nodejs.org/\n');
  }

  console.log('Other options:');
  console.log('  • @yao-pkg/pkg: npx @yao-pkg/pkg bundle.cjs --no-bytecode');
  console.log('  • boxednode: npx boxednode -s bundle.js -t openclaw');
  console.log('  • caxa (AppThreat fork): Better compression\n');

  console.log('Note: All bundling methods have issues with openclaw\'s:');
  console.log('  • Dynamic imports');
  console.log('  • Optional native dependencies (playwright, canvas, etc.)');
  console.log('  • ESM + import.meta.url usage\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('RECOMMENDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('For developer tools like simplestclaw, the npx approach is ideal:');
  console.log('  • Developers already have Node.js');
  console.log('  • No complex build pipeline');
  console.log('  • Auto-updates to latest openclaw\n');

  console.log('For non-developer users, consider:');
  console.log('  • Shipping Node.js runtime + bundled script');
  console.log('  • Using Electron instead of Tauri\n');

  console.log('To build the app:');
  console.log('  pnpm tauri dev   # Development');
  console.log('  pnpm tauri build # Production\n');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
