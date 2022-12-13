/* eslint-disable @typescript-eslint/naming-convention */
import * as AWS from "aws-sdk";
import * as ui from "./UI";
import { MethodResult } from './MethodResult';
import { Credentials } from 'aws-sdk';
import { homedir } from "os";
import { sep } from "path";
import { join } from "path";
import { parseKnownFiles, SourceProfileInit } from "../aws-sdk/parseKnownFiles";
import { ParsedIniData } from "@aws-sdk/types";


export async function GetLogGroupList(Profile:string, Region:string, LogGroupNamePattern?:string): Promise<MethodResult<string[]>> {
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });

    // Initialize the CloudWatchLogs client
    const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region, credentials:credentials});

    // Set the parameters for the describeLogGroups API
    const params = {
      limit: 50,
      logGroupNamePattern: LogGroupNamePattern
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

export async function GetLogStreamList(Profile:string, Region:string, LogGroupName:string): Promise<MethodResult<string[]>> {
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
    const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region, credentials:credentials});

    const params = {
      logGroupName: LogGroupName,
      orderBy:"LastEventTime",
      descending:true,
      limit:50
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

export async function GetLogEvents(Profile:string, Region:string, LogGroupName:string, LogStreamName:string, StartTime?:number): Promise<MethodResult<AWS.CloudWatchLogs.OutputLogEvents>> {
  if(!StartTime) {StartTime=0;}
  
  let result:MethodResult<AWS.CloudWatchLogs.OutputLogEvents> = new MethodResult<AWS.CloudWatchLogs.OutputLogEvents>();

  try 
  {
    const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
    // Initialize the CloudWatchLogs client
    const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region, credentials:credentials});

    // Set the parameters for the describeLogGroups API
    const params = {
      logGroupName: LogGroupName,
      logStreamName: LogStreamName,
      limit: 20,
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
  catch (error:any) 
  {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetLogEvents Error !!!', error);
    ui.logToOutput("api.GetLogEvents Error !!!", error); 
    return result;
  }


}

export async function GetRegionList(Profile:string): Promise<MethodResult<string[]>> {
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
    const ec2 = new AWS.EC2({region: 'us-east-1', credentials:credentials});
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

export async function GetAwsProfileList(): Promise<MethodResult<string[]>> {
  ui.logToOutput("api.GetAwsProfileList Started");

  let result:MethodResult<string[]> = new MethodResult<string[]>();

  try 
  {
    let profileData = await getIniProfileData();
    
    result.result = Object.keys(profileData);
    result.isSuccessful = true;
    return result;
  } 
  catch (error:any) 
  {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetAwsProfileList Error !!!', error);
    ui.logToOutput("api.GetAwsProfileList Error !!!", error); 
    return result;
  }
}

export async function getIniProfileData(init: SourceProfileInit = {}):Promise<ParsedIniData>
{
    const profiles = await parseKnownFiles(init);
    return profiles;
}

export const ENV_CREDENTIALS_PATH = "AWS_SHARED_CREDENTIALS_FILE";

export const getHomeDir = (): string => {
    const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${sep}` } = process.env;
  
    if (HOME) { return HOME; }
    if (USERPROFILE) { return USERPROFILE; } 
    if (HOMEPATH) { return `${HOMEDRIVE}${HOMEPATH}`; } 
  
    return homedir();
  };

export const getCredentialsFilepath = () =>
  process.env[ENV_CREDENTIALS_PATH] || join(getHomeDir(), ".aws", "credentials");

export const getConfigFilepath = () =>
  process.env[ENV_CREDENTIALS_PATH] || join(getHomeDir(), ".aws", "config");