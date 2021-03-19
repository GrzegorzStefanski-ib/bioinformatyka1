// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

window.d3 = require("d3");
window.spawn = require('child_process').spawn;
window.dialog = require('electron').remote.dialog;
window.d3_save_svg = require('d3-save-svg');
// window.addEventListener('DOMContentLoaded', () => {

//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }

  
// })
