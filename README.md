# pia

Display public and private IP address. (use STUN server)

## Installation

``` bash
$ [sudo] npm install -g pia
```

## Usage

```
$ pia
$ pia -j -g -i -t
$ pia --display-stun --specify-stun "stun.l.google.com:19302"
```

## Practical Use

```
$ pia -s | xargs whois
```

## Options

```
-a, --all               Display all information.
-g, --global            Display global information.
-l, --local             Display local information.
-i, --ip, --ip-address  Display ip address.
-p, --port              Display port.
-j, --json              Display json.
-s, --simple            Display simple style. (print without captions / JSON without space)
-t, --type              Display NAT type.
-h, --help              Display help.
--specify-stun          Specify STUN Server.
--display-stun          Display STUN Server.
--debug                 Debug mode.
```
