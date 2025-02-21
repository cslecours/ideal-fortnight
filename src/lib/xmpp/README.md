# SASL Auth

Supported SASL Mechanisms
- `PLAIN`
- `X-OAUTH2`

Not yet supported : `ANONYMOUS`, `SCRAM`

## More Information
For more information on SASL mechanisms, you can refer to the following resources:
- [RFC 4422 - Simple Authentication and Security Layer (SASL)](https://tools.ietf.org/html/rfc4422)
- [Wikipedia - Simple Authentication and Security Layer](https://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer)
- [XMPP Standards Foundation - SASL](https://xmpp.org/extensions/xep-0175.html)

# Disco

## XMPP Disco Support

XMPP Disco (Service Discovery) allows XMPP entities to discover information about other XMPP entities. This includes discovering supported features, identities, and items associated with an entity.

### Supported Features
- Service discovery information queries (`disco#info`)
- Service discovery items queries (`disco#items`)

### Usage
To use XMPP Disco in your application, you can utilize the `DiscoPlugin` class provided in the library. Here is an example of how to send disco info and item queries:

```ts
import { DiscoPlugin } from "./disco/discoPlugin"
import { XMPPConnection } from "./XMPPConnection"

const connection = new XMPPConnection()
const disco = new DiscoPlugin(connection)

disco.sendDiscoInfoQuery("example.com").then((info) => {
    console.log("Disco Info:", info)
})

disco.sendDiscoItemQuery("example.com").then((items) => {
    console.log("Disco Items:", items)
})
```

### More Information
For more information on XMPP Disco, you can refer to the following resources:
- [XMPP Standards Foundation - XEP-0030: Service Discovery](https://xmpp.org/extensions/xep-0030.html)
- [Wikipedia - XMPP Service Discovery](https://en.wikipedia.org/wiki/XMPP_Service_Discovery)

# MUC (Multi-User Chat)

## XMPP MUC Support

XMPP MUC (Multi-User Chat) allows multiple XMPP users to join a chat room and communicate with each other in real-time.

### Supported Features
- Creating and joining chat rooms
- Sending and receiving messages in chat rooms
- Managing chat room configurations and permissions

### Usage
To use XMPP MUC in your application, you can utilize the `MUCPlugin` class provided in the library. Here is an example of how to join a chat room and send a message:

```ts
import { MUCPlugin } from "./muc/mucPlugin"
import { XMPPConnection } from "./XMPPConnection"

const connection = new XMPPConnection()
const muc = new MUCPlugin(connection)

muc.joinRoom("room@example.com", "nickname").then(() => {
    console.log("Joined the room")
    muc.sendMessage("room@example.com", "Hello everyone!")
})

muc.onMessage((message) => {
    console.log("Received message:", message)
})
```

### More Information
For more information on XMPP MUC, you can refer to the following resources:
- [XMPP Standards Foundation - XEP-0045: Multi-User Chat](https://xmpp.org/extensions/xep-0045.html)
- [Wikipedia - XMPP Multi-User Chat](https://en.wikipedia.org/wiki/XMPP_Multi-User_Chat)


# Roster

## XMPP Roster Support

XMPP Roster allows users to manage their contact list, including adding, removing, and updating contacts.

### Supported Features
- Adding contacts to the roster
- Removing contacts from the roster
- Updating contact information
- Retrieving the roster list

### Usage
To use XMPP Roster in your application, you can utilize the `RosterPlugin` class provided in the library. Here is an example of how to manage the roster:

```ts
import { RosterPlugin } from "./roster/rosterPlugin"
import { XMPPConnection } from "./XMPPConnection"

const connection = new XMPPConnection()
const roster = new RosterPlugin(connection)

roster.addContact("contact@example.com", "Contact Name").then(() => {
    console.log("Contact added")
})

roster.removeContact("contact@example.com").then(() => {
    console.log("Contact removed")
})

roster.getRoster().then((contacts) => {
    console.log("Roster:", contacts)
})
```

### More Information
For more information on XMPP Roster, you can refer to the following resources:
- [XMPP Standards Foundation - XEP-0045: Roster](https://xmpp.org/extensions/xep-0045.html)
- [Wikipedia - XMPP Roster](https://en.wikipedia.org/wiki/XMPP_Roster)

# Stream Management

## XMPP Stream Management Support

XMPP Stream Management (XEP-0198) provides a mechanism for managing and resuming XMPP streams, ensuring reliable delivery of stanzas.

### Supported Features
- Stream resumption
- Acknowledgment of stanzas
- Handling of stream errors

### Usage
To use XMPP Stream Management in your application, you can utilize the `StreamManagementPlugin` class provided in the library. Here is an example of how to enable stream management and handle stream resumption:

```ts
import { StreamManagementPlugin } from "./streamManagement/streamManagementPlugin"
import { XMPPConnection } from "./XMPPConnection"

const connection = new XMPPConnection()
const streamManagement = new StreamManagementPlugin(connection)

streamManagement.enable().then(() => {
    console.log("Stream Management enabled")
})

connection.onStreamResumed(() => {
    console.log("Stream resumed")
})

connection.onStreamError((error) => {
    console.error("Stream error:", error)
})
```

### More Information
For more information on XMPP Stream Management, you can refer to the following resources:
- [XMPP Standards Foundation - XEP-0198: Stream Management](https://xmpp.org/extensions/xep-0198.html)
- [Wikipedia - XMPP Stream Management](https://en.wikipedia.org/wiki/XMPP_Stream_Management)

# Carbons

## XMPP Carbons Support

XMPP Carbons (XEP-0280) allows message synchronization across multiple clients of the same user, ensuring that all clients receive the same messages.

### Supported Features
- Sending carbons-enabled messages
- Receiving carbons-enabled messages
- Synchronizing messages across multiple clients

### Usage
To use XMPP Carbons in your application, you can utilize the `CarbonsPlugin` class provided in the library. Here is an example of how to enable carbons and handle incoming carbon messages:

```ts
import { CarbonsPlugin } from "./carbons/carbonsPlugin"
import { XMPPConnection } from "./XMPPConnection"

const connection = new XMPPConnection()
const carbons = new CarbonsPlugin(connection)

carbons.enable().then(() => {
    console.log("Carbons enabled")
})

carbons.onCarbonReceived((carbon) => {
    console.log("Received carbon message:", carbon)
})
```

### More Information
For more information on XMPP Carbons, you can refer to the following resources:
- [XMPP Standards Foundation - XEP-0280: Message Carbons](https://xmpp.org/extensions/xep-0280.html)
- [Wikipedia - XMPP Message Carbons](https://en.wikipedia.org/wiki/XMPP_Message_Carbons)

# PubSub

## XMPP PubSub Support

XMPP PubSub (Publish-Subscribe) allows XMPP entities to publish information to nodes and subscribe to receive updates from those nodes.

### Supported Features
- Creating and deleting nodes
- Publishing items to nodes
- Subscribing and unsubscribing from nodes
- Receiving notifications of published items

### Usage
To use XMPP PubSub in your application, you can utilize the `PubSubPlugin` class provided in the library. Here is an example of how to create a node, publish an item, and subscribe to a node:

```ts
import { PubSubPlugin } from "./pubsub/pubSubPlugin"
import { XMPPConnection } from "./XMPPConnection"

const connection = new XMPPConnection()
const pubsub = new PubSubPlugin(connection)

pubsub.createNode("exampleNode").then(() => {
    console.log("Node created")
    return pubsub.publishItem("exampleNode", { content: "Hello, PubSub!" })
}).then(() => {
    console.log("Item published")
    return pubsub.subscribe("exampleNode")
}).then(() => {
    console.log("Subscribed to node")
})

pubsub.onItemPublished((item) => {
    console.log("Received published item:", item)
})
```

### More Information
For more information on XMPP PubSub, you can refer to the following resources:
- [XMPP Standards Foundation - XEP-0060: Publish-Subscribe](https://xmpp.org/extensions/xep-0060.html)
- [Wikipedia - XMPP Publish-Subscribe](https://en.wikipedia.org/wiki/XMPP_PubSub)

# Message Archive Management (MAM)

## XMPP MAM Support

XMPP Message Archive Management (XEP-0313) allows for the archiving and retrieval of messages on the server, enabling users to access their message history.

### Supported Features
- Archiving messages
- Retrieving archived messages
- Filtering archived messages by various criteria

### Usage
To use XMPP MAM in your application, you can utilize the `MAMPlugin` class provided in the library. Here is an example of how to archive messages and retrieve archived messages:

```ts
import { MAMPlugin } from "./mam/mamPlugin"
import { XMPPConnection } from "./XMPPConnection"

const connection = new XMPPConnection()
const mam = new MAMPlugin(connection)

mam.archiveMessage("contact@example.com", "Hello, this is a test message").then(() => {
    console.log("Message archived")
})

mam.retrieveArchivedMessages("contact@example.com").then((messages) => {
    console.log("Archived messages:", messages)
})
```

### More Information
For more information on XMPP MAM, you can refer to the following resources:
- [XMPP Standards Foundation - XEP-0313: Message Archive Management](https://xmpp.org/extensions/xep-0313.html)
- [Wikipedia - XMPP Message Archive Management](https://en.wikipedia.org/wiki/XMPP_Message_Archive_Management)

# Roadmap

While this library already supports a wide range of XMPP features, there are still some areas for future development and improvement:

- **ANONYMOUS and SCRAM SASL Mechanisms**: Adding support for additional SASL mechanisms like ANONYMOUS and SCRAM to enhance authentication options.
- **Advanced MUC Features**: Implementing more advanced features for multi-user chat, such as room administration and moderation tools.
- **Enhanced PubSub Capabilities**: Expanding the publish-subscribe functionality to support more complex use cases and configurations.
- **Improved Error Handling**: Enhancing error handling and reporting mechanisms to provide better feedback and debugging information.
- **Performance Optimization**: Continuously optimizing the performance of the library to handle larger volumes of data and more concurrent connections.
- **Documentation and Examples**: Adding more detailed documentation and usage examples to help developers get started quickly and understand advanced use cases.

By addressing these areas, we aim to make this XMPP client library even more robust and versatile for a wide range of applications.

Stay tuned for updates and new features!

