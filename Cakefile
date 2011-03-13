sys = require 'sys'
fs = require 'fs'
exec = require('child_process').exec
spawn = require('child_process').spawn

task 'watch', 'watches and compiles coffee', ->
  console.log "Spawning coffee watcher"
  coffee = spawn 'coffee', ['-cwl', '--bare', '-o', 'lib', 'src']
  console.log ""
  
  [coffee].forEach (child) ->
      child.stdout.on 'data', (data) -> 
        sys.print data
        exec "growlnotify -m \"#{data}\" -t \"Cakefile\""
      child.stderr.on 'data'  , (data) -> 
          sys.print data
          exec "growlnotify -m \"#{data}\" -t \"Cakefile\""