# @obsidize/rx-socket

An rxjs-based implementation of a standard duplex socket.

This implementation does not know (or care really) about the transport layer where the data ultimately ends up.
Rather, this allows for a compact and efficient way of linking send and receive streams in order to do the heavy lifting for "round-trip" protocols.

## Installation

- npm:

```bash
npm install --save @obsidize/rx-socket
```

- git:

```bash
npm install --save git+https://github.com/jospete/obsidize-rx-socket.git
```

## Usage

See the [General Usage](https://github.com/jospete/obsidize-rx-socket/blob/master/tests/general-usage.spec.ts)
and [RxSocketSubject](https://github.com/jospete/obsidize-rx-socket/blob/master/tests/rx-socket-subject.spec.ts)
test suites to get a feel for how to use this module.

## API

Source documentation can be found [here](https://jospete.github.io/obsidize-rx-socket/)