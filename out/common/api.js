"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigFilepath = exports.getCredentialsFilepath = exports.getHomeDir = exports.ENV_CREDENTIALS_PATH = exports.getIniProfileData = exports.GetAwsProfileList = exports.GetLogEvents = exports.GetLogStreamList = exports.GetLogStreams = exports.GetLogGroupList = exports.GetCloudWatchLogsClient = exports.GetCredentials = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const ui = require("./ui");
const MethodResult_1 = require("./MethodResult");
const os_1 = require("os");
const path_1 = require("path");
const path_2 = require("path");
const parseKnownFiles_1 = require("../aws-sdk/parseKnownFiles");
const CloudWatchTreeView_1 = require("../cloudwatch/CloudWatchTreeView");
const credential_providers_1 = require("@aws-sdk/credential-providers");
async function GetCredentials() {
    let credentials;
    try {
        if (CloudWatchTreeView_1.CloudWatchTreeView.Current) {
            process.env.AWS_PROFILE = CloudWatchTreeView_1.CloudWatchTreeView.Current.AwsProfile;
        }
        // Get credentials using the default provider chain.
        const provider = (0, credential_providers_1.fromNodeProviderChain)({ ignoreCache: true });
        credentials = await provider();
        if (!credentials) {
            throw new Error("Aws credentials not found !!!");
        }
        ui.logToOutput("Aws credentials AccessKeyId=" + credentials.accessKeyId);
        return credentials;
    }
    catch (error) {
        ui.showErrorMessage("Aws Credentials Not Found !!!", error);
        ui.logToOutput("GetCredentials Error !!!", error);
        return credentials;
    }
}
exports.GetCredentials = GetCredentials;
const client_cloudwatch_logs_1 = require("@aws-sdk/client-cloudwatch-logs");
async function GetCloudWatchLogsClient(Region = CloudWatchTreeView_1.CloudWatchTreeView.Current?.LastUsedRegion) {
    let credentials = await GetCredentials();
    return new client_cloudwatch_logs_1.CloudWatchLogsClient({
        credentials: credentials,
        endpoint: CloudWatchTreeView_1.CloudWatchTreeView.Current?.AwsEndPoint,
        region: Region
    });
}
exports.GetCloudWatchLogsClient = GetCloudWatchLogsClient;
const client_cloudwatch_logs_2 = require("@aws-sdk/client-cloudwatch-logs");
async function GetLogGroupList(Region, LogGroupNamePattern) {
    ui.logToOutput('api.GetLogGroupList Started');
    let result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        const client = await GetCloudWatchLogsClient(Region);
        const command = new client_cloudwatch_logs_2.DescribeLogGroupsCommand({
            limit: 500,
            logGroupNamePrefix: LogGroupNamePattern
        });
        const response = await client.send(command);
        result.isSuccessful = true;
        if (response.logGroups) {
            for (const logGroup of response.logGroups) {
                if (logGroup.logGroupName) {
                    result.result.push(logGroup.logGroupName);
                }
            }
        }
    }
    catch (error) {
        result.isSuccessful = false;
        result.error = error;
        ui.showErrorMessage('api.GetLogGroupList Error !!!', error);
        ui.logToOutput("api.GetLogGroupList Error !!!", error);
    }
    return result;
}
exports.GetLogGroupList = GetLogGroupList;
const client_cloudwatch_logs_3 = require("@aws-sdk/client-cloudwatch-logs");
async function GetLogStreams(Region, LogGroupName, LogStreamFilter) {
    ui.logToOutput('api.GetLogStreams Started');
    const result = new MethodResult_1.MethodResult();
    try {
        const client = await GetCloudWatchLogsClient(Region);
        const command = new client_cloudwatch_logs_3.DescribeLogStreamsCommand({
            logGroupName: LogGroupName,
            orderBy: "LastEventTime",
            descending: true,
            limit: 50,
        });
        const response = await client.send(command);
        result.isSuccessful = true;
        result.result = response.logStreams;
    }
    catch (error) {
        result.isSuccessful = false;
        result.error = error;
        ui.showErrorMessage('api.GetLogStreams Error !!!', error);
        ui.logToOutput("api.GetLogStreams Error !!!", error);
    }
    return result;
}
exports.GetLogStreams = GetLogStreams;
async function GetLogStreamList(Region, LogGroupName) {
    ui.logToOutput('api.GetLogStreamList Started');
    let result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        let logStreams = await GetLogStreams(Region, LogGroupName);
        if (logStreams.isSuccessful) {
            if (logStreams.result) {
                for (var logStream of logStreams.result) {
                    if (logStream.logStreamName) {
                        result.result.push(logStream.logStreamName);
                    }
                }
            }
            result.isSuccessful = true;
            return result;
        }
        else {
            result.error = logStreams.error;
            result.isSuccessful = false;
            return result;
        }
    }
    catch (error) {
        result.isSuccessful = false;
        result.error = error;
        ui.showErrorMessage('api.GetLogStreamsList Error !!!', error);
        ui.logToOutput("api.GetLogStreamsList Error !!!", error);
        return result;
    }
}
exports.GetLogStreamList = GetLogStreamList;
const client_cloudwatch_logs_4 = require("@aws-sdk/client-cloudwatch-logs");
async function GetLogEvents(Region, LogGroupName, LogStreamName, StartTime = 0) {
    ui.logToOutput('api.GetLogEvents Started');
    const result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        const client = await GetCloudWatchLogsClient(Region);
        let nextToken;
        while (true) {
            const command = new client_cloudwatch_logs_4.GetLogEventsCommand({
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
            if (newToken === nextToken) {
                break;
            }
            nextToken = newToken;
        }
        result.isSuccessful = true;
    }
    catch (error) {
        result.isSuccessful = false;
        result.error = error;
        ui.showErrorMessage('api.GetLogEvents Error !!!', error);
        ui.logToOutput("api.GetLogEvents Error !!!", error);
    }
    return result;
}
exports.GetLogEvents = GetLogEvents;
async function GetAwsProfileList() {
    ui.logToOutput("api.GetAwsProfileList Started");
    let result = new MethodResult_1.MethodResult();
    try {
        let profileData = await getIniProfileData();
        result.result = Object.keys(profileData);
        result.isSuccessful = true;
        return result;
    }
    catch (error) {
        result.isSuccessful = false;
        result.error = error;
        ui.showErrorMessage('api.GetAwsProfileList Error !!!', error);
        ui.logToOutput("api.GetAwsProfileList Error !!!", error);
        return result;
    }
}
exports.GetAwsProfileList = GetAwsProfileList;
async function getIniProfileData(init = {}) {
    ui.logToOutput('api.getIniProfileData Started');
    const profiles = await (0, parseKnownFiles_1.parseKnownFiles)(init);
    return profiles;
}
exports.getIniProfileData = getIniProfileData;
exports.ENV_CREDENTIALS_PATH = "AWS_SHARED_CREDENTIALS_FILE";
const getHomeDir = () => {
    const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${path_1.sep}` } = process.env;
    if (HOME) {
        return HOME;
    }
    if (USERPROFILE) {
        return USERPROFILE;
    }
    if (HOMEPATH) {
        return `${HOMEDRIVE}${HOMEPATH}`;
    }
    return (0, os_1.homedir)();
};
exports.getHomeDir = getHomeDir;
const getCredentialsFilepath = () => process.env[exports.ENV_CREDENTIALS_PATH] || (0, path_2.join)((0, exports.getHomeDir)(), ".aws", "credentials");
exports.getCredentialsFilepath = getCredentialsFilepath;
const getConfigFilepath = () => process.env[exports.ENV_CREDENTIALS_PATH] || (0, path_2.join)((0, exports.getHomeDir)(), ".aws", "config");
exports.getConfigFilepath = getConfigFilepath;
//# sourceMappingURL=api.js.map