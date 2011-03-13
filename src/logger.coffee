exports.logger =
  output: (message) ->
    console.log "\033[40;1;37m node-redis-monitor \033[m #{message}"
  log: (message) ->
    message = message.toString().replace /\*(.*?)\*/ig, "\033[1m$1\033[m"
    @output "#{this.date()}#{message}"
  error: (message) ->
    message = message.toString().replace /\*(.*?)\*/ig, "\033[1m$1\033[m"
    @output "\033[1;31mError: \033[0;31m#{message}\033[m"
  debug: (message) ->
    message = message.toString().replace /\*(.*?)\*/ig, "\033[1m$1\033[m"
    @output "\033[1;30mDebug: \033[0;30m#{message}\033[m"