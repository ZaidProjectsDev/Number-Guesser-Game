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
const demosSection = document.getElementById("demos");
let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
let model;
let modelReady = false;
let resultsBuffer=[];
let timerEl;
let takingInputNow = false;
let desiredNumberEl;
let desiredNumber;
let userGuessedNumber;
let userWasCorrect = false;
const gameStateEnum ={BOOT: 'Loading Content',IDLE: 'Awaiting User Input',START_NUMBER_GAME: 'Playing Intro',NUMBER_GAME_WAIT: 'Counting Down Timer',NUMBER_GAME_RESULT: 'Displaying Result',NUMBER_GAME_END: 'Game Over'};
let gameState = gameStateEnum.BOOT;
let modelStatusEnum =[
    {id: 0,key: 'errModelNotInit', value: "Model has not been initialized yet"},
    {id: 1,key: 'errModelNotLoaded', value: "Model has not been loaded yet"},
    {id: 2,key: 'errModelNotValid', value: "Model is invalid or corrupt"},
    {id: 3,key: 'errTest', value: "TestData could not be loaded"},
    {id: 4,key: 'errModelNotInit', value: "Model has not been initialized yet"},
    {id: 5,key: 'stModelLoaded', value: "Model Successfully Loaded"},
    {id: 6,key: 'stTest', value: "TestData loaded"},
    ]
let tickUpdate = false;
let waitFrames = 0;
let tick = setInterval(tickTimer, 10);

function tickTimer() {
    tickUpdate =!tickUpdate;
    if(tickUpdate)
    {
        gameUpdate();
    }
}
function updateGameState(state){
    gameState = state;
    console.log(gameState);
}
function updateTimerHeader(status)
{
    timerEl.textContent = status;
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
        numHands: 1
    });
    demosSection.classList.remove("invisible");

};

startUp();








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


