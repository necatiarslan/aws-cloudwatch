/* eslint-disable @typescript-eslint/naming-convention */
import * as ui from "./ui";
import { MethodResult } from './MethodResult';
import { homedir } from "os";
import { sep } from "path";
import { join } from "path";
import { parseKnownFiles, SourceProfileInit } from "../aws-sdk/parseKnownFiles";
import { ParsedIniData } from "@aws-sdk/types";
import { CloudWatchTreeView } from "../cloudwatch/CloudWatchTreeView";

import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
export async function GetCredentials() {
  let credentials;

  try {
    if (CloudWatchTreeView.Current) {
      process.env.AWS_PROFILE = CloudWatchTreeView.Current.AwsProfile ;
    }
    // Get credentials using the default provider chain.
    const provider = fromNodeProviderChain({ignoreCache: true});
    credentials = await provider();

    if (!credentials) {
      throw new Error("Aws credentials not found !!!");
    }

    ui.logToOutput("Aws credentials AccessKeyId=" + credentials.accessKeyId);
    return credentials;
  } catch (error: any) {
    ui.showErrorMessage("Aws Credentials Not Found !!!", error);
    ui.logToOutput("GetCredentials Error !!!", error);
    return credentials;
  }
}

import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";

export async function GetCloudWatchLogsClient(Region:string | undefined = CloudWatchTreeView.Current?.LastUsedRegion): Promise<CloudWatchLogsClient> {
  let credentials = await GetCredentials();
  return new CloudWatchLogsClient({
    credentials: credentials,
    endpoint: CloudWatchTreeView.Current?.AwsEndPoint,
    region: Region
  });
}

import { DescribeLogGroupsCommand } from "@aws-sdk/client-cloudwatch-logs";

export async function GetLogGroupList(Region: string, LogGroupNamePattern?: string): Promise<MethodResult<string[]>> {
  ui.logToOutput('api.GetLogGroupList Started');
  let result = new MethodResult<string[]>();
  result.result = [];

  try {
    const client = await GetCloudWatchLogsClient(Region);
    let nextToken: string | undefined = undefined;

    do {
      const command:DescribeLogGroupsCommand = new DescribeLogGroupsCommand({
        limit: 50,
        logGroupNamePrefix: LogGroupNamePattern,
        nextToken,
      });

      const response = await client.send(command);
      if (response.logGroups) {
        for (const logGroup of response.logGroups) {
          if (logGroup.logGroupName) {
            result.result.push(logGroup.logGroupName);
          }
        }
      }

      nextToken = response.nextToken;
    } while (nextToken);

    result.isSuccessful = true;

  } catch (error: any) {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetLogGroupList Error !!!', error);
    ui.logToOutput("api.GetLogGroupList Error !!!", error); 
  }

  return result;
}



import { DescribeLogStreamsCommand, LogStream } from "@aws-sdk/client-cloudwatch-logs";

export async function GetLogStreams(
  Region: string,
  LogGroupName: string,
  LogStreamFilter?: string
): Promise<MethodResult<LogStream[] | undefined>> {
  ui.logToOutput('api.GetLogStreams Started');
  const result = new MethodResult<LogStream[] | undefined>();
  const allLogStreams: LogStream[] = [];

  try {
    const client = await GetCloudWatchLogsClient(Region);
    let nextToken: string | undefined = undefined;

    do {
      const command:DescribeLogStreamsCommand = new DescribeLogStreamsCommand({
        logGroupName: LogGroupName,
        orderBy: "LastEventTime",
        descending: true,
        limit: 50,
        nextToken,
      });

      const response = await client.send(command);

      if (response.logStreams) {
        allLogStreams.push(...response.logStreams);
      }

      nextToken = response.nextToken;
    } while (nextToken);

    result.isSuccessful = true;

    if (LogStreamFilter) {
      result.result = allLogStreams.filter((logStream) => logStream.logStreamName?.includes(LogStreamFilter));
    }

    result.result = allLogStreams;

  } catch (error: any) {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetLogStreams Error !!!', error);
    ui.logToOutput("api.GetLogStreams Error !!!", error); 
  }

  return result;
}



export async function GetLogStreamList(Region:string, LogGroupName:string, IncludeEmptyLogStreams:boolean=false, DateFilter?:Date): Promise<MethodResult<string[]>> {
  ui.logToOutput('api.GetLogStreamList Started');
  let result:MethodResult<string[]> = new MethodResult<string[]>();
  result.result = [];

  try 
  {
    let logStreams = await GetLogStreams(Region, LogGroupName);
    if(logStreams.isSuccessful)
    {
      if(logStreams.result)
      {
        for(var logStream of logStreams.result)
        {
          if(!IncludeEmptyLogStreams && !logStream.lastEventTimestamp) {
            continue;
          }
          if(DateFilter && logStream.lastEventTimestamp) {
            let nextDay = new Date(DateFilter.getTime() + 86400000);
            if(logStream.lastEventTimestamp < DateFilter.getTime() || logStream.lastEventTimestamp > nextDay.getTime()) {
              continue;
            }
          }
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

import { GetLogEventsCommand, OutputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
export async function GetLogEvents(Region: string, LogGroupName: string, LogStreamName: string, StartTime: number = 0): Promise<MethodResult<OutputLogEvent[]>> {
  ui.logToOutput('api.GetLogEvents Started');

  const result = new MethodResult<OutputLogEvent[]>();
  result.result = [];

  try {
    const client = await GetCloudWatchLogsClient(Region);
    let nextToken: string | undefined;

    while (true) {
      const command = new GetLogEventsCommand({
        logGroupName: LogGroupName,
        logStreamName: LogStreamName,
        startTime: StartTime,
        nextToken
      });
      const response = await client.send(command);

      if (response.events) {
        result.result.push(...response.events);
      }

      const newToken = response.nextForwardToken;
      if (newToken === nextToken) { break; }
      nextToken = newToken;
    }

    result.isSuccessful = true;
  } catch (error: any) {
    result.isSuccessful = false;
    result.error = error;
    ui.showErrorMessage('api.GetLogEvents Error !!!', error);
    ui.logToOutput("api.GetLogEvents Error !!!", error); 
  }

  return result;
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