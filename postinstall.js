const { execSync } = require('child_process');
const os = require('os');

const platform = os.platform();

if (platform === 'win32') {
  execSync('copy .\\node_modules\\fsrs-browser\\fsrs_browser_bg.wasm public\\', { stdio: 'inherit' });
} else {
  execSync('cp ./node_modules/fsrs-browser/fsrs_browser_bg.wasm public/', { stdio: 'inherit' });
}
