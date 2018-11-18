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
const chalk = require("chalk");
const chmod = require("chmod");
const logSymbols = require("log-symbols");
const cfonts = require("cfonts");


var WINDOWS = process.platform === 'win32'
var EOL = WINDOWS ?
  '\r\n' :
  '\n'
const VERSION = require('../package.json').version;
const APP_NAME = require('../package.json').name;
const HOSTS = WINDOWS ?
  'C:/Windows/System32/drivers/etc/hosts' :
  '/etc/hosts';


/**
 * 获取所有对象的values 返回一个数组
 * @param {Object} obj which one need get it's all values
 */
const values = (function () {
  return typeof Object.values === 'function' ?
    Object.values : function (obj) {
      var _ret = [];
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const element = obj[key];
          _ret.push(element);
        }
      }
      return _ret;
    }
})();

// 输出命令

program
  .version(VERSION)
  .command('list')
  .description("list all the configurated host")
  .action(function () {
    readHost().then(res => showAll(res));
  })
// add host => ip
program
  .command('add <host> [ip]')
  .description('add [ip => host] to the hosts')
  .action(function (host, ip = "127.0.0.1") {
    readHost()
      .then(res => {
        return addHostIp(res, {
          host,
          ip
        })
      })
      .then(() => {
        console.log(logSymbols.success, chalk.red.bold(`add ${host}=>${ip} successfully~`));
      }).catch(err => {
        console.log(logSymbols.error, chalk.bold.red(`failed to add ${host}=>${ip}`));
        console.log(`Error is ${err}`);
      });
  })
// remove host from the hosts
program
  .command('remove <host>')
  .description('remove host from the hosts')
  .action(function (host) {
    readHost()
      .then(res => removeHost(res, host))
      .then(() => {
        console.log(logSymbols.success, chalk.red.bold(`remove ${host} successfully~`));
      }).catch(err => {
        console.log(logSymbols.error, chalk.bold.red(`failed to remove ${host}`));
        console.log(`Error is ${err}`);
      });
  })

// enable the target host
program
  .command('enable <host>')
  .description('enable the target host')
  .action(function (host) {
    readHost()
      .then(res => enableHost(res, host))
      .then(() => {
        console.log(logSymbols.success, chalk.red.bold(`enable ${host} successfully~`));
      }).catch(err => {
        console.log(logSymbols.error, chalk.bold.red(`failed to enable ${host}`));
        console.log(`Error is ${err}`);
      });
  })
// disable the target host
program
  .command('disable <host>')
  .description('disable the target host')
  .action(function (host) {
    readHost()
      .then(res => disableHost(res, host))
      .then(() => {
        console.log(logSymbols.success, chalk.red.bold(`disable ${host} successfully~`));
      }).catch(err => {
        console.log(logSymbols.error, chalk.bold.red(`failed to disable ${host}`));
        console.log(`Error is ${err}`);
      });
  })
// chmod 666 on your hosts file
program
  .command('no-pwd')
  .description('chmod 666 on your hosts file so you don\'t need input pwd')
  .action(function (host) {
    const error = chmod(HOSTS, 666);
    if (error) {
      console.log(logSymbols.error, chalk.bold.red(`failed to chmod ${HOSTS}`));
      console.log(`Error is ${error}`);
    } else {
      console.log(logSymbols.success, chalk.red.bold(`never need input pwd~`));
    }
  })

program.parse(process.argv)

// no sub command 
if (!process.argv.slice(2).length) {
  cfonts.say(APP_NAME)
}

/**
 * read hosts content
 * @returns Promise
 */
function readHost() {
  const rl = readline.createInterface({
    input: fs.createReadStream(HOSTS)
  });
  const res = [];
  return new Promise(function (resolve, reject) {
    rl.on('line', (line) => {
      var item;
      if (item = parseLine(line)) {
        res.push(item);
      }
    }).on('close', function () {
      // console.log(res, 'res');
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
    if (!item.enable) {
      lines += `# ${item.ip} ${item.host}`;
    } else {
      lines += `${item.ip} ${item.host}`;
    }
    lines += os.EOL;
  });
  // 
  return new Promise(function (resolve, reject) {
    fs.writeFile(HOSTS, lines, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          ok: true
        });
      }
    });
  });
}
/**
 * parse hosts contents'line
 * @param {String} line one line of hosts file content
 */
function parseLine(line) {
  // ## 127.0.0.1 xxx.card.com
  var item = {};
  var validHostReg = /^(#+)?\s*\d{1,3}\..+/;
  // console.log(line, "line");
  if (validHostReg.test(line)) {
    if (/^#/.test(line)) {
      item.enable = false;
    } else {
      item.enable = true;
    }
    var ipAndHost = line.replace('#', '').replace(/(^\s+|\s+$)/, '').split(/\s+/);

    item.host = ipAndHost[1];
    item.ip = ipAndHost[0];

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
    head: ['status', 'host', 'ip']
  });
  const newlist = list.map(item => values(item));
  // console.log(newlist);
  table.push(...newlist);
  console.log(chalk.yellow(table.toString()));
}
/**
 * add host to the host file
 * @param Array list
 * @param Object addItem
 */
function addHostIp(list, addItem) {
  const hasSameHost = list.filter(item => item.host === addItem.host);
  addItem.enable = true;
  list.push(addItem);
  return writeHost(list);
}

/**
 * remove all lines from hosts
 */
function removeHost(res, host) {
  const list = res.filter(item => item.host !== host);

  return writeHost(list);
}

/**
 * enable target host
 * @param {Array} res hosts list
 * @param {String} host which host youo will enable 
 */
function enableHost(res, host) {
  const list = res.map(item => {
    if (item.host === host) {
      item.enable = true;
    }
    return item;
  })
  return writeHost(list);
}

/**
 * disable target host
 * @param {Array} res hosts list
 * @param {String} host which host youo will disable 
 */
function disableHost(res, host) {
  const list = res.map(item => {
    if (item.host === host) {
      item.enable = false;
    }
    return item;
  })
  return writeHost(list);
}