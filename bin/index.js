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
const Table = require("cli-table");
const os = require("os");

var WINDOWS = process.platform === 'win32'
var EOL = WINDOWS ?
  '\r\n' :
  '\n'

const HOSTS = WINDOWS ?
  'C:/Windows/System32/drivers/etc/hosts' :
  '/etc/hosts';

// readHost();
// 输出命令

program
  // list
  .command('list')
  .action(function () {
    readHost().then(res=> showAll(res));
  })
program
  .command('add <host> [ip]')
  .action(function (host, ip="127.0.0.1") {
    console.log(host);
    readHost()
      .then(res=> addHostIp(res, {host, ip}))
      .then(()=> {
        console.log(`add ${host}=>${ip} successfully!`);
      }).catch(err=> {
        console.log("add failly for: ",err);
      });
  })

program.parse(process.argv)


function readHost() {
  const rl = readline.createInterface({
    input: fs.createReadStream(HOSTS)
  });
  const res = [];
  return new Promise(function (resolve, reject) {
    rl.on('line', (line) => {
      console.log('Line from file:', line);
      var item;
      if(item = parseLine(line)) {
        res.push(item);
      }
    }).on('close', function () {
      // console.log(res);
      resolve(res);
    });
  });
}
/**
 * write content to the host file
 * @param Array list
 */
function writeHost(list) {
  let lines = "";
  list.forEach(item => {
    if(!item.enable) {
      lines += `# ${item.ip} ${item.host}`;
    } else {
      lines += `${item.ip} ${item.host}`;
    }
    lines += os.EOL;
  });
  // console.log(lines.length, 'lines');
  return new Promise(function (resolve, reject) {
    fs.writeFile(HOSTS, lines, function (err) {
      if(err) {
        reject(err);
      } else {
        resolve({ok: true});
      }
    });
  });
}

function parseLine(line) {
  // ## 127.0.0.1 xxx.card.com
  var item = {};
  var validHostReg = /^(#+)?\d{3}\..+/;

  if(validHostReg.test(line)) {
    if(/^#/.test(line)) {
      item.enable = false;
    } else {
      item.enable = true;
    }
    var ipAndHost = line.replace('#', '').split(/\s+/);
    item.ip = ipAndHost[0];
    item.host = ipAndHost[1];

    return item;
  } else {
    return false;
  }
}
/**
 * show all the ip-host list
 * @param Array list 
 */
function showAll(list) {
  const table = new Table({
    head: ['status','ip', 'host']
  });
  const newlist = list.map(item=> Object.values(item));
  // console.log(newlist);
  table.push(...newlist);
  console.log(table.toString());
}
/**
 * add host to the host file
 * @param Array list
 * @param Object addItem
 */
function addHostIp(list, addItem) {
  const hasSameHost = list.filter(item=> item.host === addItem.host);
  addItem.enable = true;
  list.push(addItem);
  return writeHost(list);
}

