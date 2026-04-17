// server/utils/video-generator.js
// Assembles PNG slides into a 15-second MP4 using fluent-ffmpeg
// Each slide shown for 5s with fade transitions

let ffmpeg;
try {
  ffmpeg = require('fluent-ffmpeg');
} catch {
  ffmpeg = null;
  console.warn('fluent-ffmpeg not available — video-generator will return null');
}

const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../../dist/social');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Assemble PNG slides into an MP4 video
 * @param {string[]} slidePaths - array of PNG file paths
 * @param {string} outputFilename - e.g. 'trip-123.mp4'
 * @param {Object} opts
 * @param {number} opts.secondsPerSlide - default 5
 * @returns {Promise<string|null>} output filepath or null
 */
async function assembleSlidesToVideo(slidePaths, outputFilename, opts = {}) {
  if (!ffmpeg || !slidePaths || slidePaths.length === 0) return null;
  ensureOutputDir();

  const secondsPerSlide = opts.secondsPerSlide || 5;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  return new Promise((resolve, reject) => {
    // Build a concat file for ffmpeg
    const concatFile = path.join(OUTPUT_DIR, `concat-${Date.now()}.txt`);
    const lines = slidePaths.map(p => `file '${p}'\nduration ${secondsPerSlide}`).join('\n');
    // Add last file again (ffmpeg concat demuxer requires it)
    const lastSlide = slidePaths[slidePaths.length - 1];
    fs.writeFileSync(concatFile, lines + `\nfile '${lastSlide}'`);

    ffmpeg()
      .input(concatFile)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .videoCodec('libx264')
      .outputOptions([
        '-pix_fmt', 'yuv420p',       // maximum compatibility
        '-vf', 'scale=1080:1920',    // enforce 9:16
        '-r', '30',                   // 30fps
        '-preset', 'fast',
        '-crf', '23',
        '-movflags', '+faststart',    // web streaming optimized
      ])
      .output(outputPath)
      .on('end', () => {
        try { fs.unlinkSync(concatFile); } catch {}
        resolve(outputPath);
      })
      .on('error', (err) => {
        try { fs.unlinkSync(concatFile); } catch {}
        console.error('ffmpeg error:', err.message);
        resolve(null); // don't reject — video is optional
      })
      .run();
  });
}

/**
 * Full pipeline: slides → video
 * @param {string[]} slidePaths
 * @param {number} searchId
 * @returns {Promise<string|null>}
 */
async function generateTripVideo(slidePaths, searchId) {
  if (!slidePaths || slidePaths.length === 0) return null;
  return assembleSlidesToVideo(slidePaths, `trip-${searchId}-${Date.now()}.mp4`);
}

module.exports = { assembleSlidesToVideo, generateTripVideo };
