import { catsnakeConfig } from './config';
import msgpack from '../node_modules/msgpack-lite/dist/msgpack.min.js';

import {
  csModClientid,
  csModEncode,
  csModPublish,
  csModInfo,
  csModSubscribe,
  csModGrant,
  csModDeny,
  csModAuthenticate,
} from './modules/core/index';

import {
  csModHistory,
} from './modules/persistance/index';

const _encode = Symbol('encode');
const _awaitMessage = Symbol('awaitMessage');

/**
 * Creates a new CatSnake client.
 * @class
 */
class CatSnake {
  /**
   * @constructs CatSnake
   * @param {string} address - the address of the catsnake server
   * @param {object} options - options such as common name and others
   * @param {string} options.commonName - common name of your client
   * @param {boolean} options.bypassThrottle - bypass client side throttling, this does not prevent serverside throttling
   * @param {string} options.clientId - reconnect with an old clientId
   */
  constructor(address, options) {
    this.symbols = {
      _encode,
      _awaitMessage,
    };

    this.socket = new WebSocket(address);
    this.socket.binaryType = 'arraybuffer';

    this.connected = false;
    this.client = options.clientId || csModClientid();
    this.commonName = options.commonName || catsnakeConfig.defaultName;
    this.bypassThrottle = options.bypassThrottle || false;
    this.listeners = [];

    // Fired when the connection is made to the server
    this.socket.onopen = () => {
      this.connected = true;
      // Make sure we tell the server we're leaving.
      window.onbeforeunload = () => {
        this.socket.close();
      };
    };

    this.socket.onmessage = msg => {
      const decodedMsg = msgpack.decode(
        new Uint8Array(msg.data)
      );

      this.listeners.map(l => l(decodedMsg));
    };
  }

  /**
   * Add function as a listener that will be called whenever a message comes in.
   * @function _awaitMessage (internal/private)
   * @param {function} listener - the function to execute when a message comes in.
  */
  [_awaitMessage](listener) {
    this.listeners.push(listener);
  }

  /**
   * Tries to return a binary blob.
   * @function _encode (internal)
   * @param {object} data - the object to attempt to encode
   * @callback {string} - Returns an encoded blob
  */
  [_encode](data, callback) {
    return csModEncode(data, callback, this);
  }

  /**
   * csModPublish module.
   * @module core/csModPublish
   * @param {string} channel - the channel to publish to
   * @param {object} data - the object to publish
   * @param {string} privateKey - optional private key for private channels
   * @returns {promise} - returns new promise, resolved when server gets message
  */
  publish(channel, data, privateKey) {
    return csModPublish(channel, data, privateKey, this);
  }

  /**
   * List channels, get client info.
   * @function info
   * @param {string} channel - the channel to look at
   * @param {object} data - additional information for request
   * @param {object} opts - additional options for subscriptions
   * @param {string} opts.privateKey - private key used for getting info from private channels
  */
  info(channel, data, opts) {
    csModInfo(channel, data, opts, this);
  }

  /**
   * Get message history from a channel.
   * @function history
   * @param {string} channel - the channel to pull history from
   * @param {number} limit - the ammount of items to pull from history
   * @param {object} opts - options such as privateKeys
   * @param {string} opts.privateKey - private key used for getting history from private channels
  */
  history(channel, limit, opts) {
    csModHistory(channel, limit, opts, this);
  }

  /**
   * Subscribe to a channel
   * @function subscribe
   * @param {string} channel - the channel to subscribe to
   * @param {function} callback - new messages are returned here via msg
   * @param {object} callback.msg - a new payload published to this channel
   * @param {object} opts - additional options for subscriptions
   * @param {string} opts.privateKey - private key used for subscribing to private channels
   * @param {string} opts.noself - subscribe for everything but ignore your own payloads
   * @param {string} opts.accessToken - used as a key to modify private channels. Not to be confused with privateKey
   * @param {string} opts.private - make this channel private, clients can only connect if granted access
  */
  subscribe(channel, callback, opts) {
    csModSubscribe(channel, callback, opts, this);
  }

  /**
   * Deny a client access to a channel
   * @function deny
   * @param {string} channel - the channel in which to deny the client from
   * @param {string} client - the client to deny
   * @param {string} secret - the secret key associated with this channel
  */
  deny(channel, client, secret) {
    return csModDeny(channel, client, secret, this);
  }

  /**
   * Grant a client access to a channel
   * @function grant
   * @param {string} channel - the channel in which to grant the client access to
   * @param {string} client - the client to grant access
   * @param {string} secret - the secret key associated with this channel
  */
  grant(channel, client, secret) {
    return csModGrant(channel, client, secret, this);
  }

  /**
   * Grant a client access to a private server
   * @function csModAuthenticate
   * @param {string} secret - the secret key for the private server
  */
  authenticate(secret) {
    return csModAuthenticate(secret, this);
  }
}
/*
        ___
    . -^   `--,
   /# =========`-_
  /# (--====___====\
 /#   .- --.  . --.|
/##   |  * ) (   * ),
|##   \    /\ \   / |
|###   ---   \ ---  |
|####      ___)    #|
|######           ##|
 \##### ---------- /   SHOW US WHAT YOU GOT!!!
  \####           (  Submit a pull request and make Catsnake better.
   `\###          |
     \###         |
      \##        |
       \###.    .)
        `======/

*/
