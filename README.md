# From Me To You
It is a P2P file transfer utility based on WebRTC. The connection is to be set up manually. That means it does not even rely on any signalling server.

## Setting up the connection
1. Choose "send file"(the offer side) or "receive file"(the answer side)
2. If you are the offer side:

    1. Generate the offer
    2. Copy the offer to your peer
    3. Wait for your peer to send you back their answer
    4. Paste their answer, press enter
3. If you are the answer side:

    1. Wait for your peer to send you their offer
    2. Paste their offer, press enter
    3. Copy your answer, and send it back to your peer
    4. "Wait until your peer has received your text", and press the button with the aforementioned text 
4. File transfer and chat are then available. Either the offer side or the answer side can initiate the transfer. 

## Getting around NAT
If your devices are behind NAT, you probably need a TURN server. You might want to try an open source TURN server called [Coturn](https://github.com/coturn/coturn). The TURN server acts as a relay to help the endpoint peers to exchange messages. Using it does not break the end-to-end encryption.

The ports TCP 3478 and UDP 3478 of the server hosting the your TURN server have to be opened. Once you have set up the firewall and the TURN server, you can add and entry in *iceServers* in connection.js as follows:
```
{
      urls: "turn:some.server.com:3478",
      username: "user",
      credential: "a very good and hard to guess password that is very looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong"
}

```

# TODO
- (Kind of solved...) Allow a longer signalling period. It seems the connection setup will be timed out after 10 seconds, which is too short for doing manual offer/answer. 
- The connection still cannot be established when one of the peer is using VPN. I am figuring out the reason.
- Better UI and UX
- Running free TURN servers for the public?
