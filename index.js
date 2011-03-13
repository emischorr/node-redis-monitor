#!/usr/bin/env node
/*
  node-redis-monitor
  Live redis server monitor
*/
global.version = "0.0.1"
var redisMonitor = require('./lib/node-redis-monitor').redisMonitor;
var redisMonitorInstance = new redisMonitor();
