# node-push-notification

[![Current Version](https://img.shields.io/npm/v/node-push-notification.svg)](https://www.npmjs.org/package/node-push-notification)
[![Build Status via Travis CI](https://travis-ci.org/continuationlabs/node-push-notification.svg?branch=master)](https://travis-ci.org/continuationlabs/node-push-notification)
![Dependencies](http://img.shields.io/david/continuationlabs/node-push-notification.svg)

[![belly-button-style](https://cdn.rawgit.com/continuationlabs/belly-button/master/badge.svg)](https://github.com/continuationlabs/belly-button)

`node-push-notification` is a library for sending push notifications from Node.js. Because
platforms (iOS, Android, AWS SNS, etc.) require different setups, `node-push-notification`
employs a transport system where helper modules are used to communicate with various push notification providers.

For example, `node-push-notification` cannot send any push notifications out of the box, but if an Android transport plugin is used, it can send push notifications to Android devices. The plugin system is used to allow custom integrations, while keeping the dependencies of `node-push-notification` to a minimum.

## Basic Usage

The following example illustrates how `node-push-notification` is integrated with Amazon's SNS service.

```javascript
'use strict';
const Push = require('node-push-notification');
const SnsTransport = require('node-push-notification-sns-transport');
const push = new Push();

// Configure push notifications via AWS SNS.
push.addTransport(new SnsTransport({
  aws: {
    accessKeyId: 'AWS_ACCESS_KEY_ID',
    secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
    region: 'us-east-1',
    apiVersions: {
      sns: '2010-03-31'
    }
  },
  platformAppArn: 'AWS_PLATFORM_APPLICATION_ARN'
}));

// Send a push notification via SNS.
push.send('sns', 'DEVICE_TOKEN', { alert: 'how is it going?' }, (err, data) => {
  console.log(err);
  console.log(data);
});
```

## API

`node-push-notification` exports a single class with the following functions:

### `NodePush() constructor`

A constructor function that takes no arguments.

### `NodePush.prototype.addTransport(transport)`

  - Arguments
    - `transport` (object) - An instance of a transport for communicating with one or more push notification systems.
  - Returns
    - The `NodePush` instance.

### `NodePush.prototype.send(platform, device, message, options, callback)`

  - Arguments
    - `platform` (string) - The case insensitive platform name to send the push notification through. There must be a transport configured to handle the named platform or an exception will be thrown.
    - `device` (string) - The destination device ID of the push notification.
    - `message` (object) - An object containing the message to be sent. More details on the expected schema of this object will be included as `node-push-notification` matures.
    - `callback(err, result)` (function) - An optional callback function that
    passes the error and result of the send attempt.
  - Returns
    - The `NodePush` instance.
