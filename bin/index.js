#!/usr/bin/env node

/**
 * host management tool
 */

//  命令操作
// add ip host
// add host 
// list  show all the host lines
// remove host
// enable host
// disable host

const program = require('commander');
const readline = require('readline');
const fs = require('fs');


var WINDOWS = process.platform === 'win32'
var EOL = WINDOWS ?
  '\r\n' :
  '\n'

const HOSTS = WINDOWS ?
  'C:/Windows/System32/drivers/etc/hosts' :
  '/etc/hosts';

readHost();
// 输出命令

program
  .command('add <host> [ip]')
  .action(function (host, ip) {

  })

program.parse(process.argv)


function readHost() {
  const rl = readline.createInterface({
    input: fs.createReadStream(HOSTS)
  });

  rl.on('line', (line) => {
    console.log('Line from file:', line);
  });

}