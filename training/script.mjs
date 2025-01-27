import Pose from "./pose.mjs";
import { trainNN,predictPose,finishedTraining,nn,getFlatArrayData, exportModel } from "./train.mjs";
const demosSection = document.getElementById("demos");
let handLandmarker = undefined;
let runningMode = "IMAGE";

let trainButton,loadFromJsonButton,poseCounter,exportModelButton;
let poseTable;
let poseArray = [];
let currentPose = new Pose("None",[]);
let activePose = new Pose("None",[]);
let recordingPoseData = false;


let trainingEpochs = 50;


//Get all the HTML elements 
function startUp() {
    loadFromJsonButton = document.getElementById('loadFromJsonButton');
    loadFromJsonButton.addEventListener('click', loadPosesFromJson);
    trainButton = document.getElementById("modelTrainButton");
    trainButton.addEventListener('click', trainModel);
    poseTable = document.getElementById('poseTable');
    poseCounter = document.getElementById('poseCounter');
    exportModelButton = document.getElementById('modelExportButton');
    exportModelButton.addEventListener('click',exportModel);
}


function generateTable(data) {
    let poseString = "";
    for(let i =0; i<data.length; ++i)
    {
        poseString+= `\n ${data[i].name},\n ${data[i].arrayData.length}\n`;
    }
      poseCounter.innerHTML = `Poses : ${data.length}`+ poseString;
}

const trainModel = async () =>{
    if(poseArray.length>0)
    {
    console.log("Training Model");
    trainNN(poseArray,trainingEpochs);
    }

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
generateTable(poseArray);
}
}


//Start the app 
startUp();









