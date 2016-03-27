(function () {
  'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers;

  var clientid = function clientid(a, b) {
    return Math.pow(a, b);
  };

  var stringify = function stringify(data, cb) {
    try {
      cb(JSON.stringify(data));
    } catch (e) {
      console.warn('attempted to send invalid data to the pubsub server.');
    }
  };

  var publish = function publish(channel, data, privateKey, _this) {
    // If we're connected, let's go ahead and publish our payload.
    if (_this.connected) {
      // Safely stringify our data before sending it to the server.
      _this.stringify({
        channel: channel,
        privateKey: privateKey,
        payload: data,
        metadata: {
          time: Date.now(),
          client: _this.client,
          commonName: _this.commonName,
          type: 'publish'
        }
      }, function (payload) {
        _this.socket.send(payload);
      });
    } else {
      // Crap, Something is wrong and we're not connected yet, let's try again later.
      console.warn('Failed to publish, not connected to server, attempting again in 1 second.');
      setTimeout(function () {
        _this.publish(channel, data, privateKey);
      }, 500);
    }
  };

  var clients = function clients(channel, data, opts, _this) {
    var options = opts ? opts : {};
    var privateKey = options.privateKey ? options.privateKey : false;

    // If we're connected, let's go ahead and publish our payload.
    if (_this.connected) {
      // Safely stringify our data before sending it to the server.
      _this.stringify({
        channel: channel,
        privateKey: privateKey,
        payload: data,
        metadata: {
          time: Date.now(),
          client: _this.client,
          commonName: _this.commonName,
          type: 'clients'
        }
      }, function (payload) {
        _this.socket.send(payload);
      });
    } else {
      // Crap, Something is wrong and we're not connected yet, let's try again later.
      console.warn('Failed to publish, not connected to server, attempting again in 1 second.');
      setTimeout(function () {
        _this.clients(channel, data, privateKey);
      }, 500);
    }
  };

  var subscribe = function subscribe(channel, cb, opts, _this) {
    var options = opts ? opts : {};
    var privateKey = options.privateKey ? options.privateKey : false;

    if (_this.connected) {
      // Safely stringify our data before sending it to the server.
      _this.stringify({
        channel: channel,
        privateKey: privateKey,
        noself: options.noself ? options.noself : false,
        metadata: {
          time: Date.now(),
          client: _this.client,
          commonName: _this.commonName,
          type: 'subscribe'
        }
      }, function (payload) {
        _this.socket.send(payload);
        _this.socket.onmessage = function (msg) {
          if (JSON.parse(msg.data).channel === channel) {
            cb(JSON.parse(msg.data));
          }
        };
        window.onbeforeunload = function () {
          _this.stringify({
            channel: channel,
            privateKey: privateKey,
            metadata: {
              time: Date.now(),
              client: _this.client,
              commonName: _this.commonName,
              type: 'unsubscribe'
            }
          }, function (payload) {
            _this.socket.send(payload);
          });
        };
      });
    } else {
      // Crap, Something is wrong and we're not connected yet, let's try again later.
      console.warn('Failed to publish, not connected to server, attempting again in 1 second.');
      setTimeout(function () {
        _this.subscribe(channel, cb, privateKey);
      }, 500);
    }
  };

  var jsps = function () {
    function jsps(address, options) {
      var _this = this;

      babelHelpers.classCallCheck(this, jsps);

      this.socket = new WebSocket(address);
      this.connected = false;
      this.client = this.clientid();
      this.commonName = options.commonName ? options.commonName : 'Anonymous';
      this.socket.onopen = function (event) {
        _this.connected = true;
        window.onbeforeunload = function () {
          _this.socket.close();
        };
      };
    }

    babelHelpers.createClass(jsps, [{
      key: 'clientid',
      value: function clientid$$() {
        return clientid();
      }
    }, {
      key: 'stringify',
      value: function stringify$$(data, cb) {
        return stringify(data, cb);
      }
    }, {
      key: 'publish',
      value: function publish$$(channel, data, privateKey) {
        publish(channel, data, privateKey, this);
      }
    }, {
      key: 'clients',
      value: function clients$$(channel, data, opts) {
        clients(channel, data, opts, this);
      }
    }, {
      key: 'subscribe',
      value: function subscribe$$(channel, cb, opts) {
        subscribe(channel, cb, opts, this);
      }
    }]);
    return jsps;
  }();

  ;

}());