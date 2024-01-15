import fs from 'fs';
import { spawn } from 'child_process';
import config from 'config';

/**
 * Compiles code found at `codePath` and outputs at the output path.
 *
 * @example
 * // Will compile contents, generating ./ft-mint.code` and ./ft-mint as outputs
 * compile('./code/ft-mint/ft-mint.code', './', 'ft-mint');
 *
 * @param {String} codePath - Path of code file to compile
 * @param {String} [outputPath=./] - Directory to output, defaults to current directory
 * @param {String} [outputName=out] - name of `.code` and `out` files. Defaults to out.
 */
async function compile(codePath, outputPath = './', outputName = 'out', curve = 'bn128', options = {}) {
  const { maxReturn = 10000000, verbose = false } = options;
  if (!fs.existsSync(codePath)) {
    throw new Error(`Compile input file ${codePath} not found`);
  }

  const parsedOutputName = outputName; // TODO can have more checks here
  // TODO: Check if outputPath is directory, otherwise throw.
  const parsedOutputPath = outputPath.endsWith('/') ? outputPath : `${outputPath}/`;
  const outputDir = `${parsedOutputPath}${parsedOutputName}`;
  const zokratesBin = config.zokratesBin;
  return new Promise((resolve, reject) => {
    const zokrates = spawn(zokratesBin, ['compile', '-i', codePath, '-o', outputDir, '--curve', curve], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ZOKRATES_STDLIB: process.env.ZOKRATES_STDLIB,
      },
    });

    let output = `zokrates compile -i ${codePath} -o ${outputDir} --curve ${curve}`;

    zokrates.stdout.on('data', (data) => {
      if (verbose) {
        output += data.toString('utf8');
        // If the entire output gets too large, just send ...[truncated].
        if (output.length > maxReturn) output = '...[truncated]';
      }
    });

    zokrates.stderr
      .on('data', (err) => {
        reject(new Error(`Compile failed: ${err}`));
      })
      .on('error', (err) => {
        reject(new Error(`Compile failed: ${err}`));
      });

    zokrates.on('error', (err) => {
      reject(new Error(`Compile failed: ${err}`));
    });

    zokrates.on('close', () => {
      // ZoKrates sometimes outputs error through stdout instead of stderr,
      // so we need to catch those errors manually.
      if (output.includes('panicked')) {
        reject(new Error(output.slice(output.indexOf('panicked'))));
      }
      if (verbose) resolve(output);
      else resolve();
    });
  });
}

export default compile;
