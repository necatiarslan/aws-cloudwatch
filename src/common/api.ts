/* eslint-disable @typescript-eslint/naming-convention */
import * as AWS from "aws-sdk";
import * as ui from "./UI";
import { MethodResult } from './MethodResult';

export async function GetLogGroupList(Region:string): Promise<MethodResult<string[]>> {
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    // Initialize the CloudWatchLogs client
    const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region});

    // Set the parameters for the describeLogGroups API
    const params = {
      limit: 50,
    };

    let response = await cloudwatchlogs.describeLogGroups(params).promise();
    result.isSuccessful = true;
    if(response.logGroups)
    {
      for(var logGroup of response.logGroups)
      {
        if(logGroup.logGroupName)
        {
          result.result.push(logGroup.logGroupName);
        }
      }
    }
    return result;
  } 
  catch (error:any) 
  {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetLogGroupList Error !!!', error);
    ui.logToOutput("api.GetLogGroupList Error !!!", error); 
    return result;
  }
}

export async function GetLogStreamList(Region:string, LogGroupName:string): Promise<MethodResult<string[]>> {
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region});

    const params = {
      logGroupName: LogGroupName,
    };
  
    let response = await cloudwatchlogs.describeLogStreams(params).promise();
    result.isSuccessful = true;
    if(response.logStreams)
    {
      for(var logStream of response.logStreams)
      {
        if(logStream.logStreamName) {
          result.result.push(logStream.logStreamName);
        }
      }
    }

    return result;
  } catch (error:any) 
  {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetLogStreamsList Error !!!', error);
    ui.logToOutput("api.GetLogStreamsList Error !!!", error); 
    return result;
  }
}

export async function GetLogEvents(Region:string, LogGroupName:string, LogStreamName:string, StartTime?:number): Promise<MethodResult<AWS.CloudWatchLogs.OutputLogEvents>> {
  if(!StartTime) {StartTime=0}
  
  let result:MethodResult<AWS.CloudWatchLogs.OutputLogEvents> = new MethodResult<AWS.CloudWatchLogs.OutputLogEvents>();

  // Initialize the CloudWatchLogs client
  const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region});

  // Set the parameters for the describeLogGroups API
  const params = {
    logGroupName: LogGroupName,
    logStreamName: LogStreamName,
    limit: 100,
    startFromHead: false,
    startTime:StartTime
  };
  //https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_GetLogEvents.html
  let response = await cloudwatchlogs.getLogEvents(params).promise();
  if(response.events)
  {
    result.isSuccessful = true;
    result.result = response.events;
  }

  return result;
}

export async function GetRegionList(): Promise<MethodResult<string[]>> {
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    const ec2 = new AWS.EC2({region: 'us-east-1'});
    let response = await ec2.describeRegions().promise();

    result.isSuccessful = true;
    if(response.Regions)
    {
      for(var r of response.Regions)
      {
        if(r.RegionName)
        {
          result.result.push(r.RegionName);
        }
      }
    }
    return result;
  } catch (error:any) 
  {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetRegionList Error !!!', error);
    ui.logToOutput("api.GetRegionList Error !!!", error); 
    return result;
  }
}