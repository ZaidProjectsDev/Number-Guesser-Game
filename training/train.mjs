
const layers =[{
    type: 'dense',
    units: 256,
    activation: 'relu'
  },
  {
type: 'dense',
activation: 'softmax',
  }]

export const nn = ml5.neuralNetwork({
    task: 'classification',
    debug: true,
    layers: layers
    
  });
export let testData = [];//Define test data to be filled.
export const labelPredictState ="Nothing";
//nn.addData([18,9.2,8.1,2], {label:"cat"})
//nn.addData([20.1,17,15.5.5], {label:"dog"})
// vul hier zelf de rest van de data in
// ...

export async function trainNN(arrData,epochNum=50)
{
    console.log(arrData);
    for (let i = 0; i < arrData.length; i++) 
    {
        let poses = arrData[i];
        let testSize = Math.floor(poses.arrayData.length * 0.8); //Only use 80% of the data for training.
        const trainingData= poses.arrayData.slice(0, testSize);
        const testDataBatch= poses.arrayData.slice(testSize);

        if(poses!=null)
            for(let x =0; x<trainingData.length; ++x)
            {
                if(trainingData[x]!= null)
                {
                    console.log(trainingData[x] + " " + poses.name);
                    nn.addData(trainingData[x],{label: poses.name})
                }
            }
            for(let x =0; x<testDataBatch.length; ++x)
            {
                if(testDataBatch[x]!= null)
                {
                    let newTestData = {name:poses.name,
                        arrayData:testDataBatch[x]}
                   testData.push(newTestData)
                    console.log( "Test Data : " + testData.indexOf(newTestData));
                }
            }
      }
      let exportBtn = document.getElementById('dataExportButton');
      exportBtn.addEventListener('click',exportTestingJson)
    nn.normalizeData()
    nn.train({ epochs: epochNum }, () => finishedTraining()) 
}


  

export function getFlatArrayData(array)
{
    let newArr = [];
   // let shuffleArr = array.sort((a, b) => 0.5 - Math.random());
   
    for(let i=0; i<array.length; ++i)
    {
        for(let x=0; x<array[i].length; ++x)
        {
            newArr.push(array[i][x]);
        }
    
    }
    return newArr;
}
export async function runTestPrediction()
{
    let accuracyPts = 0;

    //Confusion Matrix 
    let trueCMXLabels = []
    let predictedCMXLabels=[]
    for(let i =0; i<testData.length; ++i)
    {
        let data = testData[i].arrayData;
        let correctLabel = testData[i].name;
        trueCMXLabels.push(correctLabel); // The correct ones

        const results = await nn.classify(data);

        predictedCMXLabels.push(results[0].label) //The results
        
        console.log("This might be : " + results[0].label + " " + results[0].confidence + "The correct label is : " + correctLabel)
        if(results[0].label == correctLabel)
        {
            accuracyPts++;
        }
    }
    const accuracy = (accuracyPts/testData.length)*100;
    console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
    document.getElementById('modelStatus').innerHTML = `This model is ${accuracy} accurate`;
    console.log(trueCMXLabels);
    console.log(predictedCMXLabels);


}
export async function predictPose(arrData)
{
    try{
    if(arrData!=null)
    {
        console.log(arrData);
    const results = await nn.classify(arrData);
    console.log(results[0].label)

    document.getElementById('modelStatus').innerHTML =results[0].label + " | c" + results[0].confidence;
    }
}
catch{
    document.getElementById('modelStatus').innerHTML = "Model not ready yet or out of range."
}
}
export async function exportTestingJson()
{
    let json = JSON.stringify(testData);
    download(json, `test.json`, 'application/json');

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

export async function exportModel()
{
    nn.save()
}


export async function finishedTraining(){    
    console.log("Finished Training");
    runTestPrediction();
}