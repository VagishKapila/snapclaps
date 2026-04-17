// server/utils/deal-card-generator.js
// Generates 1080×1920 PNG slides for social media (TikTok/Instagram)
// Uses node-canvas for rendering

let canvas;
try {
  canvas = require('canvas');
} catch {
  canvas = null;
  console.warn('node-canvas not available — deal-card-generator will return null');
}

const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../../dist/social');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a 1080×1920 deal card PNG
 * @param {Object} opts
 * @param {string} opts.destination
 * @param {string} opts.emoji
 * @param {string} opts.programName
 * @param {number} opts.milesCost
 * @param {string} opts.cabin
 * @param {number} opts.taxesUsd
 * @param {string} opts.filename
 * @returns {string|null} filepath or null if canvas not available
 */
async function generateDealCard(opts) {
  if (!canvas) return null;
  ensureOutputDir();

  const { createCanvas } = canvas;
  const W = 1080, H = 1920;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Background gradient — navy to dark blue
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0f0d2e');
  grad.addColorStop(1, '#1a2a4a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Teal accent bar at top
  ctx.fillStyle = '#00C9A7';
  ctx.fillRect(0, 0, W, 12);

  // Brand name
  ctx.fillStyle = '#00C9A7';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SNAPCLAPS', W / 2, 100);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '32px sans-serif';
  ctx.fillText('OopsLuxEscapes', W / 2, 150);

  // Destination emoji (large)
  ctx.font = '240px sans-serif';
  ctx.fillText(opts.emoji || '✈️', W / 2, 520);

  // Destination name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 88px sans-serif';
  ctx.fillText((opts.destination || '').toUpperCase(), W / 2, 660);

  // Miles cost — big hero number
  ctx.fillStyle = '#00C9A7';
  ctx.font = 'bold 160px sans-serif';
  ctx.fillText(`${(opts.milesCost || 0).toLocaleString()}`, W / 2, 860);

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '48px sans-serif';
  ctx.fillText('MILES', W / 2, 930);

  // Cabin + taxes
  ctx.fillStyle = '#ffffff';
  ctx.font = '52px sans-serif';
  ctx.fillText(`${opts.cabin || 'Business'} Class · +$${opts.taxesUsd || 0} taxes`, W / 2, 1040);

  // Program name
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '42px sans-serif';
  ctx.fillText(`via ${opts.programName || ''}`, W / 2, 1120);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 1200);
  ctx.lineTo(W - 100, 1200);
  ctx.stroke();

  // CTA
  // Rounded rectangle button
  const btnX = 180, btnY = 1280, btnW = W - 360, btnH = 140, btnR = 70;
  ctx.fillStyle = '#00C9A7';
  ctx.beginPath();
  ctx.moveTo(btnX + btnR, btnY);
  ctx.lineTo(btnX + btnW - btnR, btnY);
  ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + btnR);
  ctx.lineTo(btnX + btnW, btnY + btnH - btnR);
  ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - btnR, btnY + btnH);
  ctx.lineTo(btnX + btnR, btnY + btnH);
  ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - btnR);
  ctx.lineTo(btnX, btnY + btnR);
  ctx.quadraticCurveTo(btnX, btnY, btnX + btnR, btnY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText('LINK IN BIO 🔗', W / 2, btnY + btnH / 2 + 20);

  // Website URL
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '38px sans-serif';
  ctx.fillText('snapclaps.com', W / 2, 1500);

  // Footer trust
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '34px sans-serif';
  ctx.fillText('Real award seats · Updated daily · No hidden fees', W / 2, 1820);

  // Save
  const filename = opts.filename || `deal-${Date.now()}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  const buffer = c.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

/**
 * Generate a full set of slides for a trip plan
 * @param {Object} plan - trip_plans row
 * @param {string} destination
 * @param {string} emoji
 * @returns {string[]} array of filepaths
 */
async function generateTripSlides(plan, destination, emoji) {
  if (!canvas) return [];
  const filepaths = [];
  const flightOptions = plan.flight_options || [];

  for (let i = 0; i < Math.min(flightOptions.length, 3); i++) {
    const f = flightOptions[i];
    const fp = await generateDealCard({
      destination,
      emoji,
      programName: f.program_name,
      milesCost: f.miles_cost,
      cabin: f.cabin,
      taxesUsd: f.taxes_usd,
      filename: `trip-${plan.id || Date.now()}-slide${i + 1}.png`,
    });
    if (fp) filepaths.push(fp);
  }
  return filepaths;
}

module.exports = { generateDealCard, generateTripSlides };
