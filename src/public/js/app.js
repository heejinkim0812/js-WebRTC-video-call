const socket = io(); //back과 front 연결

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false; 
let cameraOff = false;

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
            deviceId? cameraConstraints : initialConstraints
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras(); //cameras 생성이전 딱 한번만 실행 (처음접속)
        }
    } catch (e) { //오류발생시 예외처리
        console.log(e);
    }
}
getMedia(); 

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

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);