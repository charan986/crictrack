const { app, BrowserWindow, Tray, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let window = null;

// A simple empty native image for the tray icon fallback
// In a real app, you would replace this with a real 16x16 PNG icon
const icon = nativeImage.createEmpty();

app.whenReady().then(() => {
  tray = new Tray(icon);
  tray.setToolTip('Cricket Scores');

  window = new BrowserWindow({
    width: 340,
    height: 500,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // Load the Vite dev server in development, or the built index.html in production
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'dist', 'index.html')}`;

  window.loadURL(startUrl);

  tray.on('click', (event, bounds) => {
    const { x, y } = bounds;
    const { height, width } = window.getBounds();

    if (window.isVisible()) {
      window.hide();
    } else {
      const yPosition = process.platform === 'darwin' ? y : y - height;
      window.setBounds({
        x: Math.round(x - width / 2),
        y: Math.round(yPosition),
        height,
        width
      });
      window.show();
    }
  });

  window.on('blur', () => {
    window.hide();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
