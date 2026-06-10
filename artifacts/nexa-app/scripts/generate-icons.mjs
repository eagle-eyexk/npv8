import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, "..", "..", "..", "attached_assets", "3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png");
const ICONS_DIR = resolve(__dirname, "..", "public", "icons");
const PUBLIC_DIR = resolve(__dirname, "..", "public");

mkdirSync(ICONS_DIR, { recursive: true });

// All required icon sizes
const SIZES = [16, 20, 29, 32, 40, 48, 57, 58, 60, 72, 76, 80, 87, 96, 114, 120, 128, 144, 152, 167, 180, 192, 256, 512, 1024];

async function makeIcon(size) {
  const pad = Math.round(size * 0.13);
  const inner = size - pad * 2;
  const r = Math.round(size * 0.22); // border radius

  // Blue rounded-square background + white padding + logo
  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Build rounded rectangle mask as SVG
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="white"/></svg>`
  );

  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 37, g: 99, b: 235, alpha: 1 } },
  })
    .composite([
      { input: mask, blend: "dest-in" },
      { input: logo, top: pad, left: pad },
    ])
    .png()
    .toFile(resolve(ICONS_DIR, `icon-${size}.png`));

  process.stdout.write(`✓ icon-${size}.png  `);
}

// Flat icon (no rounded corners) for iOS App Store 1024 and Android
async function makeFlatIcon(size) {
  const pad = Math.round(size * 0.10);
  const inner = size - pad * 2;

  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 37, g: 99, b: 235, alpha: 1 } },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(resolve(ICONS_DIR, `icon-${size}-flat.png`));

  process.stdout.write(`✓ icon-${size}-flat.png  `);
}

console.log("🎨 Generating NEXA Pay icons...\n");

await Promise.all(SIZES.map(makeIcon));
await makeFlatIcon(1024); // iOS App Store requires no rounded corners

// Copy aliases
await sharp(resolve(ICONS_DIR, "icon-32.png")).toFile(resolve(PUBLIC_DIR, "favicon.png"));
await sharp(resolve(ICONS_DIR, "icon-180.png")).toFile(resolve(PUBLIC_DIR, "apple-touch-icon.png"));
await sharp(resolve(ICONS_DIR, "icon-512.png")).toFile(resolve(PUBLIC_DIR, "icon-512.png"));
await sharp(resolve(ICONS_DIR, "icon-192.png")).toFile(resolve(PUBLIC_DIR, "icon-192.png"));

// Generate splash screen background (2732x2732 covers all iPads)
const SPLASH_SIZE = 2732;
const logoSize = Math.round(SPLASH_SIZE * 0.18);
const logoOffset = Math.round((SPLASH_SIZE - logoSize) / 2);
const logo = await sharp(SOURCE)
  .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: { width: SPLASH_SIZE, height: SPLASH_SIZE, channels: 4, background: { r: 37, g: 99, b: 235, alpha: 1 } },
})
  .composite([{ input: logo, top: logoOffset, left: logoOffset }])
  .png()
  .toFile(resolve(PUBLIC_DIR, "splash.png"));

console.log("\n\n✅ All icons generated!");
console.log(`   📁 ${ICONS_DIR}`);
console.log(`   🍎 Apple Touch Icon: public/apple-touch-icon.png`);
console.log(`   🌐 PWA icons: public/icon-192.png, public/icon-512.png`);
console.log(`   💦 Splash screen: public/splash.png`);
