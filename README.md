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

# TODO
- (Kind of solved...) Allow a longer signalling period. It seems the connection setup will be timed out after 10 seconds, which is too short for doing manual offer/answer. 
- Currently it works only in intranet.
