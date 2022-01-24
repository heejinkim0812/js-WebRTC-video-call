# js-WebRTC-video-call

simple 1-on-1 Private Video Call  
Used NodeJS, express, SocketIO, WebRTC, Pug (Template Engine), and CSS/vanilla-JS.

Using WebRTC, all the video, audio, and text messages does not pass to the server.  
Only the participants share the contents; (Signaling) server only used to create connections between the peers.  
</br>

![1](https://user-images.githubusercontent.com/71063574/150798955-486ff641-6502-44fd-9b74-ab3b5fcd10c4.jpg)
![2](https://user-images.githubusercontent.com/71063574/150798962-faa8d9ce-25e5-4dc7-a608-bd2601a253e8.jpg)

## Feature List

- Create Private Video Call Rooms (SocketIO)
- Establish WebRTC Connection between peers to stream video/audio/text
  - Use SocketIO for signaling server
  - Offer/Answer/IceCandidate/AddStream
- Change Camera (Sender)
- Add list of google STUN servers

## What I Learn

- [**video element**](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Video) is used to show live video retrieved from camera.
  - [**HTMLMediaElement.srcObject**](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject) indicates the MediaStream/MediaSource/File that the HTMLMediaElement currently showing.
  - [**navigator.mediaDevices.getUserMedia()**](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) is used to retrive list of available media input/stream (webcam, etc.).
    - Can put **constraint** as a argument (which media is required).
      - To select specific camera, put deviceId of the camera to the constraint.
  - [**MediaStream.getTracks()**](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getTracks#browser_compatibility) is used to retrieve all MediaStreamTrack of the MediaStream.
    To only retrieve MediaStreamTrack representing audio, you can call [**MediaStream.getAudioTracks()**](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks).
    To only retrieve MediaStreamTrack representing video, you can call [**MediaStream.getVideoTracks()**](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks).
  - [**MediaDevices.enumerateDevices()**](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) is used to retrieve a list of available media input and output devices.
- [**WebRTC** (Web Real-Time Communication)](https://webrtc.org/) enables users to stream video, voice, and generic data between peers.
  - When I build [chat application](https://github.com/hyecheol123/NomadCoder-Zoom/tree/main/open-chats) using Socket.IO, many webSockets are connected to one server.
    When message sent, the message goes to server; then server pass the messaage to everyone.
    It is not a peer-to-peer application.
  - Using webRTC, the data are not sent to server.
    The data send directly to the other user.
    - Server exists only to signal each peers to establish connections.
  - Connection Establish/Exchange Diagram: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity
    - Diagram for setup the connections: https://stackoverflow.com/questions/47125535/offer-answer-from-same-device-ios-in-webrtc
  - Use [**RTCPeerConnection**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) to prepare establishing a WebRTC connection between the local and remote computers.
    - Use[**RTCPeerConnection.addTrack()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack) to add new media track to the set of tracks which will be transmitted to the connected peer.
      - Need to specify `MediaStreamTrack` representing the media track to add to the peer connection.
        Also, the function get optinoal argument of `MediaStream` indicates where the track should be added.
        It provides a convenient way to group tracks together on receiving end of the connection.
    - Once new user joined (Previous user gets notification), the existing users need to send **offer** to new user in order to start a new WebRTC connection to a remoe user.
      - `offer` can be created by using [**RTCPeerConnection.createOffer()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer).
      - [**RTCPeerConnection.setLocalDescription()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription) is used to change the local description associated with the connection, which specifies the properties (including media format) of the local end of connection.
      - The created `offer` can sent to the remote end using SocketIO.
    - Once the remote end receives the `offer`, it need to reply an **answer** to the origin.
      - The remote end needs to set the remote description using the `offer` received.
        It can be done by using [**RTCPeerConnecion.setRemoteDescription()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription).
      - After set the remote description to the connection, the remote end should create and send an `answer`.
        It can be done by using [**RTCPeerConnection.createAnswer()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer).
        - The `answer` becomes local description of remote end's connection.
        - The sent `answer` should be the remote description of the other end's connection.
  - [**RTCIceCandidate**] indicates the candidate Interactive Connectivity Establishment (ICE) configuration which may be used to establish the `RTCPeerConnection`.
    - An ICE candidate describes the protocols and routing needs for WebRTC to be able to communicate with a remote device.
    - When starting a WebRTC connection, various candidates are proposed by each end; then, one best specification is selected to commuicate with each other.
    - [**RTCPeerConnection.icecandidate event**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event) occurs when an `RTCIceCandidate` is added to the local peer (by calling `RTCPeerConnection.setLocalDescription()`).
      - The event handler of this eent should transmit the `RTCICECandidate` to the remote peer.
      - When the remote end receives the candidates, it needs to add the candidates to the connection by using [**RTCPeerConnection.addIceCandidate()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addIceCandidate)
  - After sharing `RTCIceCandidate`, both ends need to handle [**RTCPeerConnection.addstream**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addstream_event) event.
    - Note that `RTCPeerConnection.addstream` event is depreciated.
      We need to use [**RTCPeerConnection.track** event](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event) instread.
    - It contains information of `MediaStream` from remote end.
  - Use [**RTCPeerConnection.getSenders()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getSenders) to retrieve the list of `RTCRtpSender`, representing the RTP senders transmitting the track's media.
    - [**RTCRtpSender**](https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender) allow developers to control the `MediaStreamTrack` sent to peer.
    - Use [**RTCRtpSender.replaceTrack()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack) to replace track currently being used as the sender's source.
- Use [localtunnel](https://theboroer.github.io/localtunnel-www/) to test/expose the localhost to the public.
- STUN (Session Traversal Utilities for NAT) server helps clients find the public IP address behind a firewall.
  - Add list of STUN servers that the application will use while creating the `RTCPeerConnection`.
- Data Channel can be created by using [**RTCPeerConnection.createDataChannel()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel).
  - When the `RTCDataChannel` receives a message from the remote peer, the [**RTCDataChannel: message event**](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/message_event) occurs.
  - Only one peer, the origin, needs to create the data channel.
    The other peer only needs the event handler to handle the message event.
    - The [**RTCPeerConnection: datachannel event**](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/datachannel_event) is created when `RTCDataChannel` is added to the connection.
  - To send the message to the peer, use [**RTCDataChannel.send()**](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/send).
