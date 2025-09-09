// main.js
import { createBridge, BridgeHelpers } from './webview-bridge-sdk.js';

const bridge = createBridge();

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendBtn");
  sendBtn.addEventListener("click", () => {
    bridge.sendMessage("Hello from Website!");
    BridgeHelpers.log("Button clicked");
  });
});
