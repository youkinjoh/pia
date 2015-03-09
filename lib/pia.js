var stun = require('vs-stun');
var url = require('url');

var opts = require('optimist')
         . usage([
           'Display public and private IP address. (use STUN server)',
           '',
           'Usage:',
           '  $0',
           '  $0 -j -g -i -t',
           '  $0 --display-stun --specify-stun "stun.l.google.com:19302"'
         ].join('\n'))
         . boolean(['a', 'g', 'l', 'i', 'p', 'j', 's', 't', 'h', 'display-stun', 'debug'])
         . string(['display-stun', 'specify-stun'])
         . alias('a', 'all')
         . alias('g', 'global')
         . alias('l', 'local')
         . alias('i', 'ip')
         . alias('i', 'ip-address')
         . alias('p', 'port')
         . alias('j', 'json')
         . alias('s', 'simple')
         . alias('t', 'type')
         . alias('h', 'help')
         . describe('a', 'Display all information.')
         . describe('g', 'Display global information.')
         . describe('l', 'Display local information.')
         . describe('i', 'Display ip address.')
         . describe('p', 'Display port.')
         . describe('j', 'Display json.')
         . describe('s', 'Display simple style. (print without captions / JSON without space)')
         . describe('t', 'Display NAT type.')
         . describe('h', 'Display help.')
         . describe('specify-stun', 'Specify STUN Server.')
         . describe('display-stun', 'Display STUN Server.')
         . describe('debug', 'Debug mode.')
         ;

var argv = opts.argv;

if (argv['debug']) {
  console.log('----------');
  console.log('argv');
  console.log(argv);
}

if (argv['help']) {
  opts.showHelp();
  return;
}

if (argv['all']) {
  argv['g'] = argv['global'] = true;
  argv['l'] = argv['local']  = true;
  argv['i'] = argv['ip']     = argv['ip-address'] = true;
  argv['p'] = argv['port']   = true;
  argv['t'] = argv['type']   = true;
}

if (!argv['all'] && !argv['global'] && !argv['local'] && !argv['ip'] && !argv['port'] && !argv['type']) {
  argv['g'] = argv['global'] = true;
  argv['i'] = argv['ip']     = argv['ip-address'] = true;
}
/*
if (!argv['global'] && !argv['local'] && !argv['type']) {
  argv['g'] = argv['global'] = true;
}

if (!argv['ip'] && !argv['port'] && !argv['type']) {
  argv['i'] = argv['ip']     = argv['ip-address'] = true;
}
*/
if ((argv['global'] ^ argv['local']) && (!argv['ip'] && !argv['port'])) {
  argv['i'] = argv['ip']     = argv['ip-address'] = true;
}
if ((!argv['global'] && !argv['local']) && (argv['ip'] ^ argv['port'])) {
  argv['g'] = argv['global'] = true;
}
if ((argv['global'] || argv['local']) && (!argv['ip'] && !argv['port'])) {
  argv['i'] = argv['ip']     = argv['ip-address'] = true;
}
if ((!argv['global'] && !argv['local']) && (argv['ip'] || argv['port'])) {
  argv['g'] = argv['global'] = true;
}

if (argv['debug']) {
  console.log('----------');
  console.log('argv(normalize)');
  console.log(argv);
}

var captions = argv['simple'] ?
               {
                 global_ip  : '',
                 global_port: '',
                 local_ip   : '',
                 local_port : '',
                 nat_type   : ''
               }:{
                 global_ip  : 'global IP address :',
                 global_port: 'global port       :',
                 local_ip   : 'local IP address  :',
                 local_port : 'local port        :',
                 nat_type   : 'NAT type          :'
               };

var server = null;
if (argv['specify-stun']) {
  server = parseSTUN(argv['specify-stun']);
  server.port = server.port || 3478;
} else {
  server = {
    host: 'stun.l.google.com',
    port: 19302
  };
}

if (argv['display-stun']) {
  console.log('STUN host :' + server.host);
  console.log('STUN port :' + server.port);
}

function parseSTUN(url) {
  var match = null;
  match = url.match(/^stun:([^:]+):([0-9]+)\/?.*$/);
  if (match) {
    return {
      host: match[1],
      port: parseInt(match[2], 10)
    };
  }
  match = url.match(/^stun:([^:]+)\/?.*$/);
  if (match) {
    return {
      host: match[1]
    };
  }
  match = url.match(/^([^:]+):([0-9]+)\/?.*$/);
  if (match) {
    return {
      host: match[1],
      port: parseInt(match[2], 10)
    };
  }
  match = url.match(/^([^:]+)\/?.*$/);
  if (match) {
    return {
      host: match[1]
    };
  }
}

var callback = function callback (error, socket) {
  if (error) {
    console.log('error: ' + error);
    return;
  }
  socket.close();
  var result = socket.stun;
  if (argv['debug']) {
    console.log('----------');
    console.log('socket');
    console.log(socket);
  }
  result.global = result.public;
  result.global.ip_address = result.global.host;
  result.local.ip_address = result.local.host;
  delete result.public;
  delete result.global.host;
  delete result.local.host;
  if (argv['debug']) {
    console.log('----------');
    console.log('result');
    console.log(result);
  }
  if (argv['debug']) {
    console.log('----------');
  }
  if (argv['json']) {
    var data = Object.create(null);
    if (argv['global'] && (argv['ip'] || argv['port'])) {
      data.global = Object.create(null);
    }
    if (argv['local'] && (argv['ip'] || argv['port'])) {
      data.local = Object.create(null);
    }
    if (argv['global'] && argv['ip']) {
      data.global.ip_address = result.global.ip_address;
    }
    if (argv['global'] && argv['port']) {
      data.global.port = result.global.port;
    }
    if (argv['local'] && argv['ip']) {
      data.local.ip_address = result.local.ip_address;
    }
    if (argv['local'] && argv['port']) {
      data.local.port = result.local.port;
    }
    if (argv['type']) {
      data.type = result.type;
    }
    if (argv['simple']) {
      console.log(JSON.stringify(data, null, null));
    } else {
      console.log(JSON.stringify(data, null, '  '));
    }
  } else {
    if (argv['global'] && argv['ip']) {
      console.log(captions.global_ip + result.global.ip_address);
    }
    if (argv['global'] && argv['port']) {
      console.log(captions.global_port + result.global.port);
    }
    if (argv['local'] && argv['ip']) {
      console.log(captions.local_ip  + result.local.ip_address);
    }
    if (argv['local'] && argv['port']) {
      console.log(captions.local_port  + result.local.port);
    }
    if (argv['type']) {
      console.log(captions.nat_type    + result.type);
    }
  }
};

stun.connect(server, callback);
