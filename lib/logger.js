exports.logger = {
  output: function(message) {
    return console.log("\033[40;1;37m node-redis-monitor \033[m " + message);
  },
  log: function(message) {
    message = message.toString().replace(/\*(.*?)\*/ig, "\033[1m$1\033[m");
    return this.output("" + (this.date()) + message);
  },
  error: function(message) {
    message = message.toString().replace(/\*(.*?)\*/ig, "\033[1m$1\033[m");
    return this.output("\033[1;31mError: \033[0;31m" + message + "\033[m");
  },
  debug: function(message) {
    message = message.toString().replace(/\*(.*?)\*/ig, "\033[1m$1\033[m");
    return this.output("\033[1;30mDebug: \033[0;30m" + message + "\033[m");
  }
};