export default class Pose
{
    constructor(name,arrayData)
    {
        this.name = name;
        this.arrayData = arrayData;
        this.doneRecording = false;
    }
    setArrayData(arrayData)
    {
        this.arrayData = arrayData;
    }
    getArrayData()
    {
        return this.arrayData;
    }
    getFlatArrayData()
    {
        let newArr = [];
        for(let i=0; i<this.getArrayLength(); ++i)
        {
            for(let x=0; x<this.getArrayData()[i].length; ++x)
            {
                newArr.push(this.getArrayData()[i][x]);
            }
        
        }
        return newArr;
    }
    getName()
    {
        return this.name;
    }
    getArrayLength()
    {
        return this.arrayData.length;
    }
    record(arrayData, maxArrayDataSize =96)
    {
        if(this.getArrayLength()<maxArrayDataSize)
        {
        this.arrayData.push(arrayData)
        document.getElementById('detectedLabel').innerHTML ="Recording" +  this.getName() + ":" + this.getArrayLength() + "/" + maxArrayDataSize;
        }
        else
        {
            this.doneRecording = true;
        }
    }
    recordSilent(arrayData, maxArrayDataSize =96)
    {
        if(this.getArrayLength()<maxArrayDataSize)
        {
        this.arrayData.push(arrayData)
       
        }
        else
        {
            this.doneRecording = true;
        }
    }
    getDoneRecording()
    {
        return this.doneRecording;
    }
    

}