export default function setupPlatform() {
    if (require('electron-squirrel-startup')) {
        process.exit(0);
    }
}
