


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

export async function predictPose(arrData)
{
    try{
    if(arrData!=null)
    {
        console.log(arrData);
    const results = await nn.classify(arrData);
    console.log(results[0].label)

    document.getElementById('detectedLabel').innerHTML =results[0].label + " | c" + results[0].confidence;
    }
}
catch{
    document.getElementById('detectedLabel').innerHTML = "Model not ready yet or out of range."
}
}