//Get all the HTML elements 
function startUp() {
    updateGameState(gameStateEnum.BOOT);
    loadModel();
    createHandLandmarker();
    makeGame();
}
function initModel()
{
    const layers =[{
        type: 'dense',
        units: 256,
        activation: 'relu'
      },
      {
    type: 'dense',
    activation: 'softmax',
      }]
   return new ml5.neuralNetwork({
        task: 'classification',
        debug: true,
        layers: layers
        
      });
}
function makeGame()
{
    timerEl = document.createElement('label');
    timerEl.id = 'timer';
    timerEl.textContent = `I'm thinking of a number between 1 through 5. You have to guess what it is.`
    document.getElementById('timer-container').appendChild(timerEl);
    desiredNumberEl = document.createElement('label');
    desiredNumberEl.id = 'desired-number';
    desiredNumberEl.textContent = `666`
    document.getElementById('number-container').appendChild(desiredNumberEl);
    updateGameState(gameStateEnum.IDLE);
}
function randomNumber()
{
    //Grab a random number
    let numbers =[`one`,`two`,`three`,`four`,`five`];
    desiredNumber = numbers[Math.floor(Math.random() * numbers.length)] 
    //Debug
    console.log(desiredNumber);
}
function toggleButtonVisibility(button, visible) 
{
    if (!visible) {
      button.style.visibility = 'hidden';
    } else {
      button.style.visibility = 'visible';
    }
  
    if (!visible) {
      button.style.pointerEvents = 'none';
    } else {
      button.style.pointerEvents = 'auto';
    }
}
function updateGameStatusText(status)
{
    desiredNumberEl.textContent = status;
}
function updateStatusTextCoded(status)
{
    for(let i=0; i<modelStatusEnum.length; ++i)
    {
        if(modelStatusEnum[i].key == status)
        {
            document.getElementById('modelStatus').innerHTML=modelStatusEnum[i].value;
            break;
        }
        if(modelStatusEnum[i].id == status)
        {
            document.getElementById('modelStatus').innerHTML=modelStatusEnum[i].value;
            break;
        }
    }
  
}
function loadModel()
{
    try{

    model = initModel();
    const modelInfo = {
        model:'model/model.json',
        metadata: 'model/model_meta.json',
        weights: 'model/model.weights.bin',
    }
    model.load(modelInfo,verifyModel);
    }
    catch(error)
    {
        console.log(error);
        updateStatusTextCoded(2)
    }
}
function verifyModel()
{
    if(model.ready)
    {
        updateStatusTextCoded(5)
    }
    else
    {
        updateStatusTextCoded(2)
    }
    modelReady = model.ready;
}
//Created a gameUpdate loop akin to a Unity or Unreal Update/Tick loop. This has been done to make the game logic flow easier.
function gameUpdate()
{
    if(webcamRunning && gameState == gameStateEnum.IDLE)
    {
        if(waitFrames<200)
        {
            updateTimerHeader(`I'm thinking of a number between 1-5`)
            waitFrames++;
            toggleButtonVisibility(desiredNumberEl,false);
        }
        else
        {
            updateGameState(gameStateEnum.START_NUMBER_GAME);
            toggleButtonVisibility(desiredNumberEl,false);
            waitFrames = 0;
        }
    }
    if(webcamRunning && gameState== gameStateEnum.START_NUMBER_GAME)
    {
        if(waitFrames<100)
        {
            updateTimerHeader(`Ready?`)
            waitFrames++;
            toggleButtonVisibility(desiredNumberEl,false);
        }
        else
        {
            randomNumber();
            updateTimerHeader(`Hold up your hand and guess the number with your fingers!!!`)
            takingInputNow = true;
            toggleButtonVisibility(desiredNumberEl,true);
            updateGameState(gameStateEnum.NUMBER_GAME_WAIT)
            waitFrames =0;
        }
    }
    if(webcamRunning && gameState== gameStateEnum.NUMBER_GAME_WAIT)
    {
        if(waitFrames<200)
        {
            if(userGuessedNumber == desiredNumber)
            {
                userWasCorrect = true;
            }
            waitFrames++;
        }
        else
        {
            if(waitFrames<300)
            {
                updateTimerHeader(`Stop!`)
                toggleButtonVisibility(desiredNumberEl,false);
                takingInputNow = false;
                waitFrames++;
            }
            else
            {
                if(waitFrames<400)
                {
                    updateTimerHeader(`You guessed ${userGuessedNumber}`);
                    waitFrames++;
                }
                else
                {
                    if(waitFrames<700)
                    {
                        updateTimerHeader(`The correct number was ${desiredNumber}`);
                        waitFrames++;
                    }
                    else
                    {
                        if(waitFrames<800)
                        {
                            if(userWasCorrect)
                            {
                                updateTimerHeader(`You were correct! Great job!`);
                            }
                            else
                            {
                                updateTimerHeader(`Try again, buddy!`);
                            }
                            waitFrames++;
                        }
                        else
                        {
                            randomNumber();
                            userWasCorrect = false;
                            takingInputNow = false;
                            waitFrames=0;
                            updateGameState(gameStateEnum.IDLE);
                        }
                    }
                  
                }

            }
        }
    }

    parseResultsBuffer();
}
async function drawCameraLandmarkGraphics(landmark)
{
    drawConnectors(canvasCtx, landmark, HAND_CONNECTIONS, {
        color: "#AA00FF",
        lineWidth: 1
    });
   // drawLandmarks(canvasCtx, landmark, { color: "#FF0000", lineWidth: 2 });
}
async function parseResultsBuffer()
{
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if(resultsBuffer.length>0 && modelReady)
    {
        if(takingInputNow){
        let dataArray = [];
        for (const landmark of resultsBuffer) 
        {
            for (let i in landmark)
            {
                dataArray.push(landmark[i].x, landmark[i].y, landmark[i].z);
            }
             //Update Graphics

        }
        const results = await model.classify(dataArray);
        userGuessedNumber = results[0].label;
        updateGameStatusText(`Your Gesture : ${results[0].label}`)
    }

        
    }
    else
    {
        if(gameState == gameStateEnum.IDLE)
        {
            updateTimerHeader(`Guess The Number!`);
        }
        else
        {
            if(gameState == gameStateEnum.BOOT)
            {
                updateTimerHeader(`Please Wait`);
                toggleButtonVisibility(desiredNumberEl,false);
            }
        }
        if(modelReady)
        {
            if(webcamRunning && gameState == gameStateEnum.NUMBER_GAME_WAIT && takingInputNow)
            {
                updateGameStatusText(`Sorry, I can't see your hands!`)
            }
            else
            {
                if(gameState == gameStateEnum.IDLE)
                updateGameStatusText(`Please Enable your Webcam!`)
            }

        }
    }
    canvasCtx.restore();
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
   
    if (results.landmarks) {
        resultsBuffer = results.landmarks;
        for (const landmark of resultsBuffer) 
        {
             drawCameraLandmarkGraphics(landmark);
        }
    
    }

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

