"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigFilepath = exports.getCredentialsFilepath = exports.getHomeDir = exports.ENV_CREDENTIALS_PATH = exports.getIniProfileData = exports.GetAwsProfileList = exports.GetRegionList = exports.GetLogEvents = exports.GetLogStreamList = exports.GetLogGroupList = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const AWS = require("aws-sdk");
const ui = require("./UI");
const MethodResult_1 = require("./MethodResult");
const os_1 = require("os");
const path_1 = require("path");
const path_2 = require("path");
const parseKnownFiles_1 = require("../aws-sdk/parseKnownFiles");
async function GetLogGroupList(Profile, Region, LogGroupNamePattern) {
    let result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
        // Initialize the CloudWatchLogs client
        const cloudwatchlogs = new AWS.CloudWatchLogs({ region: Region, credentials: credentials });
        // Set the parameters for the describeLogGroups API
        const params = {
            limit: 50,
            logGroupNamePattern: LogGroupNamePattern
        };
        let response = await cloudwatchlogs.describeLogGroups(params).promise();
        result.isSuccessful = true;
        if (response.logGroups) {
            for (var logGroup of response.logGroups) {
                if (logGroup.logGroupName) {
                    result.result.push(logGroup.logGroupName);
                }
            }
        }
        return result;
    }
    catch (error) {
        result.isSuccessful = false;
        result.error = error;
        ui.showErrorMessage('api.GetLogGroupList Error !!!', error);
        ui.logToOutput("api.GetLogGroupList Error !!!", error);
        return result;
    }
}
exports.GetLogGroupList = GetLogGroupList;
async function GetLogStreamList(Profile, Region, LogGroupName) {
    let result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
        const cloudwatchlogs = new AWS.CloudWatchLogs({ region: Region, credentials: credentials });
        const params = {
            logGroupName: LogGroupName,
            orderBy: "LastEventTime",
            descending: true,
            limit: 50
        };
        let response = await cloudwatchlogs.describeLogStreams(params).promise();
        result.isSuccessful = true;
        if (response.logStreams) {
            for (var logStream of response.logStreams) {
                if (logStream.logStreamName) {
                    result.result.push(logStream.logStreamName);
                }
            }
        }
        return result;
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
async function GetLogEvents(Profile, Region, LogGroupName, LogStreamName, StartTime) {
    if (!StartTime) {
        StartTime = 0;
    }
    let result = new MethodResult_1.MethodResult();
    try {
        const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
        // Initialize the CloudWatchLogs client
        const cloudwatchlogs = new AWS.CloudWatchLogs({ region: Region, credentials: credentials });
        // Set the parameters for the describeLogGroups API
        const params = {
            logGroupName: LogGroupName,
            logStreamName: LogStreamName,
            limit: 20,
            startFromHead: false,
            startTime: StartTime
        };
        //https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_GetLogEvents.html
        let response = await cloudwatchlogs.getLogEvents(params).promise();
        if (response.events) {
            result.isSuccessful = true;
            result.result = response.events;
        }
        return result;
    }
    catch (error) {
        result.isSuccessful = false;
        result.error = error;
        ui.showErrorMessage('api.GetLogEvents Error !!!', error);
        ui.logToOutput("api.GetLogEvents Error !!!", error);
        return result;
    }
}
exports.GetLogEvents = GetLogEvents;
async function GetRegionList(Profile) {
    let result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        const credentials = new AWS.SharedIniFileCredentials({ profile: Profile });
        const ec2 = new AWS.EC2({ region: 'us-east-1', credentials: credentials });
        let response = await ec2.describeRegions().promise();
        result.isSuccessful = true;
        if (response.Regions) {
            for (var r of response.Regions) {
                if (r.RegionName) {
                    result.result.push(r.RegionName);
                }
            }
        }
        return result;
    }
    catch (error) {
        result.isSuccessful = false;
        result.error = error;
        ui.showErrorMessage('api.GetRegionList Error !!!', error);
        ui.logToOutput("api.GetRegionList Error !!!", error);
        return result;
    }
}
exports.GetRegionList = GetRegionList;
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
//# sourceMappingURL=API.js.map