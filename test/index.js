'use strict';
const Barrier = require('cb-barrier');
const Code = require('code');
const Lab = require('lab');
const NodePush = require('../lib');

// Test shortcuts
const lab = exports.lab = Lab.script();
const { describe, it } = lab;
const { expect } = Code;


describe('NodePush', () => {
  describe('constructor', () => {
    it('instantiates a new NodePush', () => {
      const push = new NodePush();

      expect(push.transports).to.be.an.instanceof(Map);
    });
  });

  describe('addTransport()', () => {
    it('supports multiple platforms', () => {
      const push = new NodePush();
      const t1 = { platform: 'iOS' };
      const t2 = { platform: ['sns', 'apns', 'apple', 'android'] };

      push.addTransport(t1);
      push.addTransport(t2);

      expect(push.transports.size).to.equal(5);

      // Verify that platforms are case insensitive.
      expect(push.transports.get('ios')).to.equal(t1);

      expect(push.transports.get('sns')).to.equal(t2);
      expect(push.transports.get('apns')).to.equal(t2);
      expect(push.transports.get('apple')).to.equal(t2);
      expect(push.transports.get('android')).to.equal(t2);

      // Verify that existing transports are not overwritten.
      expect(() => {
        push.addTransport({ platform: 'Apple' });
      }).to.throw(Error, 'platform Apple is already configured');

      // Verify that the platform name must be a string.
      expect(() => {
        push.addTransport({ platform: null });
      }).to.throw(TypeError, 'platform name must be a string');
    });
  });

  describe('send()', () => {
    it('calls the transport\'s send() method', () => {
      const barrier = new Barrier();
      const push = new NodePush();

      push.addTransport({
        platform: 'sns',
        send (platform, device, message, options, callback) {
          expect(platform).to.equal('sns');
          expect(device).to.equal('mydeviceid');
          expect(message).to.equal({ title: 'hello' });
          expect(options).to.equal({});
          callback();
        }
      });
      push.send('SNS', 'mydeviceid', { title: 'hello' }, (err) => {
        expect(err).to.not.exist();
        barrier.pass();
      });

      return barrier;
    });

    it('callback is a noop if one is not provided', () => {
      const barrier = new Barrier();
      const push = new NodePush();

      push.addTransport({
        platform: 'sns',
        send (platform, device, message, options, callback) {
          expect(platform).to.equal('sns');
          expect(device).to.equal('mydeviceid');
          expect(message).to.equal({ title: 'hello', body: 'world!' });
          expect(options).to.equal({});
          expect(callback.name).to.equal('noop');
          callback();
          barrier.pass();
        }
      });
      push.send('SNS', 'mydeviceid', { title: 'hello', body: 'world!' });

      return barrier;
    });

    it('the options argument is forced to an empty object', () => {
      const barrier = new Barrier();
      const push = new NodePush();

      push.addTransport({
        platform: 'sns',
        send (platform, device, message, options, callback) {
          expect(platform).to.equal('sns');
          expect(device).to.equal('mydeviceid');
          expect(message).to.equal({ title: 'hello' });
          expect(options).to.equal({});
          callback();
          barrier.pass();
        }
      });
      push.send('SNS', 'mydeviceid', { title: 'hello' }, null);

      return barrier;
    });

    it('throws if a transport does not exist for the platform', () => {
      const push = new NodePush();

      expect(() => {
        push.send('sns', 'mydeviceid', {});
      }).to.throw(Error, 'cannot send to unsupported platform sns');
    });
  });
});
