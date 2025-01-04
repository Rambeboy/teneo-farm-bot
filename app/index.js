const axios = require("axios");
const chalk = require('chalk');
const WebSocket = require('ws');
const {
  HttpsProxyAgent
} = require("https-proxy-agent");
const fs = require('fs');
const readline = require("readline");
const keypress = require("keypress");
let sockets = [];
let pingIntervals = [];
let countdownIntervals = [];
let potentialPoints = [];
let countdowns = [];
let pointsTotals = [];
let pointsToday = [];
let lastUpdateds = [];
let messages = [];
let userIds = [];
let browserIds = [];
let proxies = [];
let accessTokens = [];
let accounts = [];
let useProxy = false;
let enableAutoRetry = false;
let currentAccountIndex = 0x0;
function loadAccounts() {
  if (!fs.existsSync("config.js")) {
    console.error("config.js not found. Please add the file with account data.");
    process.exit(0x1);
  }
  try {
    const _0x5e9ee6 = fs.readFileSync("config.js", 'utf8');
    accounts = _0x5e9ee6.split("\n").map(_0x41ba94 => {
      const [_0x267e79, _0x5b66b5] = _0x41ba94.split(',');
      if (_0x267e79 && _0x5b66b5) {
        return {
          'email': _0x267e79.trim(),
          'password': _0x5b66b5.trim()
        };
      }
      return null;
    }).filter(_0x2aff82 => _0x2aff82 !== null);
  } catch (_0x4116c9) {
    console.error("Failed to load accounts:", _0x4116c9);
  }
}
function loadProxies() {
  if (!fs.existsSync('proxy_list.js')) {
    console.error("proxy_list.js not found. Please add the file with proxy data.");
    process.exit(0x1);
  }
  try {
    const _0x65317 = fs.readFileSync('proxy_list.js', 'utf8');
    proxies = _0x65317.split("\n").map(_0x31d550 => _0x31d550.trim()).filter(_0x656dd5 => _0x656dd5);
  } catch (_0x264c0e) {
    console.error("Failed to load proxies:", _0x264c0e);
  }
}
function normalizeProxyUrl(_0x24bfbd) {
  if (!_0x24bfbd.startsWith("http://") && !_0x24bfbd.startsWith('https://')) {
    _0x24bfbd = "http://" + _0x24bfbd;
  }
  return _0x24bfbd;
}
function promptUseProxy() {
  return new Promise(_0x86fa55 => {
    displayHeader();
    const _0x3b3991 = readline.createInterface({
      'input': process.stdin,
      'output': process.stdout
    });
    _0x3b3991.question("Do you want to use a proxy? (y/n): ", _0x30db5d => {
      useProxy = _0x30db5d.toLowerCase() === 'y';
      _0x3b3991.close();
      _0x86fa55();
    });
  });
}
function promptEnableAutoRetry() {
  return new Promise(_0x218736 => {
    const _0x14e195 = readline.createInterface({
      'input': process.stdin,
      'output': process.stdout
    });
    _0x14e195.question("Do you want to enable auto-retry for account errors? (y/n): ", _0x3c9dea => {
      enableAutoRetry = _0x3c9dea.toLowerCase() === 'y';
      _0x14e195.close();
      _0x218736();
    });
  });
}
async function initialize() {
  loadAccounts();
  loadProxies();
  await promptUseProxy();
  await promptEnableAutoRetry();
  if (useProxy && proxies.length < accounts.length) {
    console.error("Not enough proxies for the number of accounts. Please add more proxies.");
    process.exit(0x1);
  }
  for (let _0x3a7e1a = 0x0; _0x3a7e1a < accounts.length; _0x3a7e1a++) {
    potentialPoints[_0x3a7e1a] = 0x0;
    countdowns[_0x3a7e1a] = "Calculating...";
    pointsTotals[_0x3a7e1a] = 0x0;
    pointsToday[_0x3a7e1a] = 0x0;
    lastUpdateds[_0x3a7e1a] = null;
    messages[_0x3a7e1a] = '';
    userIds[_0x3a7e1a] = null;
    browserIds[_0x3a7e1a] = null;
    accessTokens[_0x3a7e1a] = null;
    getUserId(_0x3a7e1a);
  }
  displayAccountData(currentAccountIndex);
  handleUserInput();
}
function generateBrowserId(_0x260938) {
  return 'browserId-' + _0x260938 + '-' + Math.random().toString(0x24).substring(0x2, 0xf);
}
function displayHeader() {
  const _0x4412a5 = process.stdout.columns;
  const _0x4ae171 = ["<|============================================|>", "                 TENEO NODE BOT                 ", "              Author : Nofan Rambe              ", '<|============================================|>'];
  console.log('');
  _0x4ae171.forEach(_0x17a351 => {
    const _0x1e667d = Math.max(0x0, Math.floor((_0x4412a5 - _0x17a351.length) / 0x2));
    console.log(chalk.green(" ".repeat(_0x1e667d) + _0x17a351));
  });
  console.log('');
  const _0x6919d4 = Math.max(0x0, Math.floor((_0x4412a5 - "Use 'A' to switch to the previous account, 'D' to switch to the next account, 'C' to exit.".length) / 0x2));
  console.log(chalk.cyan(" ".repeat(_0x6919d4) + "Use 'A' to switch to the previous account, 'D' to switch to the next account, 'C' to exit."));
}
function displayAccountData(_0x5511c3) {
  console.clear();
  displayHeader();
  const _0xf9c92c = process.stdout.columns;
  const _0x5866b8 = '_'.repeat(_0xf9c92c);
  const _0x2ac726 = "Account " + (_0x5511c3 + 0x1);
  const _0x5e3628 = Math.max(0x0, Math.floor((_0xf9c92c - _0x2ac726.length) / 0x2));
  console.log(chalk.cyan(_0x5866b8));
  console.log(chalk.cyan(" ".repeat(_0x5e3628) + chalk.bold(_0x2ac726)));
  console.log(chalk.cyan(_0x5866b8));
  console.log(chalk.whiteBright("Email         : " + accounts[_0x5511c3].email));
  console.log(chalk.whiteBright("User ID       : " + userIds[_0x5511c3]));
  console.log(chalk.whiteBright("Browser ID    : " + browserIds[_0x5511c3]));
  console.log(chalk.green("Points Total        : " + pointsTotals[_0x5511c3]));
  console.log(chalk.green("Points Today        : " + pointsToday[_0x5511c3]));
  console.log(chalk.whiteBright("Message       : " + messages[_0x5511c3]));
  const _0x1696ed = proxies[_0x5511c3 % proxies.length];
  if (useProxy && _0x1696ed) {
    console.log(chalk.whiteBright("Proxy       : " + _0x1696ed));
  } else {
    console.log(chalk.hex("#FFA500")("Proxy    : Not using proxy"));
  }
  console.log(chalk.cyan(_0x5866b8));
  console.log("\nStatus:");
  if (messages[_0x5511c3].startsWith('Error:')) {
    console.log(chalk.red("Account " + (_0x5511c3 + 0x1) + ": " + messages[_0x5511c3]));
  } else {
    console.log("Account " + (_0x5511c3 + 0x1) + ": Potential Points: " + potentialPoints[_0x5511c3] + ", Countdown: " + countdowns[_0x5511c3]);
  }
}
function handleUserInput() {
  keypress(process.stdin);
  process.stdin.on("keypress", (_0x32188c, _0x22e3c9) => {
    if (_0x22e3c9 && _0x22e3c9.name === 'a') {
      currentAccountIndex = (currentAccountIndex - 0x1 + accounts.length) % accounts.length;
      console.log("Switched to account index: " + currentAccountIndex);
      displayAccountData(currentAccountIndex);
    } else {
      if (_0x22e3c9 && _0x22e3c9.name === 'd') {
        currentAccountIndex = (currentAccountIndex + 0x1) % accounts.length;
        console.log("Switched to account index: " + currentAccountIndex);
        displayAccountData(currentAccountIndex);
      } else if (_0x22e3c9 && _0x22e3c9.name === 'c') {
        console.log("Exiting the script...");
        process.exit();
      }
    }
    if (_0x22e3c9 && _0x22e3c9.ctrl && _0x22e3c9.name === 'c') {
      process.stdin.pause();
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
}
async function connectWebSocket(_0x2764c7) {
  if (sockets[_0x2764c7]) {
    return;
  }
  const _0x166410 = "wss://secure.ws.teneo.pro/websocket?accessToken=" + encodeURIComponent(accessTokens[_0x2764c7]) + "&version=" + encodeURIComponent('v0.2');
  const _0x2901a4 = proxies[_0x2764c7 % proxies.length];
  const _0x4fd9c2 = useProxy && _0x2901a4 ? new HttpsProxyAgent(normalizeProxyUrl(_0x2901a4)) : null;
  sockets[_0x2764c7] = new WebSocket(_0x166410, {
    'agent': _0x4fd9c2
  });
  sockets[_0x2764c7].onopen = async () => {
    lastUpdateds[_0x2764c7] = new Date().toISOString();
    console.log("Account " + (_0x2764c7 + 0x1) + " Connected", lastUpdateds[_0x2764c7]);
    startPinging(_0x2764c7);
    startCountdownAndPoints(_0x2764c7);
  };
  sockets[_0x2764c7].onmessage = async _0x52227f => {
    const _0x437ac2 = JSON.parse(_0x52227f.data);
    if (_0x437ac2.pointsTotal !== undefined && _0x437ac2.pointsToday !== undefined) {
      lastUpdateds[_0x2764c7] = new Date().toISOString();
      pointsTotals[_0x2764c7] = _0x437ac2.pointsTotal;
      pointsToday[_0x2764c7] = _0x437ac2.pointsToday;
      messages[_0x2764c7] = _0x437ac2.message;
      if (_0x2764c7 === currentAccountIndex) {
        displayAccountData(_0x2764c7);
      }
    }
    if (_0x437ac2.message === "Pulse from server") {
      console.log("Pulse from server received for Account " + (_0x2764c7 + 0x1) + ". Start pinging...");
      setTimeout(() => {
        startPinging(_0x2764c7);
      }, 0x2710);
    }
  };
  sockets[_0x2764c7].onclose = () => {
    console.log("Account " + (_0x2764c7 + 0x1) + " Disconnected");
    reconnectWebSocket(_0x2764c7);
  };
  sockets[_0x2764c7].onerror = _0x558bc9 => {
    console.error("WebSocket error for Account " + (_0x2764c7 + 0x1) + ':', _0x558bc9);
  };
}
async function reconnectWebSocket(_0x180851) {
  const _0x56ec91 = "wss://secure.ws.teneo.pro/websocket?accessToken=" + encodeURIComponent(accessTokens[_0x180851]) + "&version=" + encodeURIComponent('v0.2');
  const _0x5c9d25 = proxies[_0x180851 % proxies.length];
  const _0xb36f20 = useProxy && _0x5c9d25 ? new HttpsProxyAgent(normalizeProxyUrl(_0x5c9d25)) : null;
  if (sockets[_0x180851]) {
    sockets[_0x180851].removeAllListeners();
  }
  sockets[_0x180851] = new WebSocket(_0x56ec91, {
    'agent': _0xb36f20
  });
  sockets[_0x180851].onopen = async () => {
    lastUpdateds[_0x180851] = new Date().toISOString();
    console.log("Account " + (_0x180851 + 0x1) + " Reconnected", lastUpdateds[_0x180851]);
    startPinging(_0x180851);
    startCountdownAndPoints(_0x180851);
  };
  sockets[_0x180851].onmessage = async _0x42e17e => {
    const _0x4a1d66 = JSON.parse(_0x42e17e.data);
    if (_0x4a1d66.pointsTotal !== undefined && _0x4a1d66.pointsToday !== undefined) {
      lastUpdateds[_0x180851] = new Date().toISOString();
      pointsTotals[_0x180851] = _0x4a1d66.pointsTotal;
      pointsToday[_0x180851] = _0x4a1d66.pointsToday;
      messages[_0x180851] = _0x4a1d66.message;
      if (_0x180851 === currentAccountIndex) {
        displayAccountData(_0x180851);
      }
    }
    if (_0x4a1d66.message === "Pulse from server") {
      console.log("Pulse from server received for Account " + (_0x180851 + 0x1) + ". Start pinging...");
      setTimeout(() => {
        startPinging(_0x180851);
      }, 0x2710);
    }
  };
  sockets[_0x180851].onclose = () => {
    console.log("Account " + (_0x180851 + 0x1) + " Disconnected again");
    setTimeout(() => {
      reconnectWebSocket(_0x180851);
    }, 0x1388);
  };
  sockets[_0x180851].onerror = _0x4c67ee => {
    console.error("WebSocket error for Account " + (_0x180851 + 0x1) + ':', _0x4c67ee);
  };
}
function startCountdownAndPoints(_0x4481ef) {
  clearInterval(countdownIntervals[_0x4481ef]);
  updateCountdownAndPoints(_0x4481ef);
  countdownIntervals[_0x4481ef] = setInterval(() => updateCountdownAndPoints(_0x4481ef), 0x3e8);
}
async function updateCountdownAndPoints(_0xf2c7ba) {
  const _0x423c81 = new Date();
  if (!lastUpdateds[_0xf2c7ba]) {
    lastUpdateds[_0xf2c7ba] = {};
  }
  if (countdowns[_0xf2c7ba] === "Calculating...") {
    const _0x258f51 = lastUpdateds[_0xf2c7ba].calculatingTime || _0x423c81;
    const _0x5a5fa2 = _0x423c81.getTime() - _0x258f51.getTime();
    if (_0x5a5fa2 > 0xea60) {
      reconnectWebSocket(_0xf2c7ba);
      return;
    }
  }
  if (lastUpdateds[_0xf2c7ba]) {
    const _0x37312f = new Date(lastUpdateds[_0xf2c7ba]);
    _0x37312f.setMinutes(_0x37312f.getMinutes() + 0xf);
    const _0x63bd38 = _0x37312f.getTime() - _0x423c81.getTime();
    if (_0x63bd38 > 0x0) {
      const _0x318485 = Math.floor(_0x63bd38 / 0xea60);
      const _0x3f0021 = Math.floor(_0x63bd38 % 0xea60 / 0x3e8);
      countdowns[_0xf2c7ba] = _0x318485 + "m " + _0x3f0021 + 's';
      const _0x115998 = _0x423c81.getTime() - new Date(lastUpdateds[_0xf2c7ba]).getTime();
      const _0x514d9c = _0x115998 / 60000;
      let _0x26f2dc = Math.min(0x19, _0x514d9c / 0xf * 0x19);
      _0x26f2dc = parseFloat(_0x26f2dc.toFixed(0x2));
      if (Math.random() < 0.1) {
        const _0x5354e0 = Math.random() * 0x2;
        _0x26f2dc = Math.min(0x19, _0x26f2dc + _0x5354e0);
        _0x26f2dc = parseFloat(_0x26f2dc.toFixed(0x2));
      }
      potentialPoints[_0xf2c7ba] = _0x26f2dc;
    } else {
      countdowns[_0xf2c7ba] = "Calculating, it might take a minute before starting...";
      potentialPoints[_0xf2c7ba] = 0x19;
      lastUpdateds[_0xf2c7ba].calculatingTime = _0x423c81;
    }
  } else {
    countdowns[_0xf2c7ba] = "Calculating, it might take a minute before starting...";
    potentialPoints[_0xf2c7ba] = 0x0;
    lastUpdateds[_0xf2c7ba].calculatingTime = _0x423c81;
  }
  if (_0xf2c7ba === currentAccountIndex) {
    displayAccountData(_0xf2c7ba);
  }
}
function startPinging(_0x30b5c3) {
  pingIntervals[_0x30b5c3] = setInterval(async () => {
    if (sockets[_0x30b5c3] && sockets[_0x30b5c3].readyState === WebSocket.OPEN) {
      const _0x4610ed = proxies[_0x30b5c3 % proxies.length];
      const _0x391ea7 = useProxy && _0x4610ed ? new HttpsProxyAgent(normalizeProxyUrl(_0x4610ed)) : null;
      sockets[_0x30b5c3].send(JSON.stringify({
        'type': "PING"
      }), {
        'agent': _0x391ea7
      });
      if (_0x30b5c3 === currentAccountIndex) {
        displayAccountData(_0x30b5c3);
      }
    }
  }, 0xea60);
}
function stopPinging(_0x56c600) {
  if (pingIntervals[_0x56c600]) {
    clearInterval(pingIntervals[_0x56c600]);
    pingIntervals[_0x56c600] = null;
  }
}
function restartAccountProcess(_0x52c978) {
  disconnectWebSocket(_0x52c978);
  connectWebSocket(_0x52c978);
  console.log("WebSocket restarted for index: " + _0x52c978);
}
async function getUserId(_0x17df3c) {
  const _0x2467b4 = proxies[_0x17df3c % proxies.length];
  const _0x2eda59 = useProxy && _0x2467b4 ? new HttpsProxyAgent(normalizeProxyUrl(_0x2467b4)) : null;
  try {
    const _0x8abe17 = await axios.post("https://auth.teneo.pro/api/login", {
      'email': accounts[_0x17df3c].email,
      'password': accounts[_0x17df3c].password
    }, {
      'httpsAgent': _0x2eda59,
      'headers': {
        'Authorization': "Bearer " + accessTokens[_0x17df3c],
        'Content-Type': "application/json",
        'authority': 'auth.teneo.pro',
        'x-api-key': "OwAG3kib1ivOJG4Y0OCZ8lJETa6ypvsDtGmdhcjA"
      }
    });
    const {
      user: _0xa43deb,
      access_token: _0x205eb1
    } = _0x8abe17.data;
    userIds[_0x17df3c] = _0xa43deb.id;
    accessTokens[_0x17df3c] = _0x205eb1;
    browserIds[_0x17df3c] = 'browserId-' + _0x17df3c + '-' + Math.random().toString(0x24).substring(0x2, 0xf);
    messages[_0x17df3c] = "Connected successfully";
    if (_0x17df3c === currentAccountIndex) {
      displayAccountData(_0x17df3c);
    }
    console.log("User Data for Account " + (_0x17df3c + 0x1) + ':', _0xa43deb);
    startCountdownAndPoints(_0x17df3c);
    await connectWebSocket(_0x17df3c);
  } catch (_0x245120) {
    const _0x3fea12 = _0x245120.response ? _0x245120.response.data.message : _0x245120.message;
    messages[_0x17df3c] = "Error: " + _0x3fea12;
    if (_0x17df3c === currentAccountIndex) {
      displayAccountData(_0x17df3c);
    }
    console.error("Error for Account " + (_0x17df3c + 0x1) + ':', _0x3fea12);
    if (enableAutoRetry) {
      console.log("Retrying account " + (_0x17df3c + 0x1) + " in 3 minutes...");
      setTimeout(() => getUserId(_0x17df3c), 0x2bf20);
    }
  }
}
initialize();
