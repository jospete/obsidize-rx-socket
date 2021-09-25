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

### Example

The below example uses a socket instance for both the client and the server.

However, when using this in your app you should only use this module as either the client or the server, 
but **not** both (unless you like talking to yourself).

```typescript
import { RxJsonSocket } from '@obsidize/rx-socket';
import { delay, first, tap } from 'rxjs/operators';

const sendMessage = { message: 'hello' };
const receiveMessage = { message: 'world!' };

const client = new RxJsonSocket();
const server = new RxJsonSocket();

client.setBufferReceiveSource(server.bufferStream.onSend.pipe(
	delay(10),
));

server.setBufferReceiveSource(client.bufferStream.onSend.pipe(
	delay(10),
	tap(() => server.emit(receiveMessage))
));

client.textStream.onSend.subscribe(v => console.log('client textStream.onSend: ' + v));
client.textStream.onReceive.subscribe(v => console.log('client textStream.onReceive: ' + v));

server.textStream.onSend.subscribe(v => console.log('server textStream.onSend: ' + v));
server.textStream.onReceive.subscribe(v => console.log('server textStream.onReceive: ' + v));

// The client and server sockets are "glued together" in such a way that we can
// send a message and wait for a response all in one go - much like an HTTP or websocket request.
const serverResponse = await client.send(sendMessage)
	.pipe(first())
	.toPromise();

console.log(serverResponse); // { message: 'world!' }
```

See the [General Usage](https://github.com/jospete/obsidize-rx-socket/blob/master/tests/general-usage.spec.ts)
and [RxSocketSubject](https://github.com/jospete/obsidize-rx-socket/blob/master/tests/rx-socket-subject.spec.ts)
test suites to get a feel for how to use this module.

## API

Source documentation can be found [here](https://jospete.github.io/obsidize-rx-socket/)