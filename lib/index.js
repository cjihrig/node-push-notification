'use strict';

class NodePush {
  constructor () {
    this.transports = new Map();
  }

  addTransport (transport) {
    const platforms = Array.isArray(transport.platform) ? transport.platform :
      [transport.platform];

    for (let i = 0; i < platforms.length; ++i) {
      const platform = platforms[i];

      if (typeof platform !== 'string') {
        throw new TypeError('platform name must be a string');
      }

      const platformName = platform.toLowerCase();

      if (this.transports.has(platformName)) {
        throw new Error(`platform ${platform} is already configured`);
      }

      this.transports.set(platformName, transport);
    }

    return this;
  }

  send (platform, device, message, options, callback) {
    const platformName = platform.toLowerCase();
    const transport = this.transports.get(platformName);

    if (transport === undefined) {
      throw new Error(`cannot send to unsupported platform ${platform}`);
    }

    if (typeof options === 'function') {
      callback = options;
      options = {};
    } else if (options === null || typeof options !== 'object') {
      options = {};
    }

    if (typeof callback !== 'function') {
      callback = noop;
    }

    transport.send(platformName, device, message, options, callback);
    return this;
  }
}

function noop () {}

module.exports = NodePush;
