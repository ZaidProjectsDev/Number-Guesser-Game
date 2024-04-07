// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import kNear from './kNear.js';
import Pose from "./pose.mjs";
const demosSection = document.getElementById("demos");
let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
let kNearObject = new kNear();
let trainButton, addNewPoseButton,recordPoseButton,modelPredictButton, loadFromJsonButton,exportPosesButton,deletePoseButton,reloadPoseButton,saveToLocalButton;
let poseArray = [];
let currentPose = new Pose("None",[]);
let activePose = new Pose("None",[]);
let recordingPoseData = false;
let predictingPoseData= false;
let tickUpdate = false;
let recordSampleSize = 1000;
let trainingEpochs = 10;
let tick = setInterval(tickTimer, 10);
function tickTimer() {
    tickUpdate =!tickUpdate;
}
// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.

const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 2
    });
    demosSection.classList.remove("invisible");
    addNewPoseButton = document.getElementById('poseAddButton');
    addNewPoseButton.addEventListener('click',addNewPose)
    recordPoseButton = document.getElementById('poseRecordButton');
    recordPoseButton.addEventListener('click',startRecordingPoseData)
    exportPosesButton = document.getElementById('poseExportButton');
    exportPosesButton.addEventListener('click', exportPoses)
    saveToLocalButton = document.getElementById('poseSaveButton');
    saveToLocalButton.addEventListener('click',saveArrayOfPosesToLocalStorage);
    reloadPoseButton = document.getElementById('poseReloadButton');
    reloadPoseButton.addEventListener('click',loadArrayOfPosesFromLocalStorage);
    deletePoseButton = document.getElementById('poseDeleteButton');
    deletePoseButton.addEventListener('click',deletePose);
    modelPredictButton = document.getElementById('modelPredictButton');
    modelPredictButton.addEventListener('click', predictPoseToModel)
    loadFromJsonButton = document.getElementById('loadFromJsonButton');
    loadFromJsonButton.addEventListener('click', loadPosesFromJson);
};

function startRecordingPoseData(){
    if(currentPose!=null)
    {
        currentPose.arrayData = [];
        currentPose.doneRecording = false;
        recordingPoseData = true;
    }
}
function deletePose() {
    let poseToDeleteIndex = 0;
    if(currentPose!=null || poseArray.length<1)
    {
        poseToDeleteIndex = poseArray.indexOf(currentPose);
    
    // Remove the selected pose from the pose array safely
    let deletedPose = poseArray.splice(poseToDeleteIndex, 1)[0];
    // Call fillList function to update the UI
    fillList();
    console.log(deletedPose);
    }
    else
    {
        console.log('No pose to delete');
    }
}
  // Save an array of objects to local storage
function saveArrayOfPosesToLocalStorage() {
    localStorage.setItem('poseArray', JSON.stringify(poseArray));
    console.log(JSON.stringify(poseArray))
    fillList();
  }
  
  // Load an array of objects from local storage
  function loadArrayOfPosesFromLocalStorage() {
    poseArray = [];
    let savedPoseJson = localStorage.getItem('poseArray');
    if (savedPoseJson) {
    let savedPose = JSON.parse(savedPoseJson);
    if (typeof savedPose === 'object') {
    for (let i = 0; i < savedPose.length; ++i) {
    let newPose = new Pose(savedPose[i].name, savedPose[i].arrayData);
    poseArray.push(newPose);
    }
    }
    }
    fillList();
  }

  function fillList() {
    let select = document.getElementById("poseList");
    select.options.length = 0;
    for(let i = 0; i < poseArray.length; i++) {
      let option = document.createElement("option");
      option.text = poseArray[i].name;
      option.value = i; // Set the value to the index
      select.add(option);
    }
  }

  document.getElementById("poseList").addEventListener("change", function() 
  {
    console.log(typeof poseArray[this.value]);
    currentPose = poseArray[this.value]; // Reference the actual object in the poseArray
    
    console.log(currentPose);
    console.log(`Current selected pose: ${currentPose.getName()}`);
  });

  fillList();
createHandLandmarker();

const predictPoseToModel = async ()=>
{
    predictingPoseData = true;
    activePose.doneRecording = false;
    activePose.arrayData = [];

}
function addNewPose (){
    const newPoseName= prompt("Please Enter The Name of The Pose");
    console.log(newPoseName);
    const newPose = new Pose(newPoseName,[])
    poseArray.push(newPose);
    fillList();
    
    let select = document.getElementById("poseList");
    select.value = poseArray.indexOf(newPose);
    currentPose = newPose;
}
const loadPosesFromJson = async  ()=> {
    let fileHandle;
  poseArray = [];
      [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();
      const contents = await file.text();
      console.log(contents)

      let savedPose = JSON.parse(contents);
    if (typeof savedPose === 'object') {
    for (let i = 0; i < savedPose.length; ++i) {
    let newPose = new Pose(savedPose[i].name, savedPose[i].arrayData);
    poseArray.push(newPose);
    }
    fillList()
}
}
const exportPoses = () => {

    let json = JSON.stringify(poseArray);
    download(json, `pose_export.json`, 'application/json');
  }
// Function to download data to a file (This fucntion was generated with Mistral AI running locally via KobaldCPP)
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}


const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
const hasGetUserMedia = () => { var _a; return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia); };
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
let lastVideoTime = -1;
let results = undefined;
console.log(video);
async function predictWebcam() {
    canvasElement.style.width = video.videoWidth;
    ;
    canvasElement.style.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = handLandmarker.detectForVideo(video, startTimeMs);
    }
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.landmarks) {
        let dataArray = [];
        for (const landmarks of results.landmarks) {
       
           
            if(tickUpdate && !predictingPoseData)
            {
            for (let i in landmarks)
            {
                dataArray.push(landmarks[i].x, landmarks[i].y, landmarks[i].z);
                tickUpdate = false;
            }
           // console.log(dataArray);
          
          
            if(recordingPoseData)
            {
                currentPose.record(dataArray,recordSampleSize);
            if(currentPose.getDoneRecording())
            {
                console.log("Done Recording pose " +currentPose.getName() + "\nArr :" + currentPose.getFlatArrayData());
                recordingPoseData = false
            }
            }
        }
     
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 2
            });
            drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        }


        
       
     
    }
    canvasCtx.restore();
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

