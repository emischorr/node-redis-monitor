/*
  node-redis-monitor
  Live redis server monitor
*/var arg, logger, spawn, sys;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty;
spawn = require("child_process").spawn;
arg = require("./arguments");
logger = require("./logger").logger;
sys = require("sys");
exports.redisMonitor = function() {
  function _Class() {
    this.updateDisplay = __bind(this.updateDisplay, this);;
    this.run = __bind(this.run, this);;
    this.invalidArgument = __bind(this.invalidArgument, this);;
    this.setInterval = __bind(this.setInterval, this);;
    this.setPassword = __bind(this.setPassword, this);;
    this.setPort = __bind(this.setPort, this);;
    this.setHost = __bind(this.setHost, this);;
    this.displayHelp = __bind(this.displayHelp, this);;    this.config = {
      host: "localhost",
      port: 6379,
      interval: 1
    };
    arg.parse([
      {
        name: /^(--help|-\?)$/,
        expected: null,
        callback: this.displayHelp
      }, {
        name: /^(-h|--host)$/,
        expected: /^(.*)$/,
        callback: this.setHost
      }, {
        name: /^(-p|--port)$/,
        expected: /^[0-9]$/,
        callback: this.setPort
      }, {
        name: /^(-a|--password)$/,
        expected: /^(.*)$/,
        callback: this.setPassword
      }, {
        name: /^(-i|--interval)$/,
        expected: /^([0-9])$/,
        callback: this.setInterval
      }
    ], this.run, this.invalidArgument);
  }
  _Class.prototype.displayHelp = function(end) {
    console.log("Usage: redis-monitor [options]");
    console.log("   -?, --help                  Display this help message.");
    console.log("   -h, --host [HOSTNAME]       Set the hostname to connect to");
    console.log("   -p, --port [PORT]           Set the port to connect to");
    console.log("   -a, --password [PASSWORD]   Set the password to authenticate with");
    return console.log("   -i, --interval [INTERVAL]   Set the refresh interval in seconds");
  };
  _Class.prototype.setHost = function(end, host) {
    this.config.host = host;
    return end();
  };
  _Class.prototype.setPort = function(end, port) {
    this.config.port = port;
    return end();
  };
  _Class.prototype.setPassword = function(end, password) {
    this.config.password = password;
    return end();
  };
  _Class.prototype.setInterval = function(end, interval) {
    this.config.interval = interval;
    return end();
  };
  _Class.prototype.invalidArgument = function(arg, valueMissing) {
    return logger.error("The argument " + arg + " " + (valueMissing === true ? 'expects a value' : 'is not valid'));
  };
  _Class.prototype.run = function() {
    this.stat = {
      total: 0,
      requests: {}
    };
    this.updateInterval = setInterval(__bind(function() {
      return this.updateDisplay();
    }, this), this.config.interval * 1000);
    this.command = ['redis-cli', '-h', this.config.host, '-p', this.config.port];
    if (this.config.password) {
      this.command.push("-a", this.config.password);
    }
    this.command.push("monitor");
    this.process = spawn("/usr/bin/env", this.command);
    this.process.stdout.on("data", __bind(function(chunk) {
      var data, line, lines, match, _i, _len, _results;
      data = chunk.toString();
      if (data.match(/^(ERR|Error)/i)) {
        logger.error(data);
        return process.exit(1);
      } else {
        lines = data.split("\n");
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          match = line.match(/^(.*?) "(.*?)"/i);
          _results.push(match ? match[2] ? (!this.stat.requests.hasOwnProperty(match[2]) ? this.stat.requests[match[2]] = 1 : this.stat.requests[match[2]]++, this.stat.total++) : void 0 : void 0);
        }
        return _results;
      }
    }, this));
    this.process.stderr.on("data", function(chunk) {
      return logger.error("" + (chunk.toString()));
    });
    return this.process.on("exit", function() {
      logger.error("redis-cli process exited");
      return process.exit(1);
    });
  };
  _Class.prototype.updateDisplay = function() {
    var key, keys, requests, space_a, space_b, val, _i, _len, _ref;
    sys.print("\033[2J");
    sys.print("\r\033[40;1;37m node-redis-monitor \033[m\r\n\r\n");
    if (this.config.interval === 1) {
      sys.print("Requests per second:\t" + this.stat.total + "\r\n\r\n");
    } else {
      sys.print("Requests per second:\t" + (Math.floor(this.stat.total / this.config.interval)) + " (" + this.stat.total + " in last " + this.config.interval + " seconds)\r\n\r\n");
    }
    keys = [];
    _ref = this.stat.requests;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      keys.push([key, val]);
    }
    keys.sort((function(a, b) {
      return b[1] - a[1];
    }));
    requests = {};
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      requests[key[0]] = key[1];
    }
    for (key in requests) {
      if (!__hasProp.call(requests, key)) continue;
      val = requests[key];
      if (key.length) {
        space_a = new Array(20 - key.length).join(" ");
        space_b = new Array(20 - val.toString().length).join(" ");
        sys.print("" + key + ":" + space_a + val + space_b + ((100 / this.stat.total * val).toFixed(2)) + "%\r\n");
      }
    }
    delete requests;
    this.stat.total = 0;
    return this.stat.requests = {};
  };
  return _Class;
}();