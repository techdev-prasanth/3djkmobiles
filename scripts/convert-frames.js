const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, '..', 'public', 'frames');

async function convert() {
  if (!fs.existsSync(inputDir)) {
    console.error('Input directory not found:', inputDir);
    process.exit(1);
  }

  const files = fs.readdirSync(inputDir).filter(f => /ezgif-frame-\d{3,4}\.(png|jpg)$/i.test(f));
  files.sort((a, b) => {
    const na = parseInt(a.match(/(\d{3,4})/)[0], 10);
    const nb = parseInt(b.match(/(\d{3,4})/)[0], 10);
    return na - nb;
  });

  console.log(`Found ${files.length} frames. Converting to WebP (1920w) and @2x WebP (3840w)...`);

  for (const file of files) {
    try {
      const inputPath = path.join(inputDir, file);
      const base = file.replace(/\.(png|jpg)$/i, '');
      const outWebp = path.join(inputDir, `${base}.webp`);
      const outWebp2x = path.join(inputDir, `${base}@2x.webp`);

      // Standard 1920 width (will preserve aspect ratio)
      await sharp(inputPath)
        .resize({ width: 1920 })
        .webp({ quality: 90, effort: 6 })
        .toFile(outWebp);

      // Retina / high-res 3840 width
      await sharp(inputPath)
        .resize({ width: 3840 })
        .webp({ quality: 85, effort: 6 })
        .toFile(outWebp2x);

      console.log(`Converted ${file} -> ${path.basename(outWebp)}, ${path.basename(outWebp2x)}`);
    } catch (err) {
      console.error('Failed converting', file, err.message);
    }
  }

  console.log('Conversion complete.');
}

convert().catch(err => { console.error(err); process.exit(1); });
