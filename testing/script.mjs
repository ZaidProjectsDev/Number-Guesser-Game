import Pose from "./pose.mjs";

const demosSection = document.getElementById("demos");
let handLandmarker = undefined;
let runningMode = "IMAGE";
let model;



let testModelButton,poseCounter,loadModelButton;
let poseTable;
let poseArray = [];
let currentPose = new Pose("None",[]);
let activePose = new Pose("None",[]);
let recordingPoseData = false;
let testData = [];
let labelTableMatrix = [];
let trainingEpochs = 10;
let modelStatusEnum =[
{id: 0,key: 'errModelNotInit', value: "Model has not been initialized yet"},
{id: 1,key: 'errModelNotLoaded', value: "Model has not been loaded yet"},
{id: 2,key: 'errModelNotValid', value: "Model is invalid or corrupt"},
{id: 3,key: 'errTest', value: "TestData could not be loaded"},
{id: 4,key: 'errModelNotInit', value: "Model has not been initialized yet"},
{id: 5,key: 'stModelLoaded', value: "Model Successfully Loaded"},
{id: 6,key: 'stTest', value: "TestData loaded"},
]

//Get all the HTML elements 
function startUp() {
    loadModelButton = document.getElementById('modelLoadButton');
    loadModelButton.addEventListener('click', loadModel)
    testModelButton = document.getElementById('modelTestButton');
    testModelButton.addEventListener('click',testModel)
    toggleButtonVisibility(testModelButton,false);
    updateStatusTextCoded(0)
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



function checkModelStatus()
{

}
//Update the status text because constantly doing document.getElementById('modelStatus').innerHTML= is tedious. 
function updateStatusText(status)
{
    
    document.getElementById('modelStatus').innerHTML=status;
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
    console.log(model);
    if(model.ready)
    {
        updateStatusTextCoded(5)
        toggleButtonVisibility(testModelButton,true);
        loadTestData();
    }
    else
    {
        updateStatusTextCoded(2)
    }
}
function generateHtmlForLabels(dataTable) {
    const uniqueLabels = new Set(dataTable.map(item => item.name));
    const container = document.getElementById('results');

    uniqueLabels.forEach(label => {
        const labelContainer = document.createElement('div');

        const labelDiv = document.createElement('div');
      
        const labelName = document.createElement('h2');
        labelName.id = "label";
        labelName.textContent = `${label}`;
        labelDiv.appendChild(labelName);

        const positives = document.createElement('h3');
        positives.id = "positives";
        positives.textContent = `Positives: `;
        labelDiv.appendChild(positives);

        const falsePositives = document.createElement('h3');
        falsePositives.id = "falsePositives";
        falsePositives.textContent = "False Positives: ";
        labelDiv.appendChild(falsePositives);

        const labelAccuracy = document.createElement('h3');
        labelAccuracy.id = "labelAccuracy";
        labelAccuracy.textContent = "Label Accuracy: ";
        labelDiv.appendChild(labelAccuracy);
        labelContainer.appendChild(labelDiv);
        container.appendChild(labelContainer);

        labelTableMatrix.push({labelName: label,positivesEl:positives, negativesEl:falsePositives,accuracyEl:labelAccuracy, positives:0, falsePositives:0,accuracy:0})
    });
}
function addPositiveToLabel(labelName)
{
    for(let i=0; i<labelTableMatrix.length; ++i)
    {
        if(labelName == labelTableMatrix[i].labelName)
        {
            let l = labelTableMatrix[i];
            l.positives++;
            break;
        }
    }
}
function addFalsePositiveToLabel(labelName)
{
    for(let i=0; i<labelTableMatrix.length; ++i)
    {
        if(labelName == labelTableMatrix[i].labelName)
        {
            let l = labelTableMatrix[i];
            l.falsePositives++;
            break;
        }
    }
}
function calculateLabelAccuracy(labelName)
{
    for(let i=0; i<labelTableMatrix.length; ++i)
    {
        if(labelName == labelTableMatrix[i].labelName)
        {
            let l = labelTableMatrix[i];
            let total = l.positives + l.falsePositives;
            l.accuracy = (l.positives/total)*100;
            break;
        }
    }
}
function resetAllLabelResults()
{
    for(let i=0; i<labelTableMatrix.length; ++i)
    {
        let l = labelTableMatrix[i];
        l.accuracy = 0;
        l.positives = 0;
        l.falsePositives = 0;
        updateLabel(l.labelName)
    }
}
function updateLabel(labelName)
{
    for(let i=0; i<labelTableMatrix.length; ++i)
    {
        if(labelName == labelTableMatrix[i].labelName)
        {
            let l = labelTableMatrix[i];
            l.positivesEl.textContent = `Positives: ${l.positives}`;
            l.negativesEl.textContent = `False Positives: ${l.falsePositives}`;
            l.accuracyEl.textContent = `Accuracy: ${l.accuracy}`;
            break;
        }
    }
}
async function loadTestData()
{
    let jsonStr = "";
    let arrData = [];
    try{

    const response = await fetch('testing/test.json');
    jsonStr = await response.json();
    console.log(jsonStr);
    arrData =jsonStr;
    testData = arrData;
    generateHtmlForLabels(testData);
    }
    catch(error)
    {
        console.log(error);
        updateStatusTextCoded(3);
    }
}
async function testModel()
{


    if(testData.length>0)
    {
        resetAllLabelResults();
       
        for (let i=0; i<testData.length; ++i)
        {
            console.log(testData[i].name + " | "+ testData[i].arrayData);
        }
   

        let accuracyPts = 0;
        let errors =0;
        //Confusion Matrix 
        let trueCMXLabels = []
        let predictedCMXLabels=[]
        for(let i =0; i<testData.length; ++i)
        {
            let data = testData[i].arrayData;
            let correctLabel = testData[i].name;
            trueCMXLabels.push(correctLabel); // The correct ones
    
            const results = await model.classify(data);
    
            predictedCMXLabels.push(results[0].label) //The results
            
            console.log("This might be : " + results[0].label + " " + results[0].confidence + "The correct label is : " + correctLabel)
            if(results[0].label == correctLabel)
            {
                accuracyPts++;
                addPositiveToLabel(results[0].label);
                updateLabel(results[0].label);
                calculateLabelAccuracy(results[0].label)
            }
            else
            {
                addFalsePositiveToLabel(results[0].label);
                updateLabel(results[0].label);
                calculateLabelAccuracy(results[0].label)
            }
          
        }
        const accuracy = (accuracyPts/testData.length)*100;
        console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
        document.getElementById('modelStatus').innerHTML = `This model is ${accuracy} accurate`;
        console.log(trueCMXLabels);
        console.log(predictedCMXLabels);
    }
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

const predictPoseToModel = async ()=>
{
    predictingPoseData = true;
    activePose.doneRecording = false;
    activePose.arrayData = [];

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









