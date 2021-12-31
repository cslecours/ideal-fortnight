# TODO

## Roster Versionning
https://datatracker.ietf.org/doc/html/rfc6121#section-2.6

## Reconnection 
3.3.  Reconnection
It can happen that an XMPP server goes offline unexpectedly while servicing TCP connections from connected clients and remote servers. Because the number of such connections can be quite large, the reconnection algorithm employed by entities that seek to reconnect can have a significant impact on software performance and network congestion. If an entity chooses to reconnect, it:

SHOULD set the number of seconds that expire before reconnecting to an unpredictable number between 0 and 60 (this helps to ensure that not all entities attempt to reconnect at exactly the same number of seconds after being disconnected).
SHOULD back off increasingly on the time between subsequent reconnection attempts (e.g., in accordance with "truncated binary exponential backoff" as described in [ETHERNET]) if the first reconnection attempt does not succeed.
It is RECOMMENDED to make use of TLS session resumption [TLS‑RESUME] when reconnecting. A future version of this document, or a separate specification, might provide more detailed guidelines regarding methods for speeding the reconnection process.


## Stream Management

3.4.  Reliability
The use of long-lived TCP connections in XMPP implies that the sending of XML stanzas over XML streams can be unreliable, since the parties to a long-lived TCP connection might not discover a connectivity disruption in a timely manner. At the XMPP application layer, long connectivity disruptions can result in undelivered stanzas. Although the core XMPP technology defined in this specification does not contain features to overcome this lack of reliability, there exist XMPP extensions for doing so (e.g., [XEP‑0198]).


## Compliance suite

https://xmpp.org/extensions/xep-0459.html


## Roster Plugin support 
2. Roster
- No Groups
- No Roster Versionning
    <ver xmlns='urn:xmpp:features:rosterver'/>

3. Presence

- No Pre-Approval
    <sub xmlns='urn:xmpp:features:pre-approval'/>

4. Presence

5. Exchanging Messages
