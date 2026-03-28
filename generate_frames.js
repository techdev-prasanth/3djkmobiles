import fs from 'fs';
import { createCanvas } from 'canvas';
import path from 'path';

const dir = './public/sequence';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

for (let i = 1; i <= 100; i++) {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  
  // Create a gradient background that shifts with frames
  const hue = (i * 3.6) % 360;
  ctx.fillStyle = `hsl(${hue}, 40%, 10%)`;
  ctx.fillRect(0, 0, 1920, 1080);
  
  // Add some "abstract 3D design" elements (circles)
  ctx.strokeStyle = `rgba(255,255,255,0.1)`;
  ctx.lineWidth = 2;
  for(let j=0; j<10; j++) {
    ctx.beginPath();
    ctx.arc(960 + Math.sin(i/10 + j) * 400, 540 + Math.cos(i/10 + j) * 200, 100 + j*20, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Frame number text
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = 'bold 120px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JK MOBILES', 960, 500);
  ctx.font = '40px Inter, sans-serif';
  ctx.fillText(`CINEMATIC SEQUENCE FRAME ${i.toString().padStart(4, '0')}`, 960, 600);
  
  const buffer = canvas.toBuffer('image/png');
  const filename = `frame_${i.toString().padStart(4, '0')}.webp`;
  fs.writeFileSync(path.join(dir, filename), buffer);
  console.log(`Generated ${filename}`);
}
