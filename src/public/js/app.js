const socket = io(); //back과 front 연결

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const welcome = document.getElementById("welcome");
const call = document.getElementById("call");
const welcomeForm = document.querySelector("form");
const input = welcomeForm.querySelector("input");

let myStream;
let muted = false; 
let cameraOff = false;
let roomName;
let myPeerConnection;

call.hidden = true;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter( (device) => (device.kind === "videoinput") ); //videoinput 정보만 추출
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach( (camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label === option.lebel){
                option.selected = true;
            }
            camerasSelect.appendChild(option); //option 그리기
        });
    } catch (e) {
        console.log(e);
    }   
}

async function getMedia(deviceId) {
    //deviceId 없을때(cameras 생성이전)
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    };
    //deviceId 있을때
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstraints : initialConstraints //deviceId 유무 조건
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras(); //cameras 생성이전 딱 한번만 실행 (처음접속)
        }
    } catch (e) { //오류발생시 예외처리
        console.log(e);
    }
}

function handleMuteClick() {
    myStream.getAudioTracks().forEach( (track) => (track.enabled = !track.enabled) ); //상태 반대로 전환
    if(!muted) {
        muted = true; //소리남 → 버튼클릭 후 음소거 → 음소거 해제 버튼
        muteBtn.innerText = "음소거 해제"; 
    }else {
        muted = false; //음소거 → 버튼 클릭 후 음소거 해제 → 음소거 버튼
        muteBtn.innerText = "음소거 하기"; 
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach( (track) => (track.enabled = !track.enabled) ); //상태 반대로 전환
    if(!cameraOff) {
        cameraOff = true; //카메라on → 버튼클릭 후 카메라off → 카메라on 버튼
        cameraBtn.innerText="Turn Camera On"; 
    }else{
        cameraOff = false; //카메라off → 버튼클릭 후 카메라on → 카메라off 버튼
        cameraBtn.innerText="Turn Camera Off"; 
    }
}

async function handleCameraChange(){
    await getMedia(camerasSelect.value);
}

function handleWelcomeSubmit(event){
    event.preventDefault();
    socket.emit("join_room", input.value, startMedia); // on → emit(구체적)
    roomName = input.value;
    input.value="";
}

async function startMedia(){
    welcome.hidden = true; //숨기기
    call.hidden = false;   //보이기
    await getMedia();
    makeConnection();
}

//Peer A
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer(); // 3. createOffer | offer 생성
    myPeerConnection.setLocalDescription(offer);        // 4. setLocalDescription | offer로 연결구성
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);              // 5. Peer B에 offer 전송
})

//Peer B
socket.on("offer", (offer) => {
    console.log(offer);                                 // 6. Peer B offer 받음 → signaling offer 주고받은 이후 P2P 대화가능
})


function makeConnection(){
    myPeerConnection = new RTCPeerConnection(); // 1. P2P connection 생성
    myStream.getTracks().forEach( (track) => myPeerConnection.addTrack(track, myStream)); // 2. addStream | (카메라,마이크) 데이터stream 연결에 넣음

}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
welcomeForm.addEventListener("submit", handleWelcomeSubmit);
