###
  node-redis-monitor
  Live redis server monitor
###
spawn  = require("child_process").spawn
arg    = require("./arguments")
logger = require("./logger").logger
sys    = require("sys")

exports.redisMonitor = class
  constructor: ->
    @config = 
      host: "localhost"
      port: 6379
      interval: 1
    arg.parse [
      name: /^(--help|-\?)$/
      expected: null
      callback: @displayHelp
    ,
      name: /^(-h|--host)$/
      expected: /^(.*)$/
      callback: @setHost
    ,
      name: /^(-p|--port)$/
      expected: /^[0-9]$/
      callback: @setPort
    ,
      name: /^(-a|--password)$/
      expected: /^(.*)$/
      callback: @setPassword
    ,
      name: /^(-i|--interval)$/
      expected: /^([0-9])$/
      callback: @setInterval
    ], @run, @invalidArgument
  
  # CLI Handling
  displayHelp: (end) => 
    console.log "Usage: redis-monitor [options]"
    console.log "   -?, --help                  Display this help message."
    console.log "   -h, --host [HOSTNAME]       Set the hostname to connect to"
    console.log "   -p, --port [PORT]           Set the port to connect to"
    console.log "   -a, --password [PASSWORD]   Set the password to authenticate with"
    console.log "   -i, --interval [INTERVAL]   Set the refresh interval in seconds"
  setHost: (end, host) => @config.host = host; end()
  setPort: (end, port) => @config.port = port; end()
  setPassword: (end, password) => @config.password = password; end()
  setInterval: (end, interval) => @config.interval = interval; end()
  invalidArgument: (arg, valueMissing) => logger.error "The argument #{arg} #{if valueMissing is true then 'expects a value' else 'is not valid'}"
  
  run: =>
    @stat = 
      total: 0
      requests: {}
    @updateInterval = setInterval(=>
      @updateDisplay()
    , @config.interval*1000)
    
    @command = [
      'redis-cli'
      '-h'
      @config.host
      '-p'
      @config.port
    ]
    if @config.password
      @command.push "-a", @config.password
    @command.push "monitor"
    @process = spawn "/usr/bin/env", @command
    @process.stdout.on "data", (chunk) =>
      data = chunk.toString()
      if data.match /^(ERR|Error)/i
        logger.error data
        process.exit(1)
      else
        lines = data.split "\n"
        for line in lines
          match = line.match /^(.*?) "(.*?)"/i
          if match
            if match[2]
              unless @stat.requests.hasOwnProperty match[2]
                @stat.requests[match[2]] = 1
              else
                @stat.requests[match[2]]++
              @stat.total++
    @process.stderr.on "data", (chunk) ->
      logger.error "#{chunk.toString()}"
    @process.on "exit", ->
      logger.error "redis-cli process exited"
      process.exit(1)
    
  updateDisplay: =>
    sys.print "\033[2J"
    sys.print "\r\033[40;1;37m node-redis-monitor \033[m\r\n\r\n"
    
    if @config.interval is 1
      sys.print "Requests per second:\t#{@stat.total}\r\n\r\n"
    else
      sys.print "Requests per second:\t#{Math.floor(@stat.total/@config.interval)} (#{@stat.total} in last #{@config.interval} seconds)\r\n\r\n"
    
    # order keys by requests
    keys = []
    for key, val of @stat.requests
      keys.push [key, val]
    
    keys.sort ((a,b) -> b[1] - a[1])
    
    requests = {}
    for key in keys
      requests[key[0]] = key[1]
    
    for key, val of requests
      if key.length
        space_a = new Array(20-key.length).join(" ")
        space_b = new Array(20-val.toString().length).join(" ")
        sys.print "#{key}:#{space_a}#{val}#{space_b}#{(100/@stat.total*val).toFixed(2)}%\r\n"
      
    delete requests
    
    @stat.total    = 0
    @stat.requests = {}
    