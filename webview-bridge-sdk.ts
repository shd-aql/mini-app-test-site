// // WebView Bridge SDK - Core Library
// // Handles communication between web content and native mobile apps

// class WebViewBridge {
//   constructor(config) {
//     this.config = config;
//     this.messageHandlers = new Map();
//     this.eventListeners = new Map();
//     this.isNativeApp = this.detectNativeEnvironment();
//     this.initializeBridge();
//   }

//   detectNativeEnvironment() {
//     return !!(
//       window.webkit?.messageHandlers?.bridge ||
//       window.Android?.bridge ||
//       /WebViewBridge/i.test(navigator.userAgent)
//     );
//   }

//   initializeBridge() {
//     if (!this.isNativeApp) {
//       if (this.config.debug) {
//         console.warn('WebViewBridge: Not running in native app environment');
//       }
//       return;
//     }

//     // Listen for messages from native app
//     window.addEventListener('message', (event) => {
//       try {
//         const response = JSON.parse(event.data);
//         this.handleNativeResponse(response);
//       } catch (error) {
//         if (this.config.debug) {
//           console.error('WebViewBridge: Failed to parse native response', error);
//         }
//       }
//     });

//     // Handle custom bridge events
//     window.bridgeEventReceiver = (eventData) => {
//       try {
//         const data = JSON.parse(eventData);
//         this.emitEvent(data.type, data.payload);
//       } catch (error) {
//         if (this.config.debug) {
//           console.error('WebViewBridge: Failed to handle bridge event', error);
//         }
//       }
//     };
//   }

//   generateMessageId() {
//     return `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   sendToNative(message) {
//     return new Promise((resolve, reject) => {
//       if (!this.isNativeApp) {
//         reject(new Error('Not running in native app environment'));
//         return;
//       }

//       const timeout = setTimeout(() => {
//         this.messageHandlers.delete(message.id);
//         reject(new Error('Bridge communication timeout'));
//       }, this.config.timeout || 10000);

//       this.messageHandlers.set(message.id, (response) => {
//         clearTimeout(timeout);
//         this.messageHandlers.delete(message.id);
//         resolve(response);
//       });

//       if (window.webkit?.messageHandlers?.bridge) {
//         window.webkit.messageHandlers.bridge.postMessage(JSON.stringify(message));
//       } else if (window.Android?.bridge) {
//         window.Android.bridge.postMessage(JSON.stringify(message));
//       } else {
//         clearTimeout(timeout);
//         this.messageHandlers.delete(message.id);
//         reject(new Error('No bridge handler found'));
//       }
//     });
//   }

//   handleNativeResponse(response) {
//     const handler = this.messageHandlers.get(response.id);
//     if (handler) {
//       handler(response);
//     }
//   }

//   emitEvent(type, data) {
//     const listeners = this.eventListeners.get(type);
//     if (listeners) {
//       listeners.forEach((listener) => listener(data));
//     }
//   }

//   // --- Public API ---

//   async processPayment(request) {
//     const message = {
//       id: this.generateMessageId(),
//       type: 'payment',
//       action: 'process',
//       payload: request,
//       timestamp: Date.now()
//     };

//     try {
//       const response = await this.sendToNative(message);
//       return response.data;
//     } catch (error) {
//       return { success: false, error: error.message || 'Payment failed' };
//     }
//   }

//   async authenticate(request) {
//     const message = {
//       id: this.generateMessageId(),
//       type: 'auth',
//       action: request.action,
//       payload: request,
//       timestamp: Date.now()
//     };

//     try {
//       const response = await this.sendToNative(message);
//       return response.data;
//     } catch (error) {
//       return { success: false, error: error.message || 'Authentication failed' };
//     }
//   }

//   async shareContent(request) {
//     const message = {
//       id: this.generateMessageId(),
//       type: 'share',
//       action: 'content',
//       payload: request,
//       timestamp: Date.now()
//     };

//     try {
//       const response = await this.sendToNative(message);
//       return response.success;
//     } catch (error) {
//       if (this.config.debug) console.error('Share failed:', error);
//       return false;
//     }
//   }

//   async captureMedia(request) {
//     const message = {
//       id: this.generateMessageId(),
//       type: 'camera',
//       action: 'capture',
//       payload: request,
//       timestamp: Date.now()
//     };

//     try {
//       const response = await this.sendToNative(message);
//       return response.success ? response.data : null;
//     } catch (error) {
//       if (this.config.debug) console.error('Camera capture failed:', error);
//       return null;
//     }
//   }

//   async getDeviceInfo() {
//     const message = {
//       id: this.generateMessageId(),
//       type: 'device',
//       action: 'info',
//       payload: {},
//       timestamp: Date.now()
//     };

//     try {
//       const response = await this.sendToNative(message);
//       return response.success ? response.data : null;
//     } catch (error) {
//       if (this.config.debug) console.error('Device info request failed:', error);
//       return null;
//     }
//   }

//   async setStorage(key, value) {
//     const message = {
//       id: this.generateMessageId(),
//       type: 'storage',
//       action: 'set',
//       payload: { key, value },
//       timestamp: Date.now()
//     };

//     try {
//       const response = await this.sendToNative(message);
//       return response.success;
//     } catch (error) {
//       return false;
//     }
//   }

//   async getStorage(key) {
//     const message = {
//       id: this.generateMessageId(),
//       type: 'storage',
//       action: 'get',
//       payload: { key },
//       timestamp: Date.now()
//     };

//     try {
//       const response = await this.sendToNative(message);
//       return response.success ? response.data : null;
//     } catch (error) {
//       return null;
//     }
//   }

//   async callCustomMethod(method, payload) {
//     const message = {
//       id: this.generateMessageId(),
//       type: 'custom',
//       action: method,
//       payload,
//       timestamp: Date.now()
//     };

//     try {
//       const response = await this.sendToNative(message);
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // --- Event handling ---
//   addEventListener(type, listener) {
//     if (!this.eventListeners.has(type)) {
//       this.eventListeners.set(type, new Set());
//     }
//     this.eventListeners.get(type).add(listener);
//   }

//   removeEventListener(type, listener) {
//     const listeners = this.eventListeners.get(type);
//     if (listeners) {
//       listeners.delete(listener);
//     }
//   }

//   // --- Utils ---
//   isNativeEnvironment() {
//     return this.isNativeApp;
//   }

//   getConfig() {
//     return { ...this.config };
//   }
// }

// // Factory
// export function createBridge(config) {
//   return new WebViewBridge(config);
// }

// // Helper functions
// export const BridgeHelpers = {
//   // Payment
//   createPayment: (amount, currency, description) => ({
//     amount,
//     currency,
//     description
//   }),

//   // Auth
//   createLoginRequest: (username, password) => ({
//     action: 'login',
//     credentials: { username, password }
//   }),

//   createTokenRefreshRequest: (token) => ({
//     action: 'refresh',
//     credentials: { token }
//   }),

//   // Share
//   shareText: (text, title) => ({
//     type: 'text',
//     content: text,
//     title
//   }),

//   shareUrl: (url, title, description) => ({
//     type: 'url',
//     content: url,
//     title,
//     description
//   }),

//   // Camera
//   takePhoto: (quality = 'medium') => ({
//     type: 'photo',
//     quality
//   }),

//   scanQR: () => ({
//     type: 'scan',
//     scanType: 'qr'
//   })
// };

// export default WebViewBridge;
