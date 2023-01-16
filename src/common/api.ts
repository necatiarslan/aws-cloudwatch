/* eslint-disable @typescript-eslint/naming-convention */
import * as AWS from "aws-sdk";
import * as ui from "./UI";
import { MethodResult } from './MethodResult';
import { homedir } from "os";
import { sep } from "path";
import { join } from "path";
import { parseKnownFiles, SourceProfileInit } from "../aws-sdk/parseKnownFiles";
import { ParsedIniData } from "@aws-sdk/types";


export async function GetLogGroupList(Profile:string, Region:string, LogGroupNamePattern?:string): Promise<MethodResult<string[]>> {
  ui.logToOutput('api.GetLogGroupList Started');
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });

    // Initialize the CloudWatchLogs client
    const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region, credentials:credentials});

    // Set the parameters for the describeLogGroups API
    const params = {
      limit: 50,//max value
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

export async function GetLogStreams(Profile:string, Region:string, LogGroupName:string, LogStreamFilter?:string): Promise<MethodResult<AWS.CloudWatchLogs.LogStreams | undefined>> {
  ui.logToOutput('api.GetLogStreams Started');
  let result = new MethodResult<AWS.CloudWatchLogs.LogStreams | undefined>();

  try 
  {
    const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
    const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region, credentials:credentials});

    const params = {
      logGroupName: LogGroupName,
      orderBy:"LastEventTime",
      descending:true,
      limit:50,//max value
    };
  
    let response = await cloudwatchlogs.describeLogStreams(params).promise();
    result.isSuccessful = true;
    result.result = response.logStreams;

    return result;
  } 
  catch (error:any) 
  {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetLogStreams Error !!!', error);
    ui.logToOutput("api.GetLogStreams Error !!!", error); 
    return result;
  }
}

export async function GetLogStreamList(Profile:string, Region:string, LogGroupName:string): Promise<MethodResult<string[]>> {
  ui.logToOutput('api.GetLogStreamList Started');
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    let logStreams = await GetLogStreams(Profile, Region, LogGroupName);
    if(logStreams.isSuccessful)
    {
      if(logStreams.result)
      {
        for(var logStream of logStreams.result)
        {
          if(logStream.logStreamName) {
            result.result.push(logStream.logStreamName);
          }
        }
      }
      result.isSuccessful = true;
      return result; 
    }
    else
    {
      result.error = logStreams.error;
      result.isSuccessful = false;
      return result;
    }
  } 
  catch (error:any) 
  {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetLogStreamsList Error !!!', error);
    ui.logToOutput("api.GetLogStreamsList Error !!!", error); 
    return result;
  }
}

export async function GetLogEvents(Profile:string, Region:string, LogGroupName:string, LogStreamName:string, StartTime?:number): Promise<MethodResult<AWS.CloudWatchLogs.OutputLogEvents>> {
  ui.logToOutput('api.GetLogEvents Started');
  if(!StartTime) {StartTime=0;}
  
  let result:MethodResult<AWS.CloudWatchLogs.OutputLogEvents> = new MethodResult<AWS.CloudWatchLogs.OutputLogEvents>();
  result.result = [];
  let nextToken:string | undefined;

  try 
  {
    const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
    // Initialize the CloudWatchLogs client
    const cloudwatchlogs = new AWS.CloudWatchLogs({region:Region, credentials:credentials});

    while(1===1)
    {
      let response = await getLogEventsInternal(cloudwatchlogs);
      if(response.events)
      {
        for(var e of response.events)
        {
          result.result.push(e);
        }
      }
      let newToken = response.nextForwardToken;
      ui.logToOutput("newToken=" + newToken);
      if(newToken === nextToken)
      {
        break;
      }
      nextToken = newToken;
    }

    result.isSuccessful = true;
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

  async function getLogEventsInternal(cloudwatchlogs: AWS.CloudWatchLogs) {
    ui.logToOutput("cloudwatchlogs.getLogEvents");
    const params = {
      logGroupName: LogGroupName,
      logStreamName: LogStreamName,
      startTime: StartTime,
      nextToken: nextToken
    };
    ui.logToOutput(params);
    //https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_GetLogEvents.html
    let response = await cloudwatchlogs.getLogEvents(params).promise();
    ui.logToOutput("log count = " + response.events?.length);
    return response;
  }
}

export async function GetRegionList(Profile:string): Promise<MethodResult<string[]>> {
  ui.logToOutput('api.GetRegionList Started');
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
  ui.logToOutput('api.getIniProfileData Started');
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