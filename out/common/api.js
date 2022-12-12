"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRegionList = exports.GetLogEvents = exports.GetLogStreamList = exports.GetLogGroupList = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const AWS = require("aws-sdk");
const ui = require("./UI");
const MethodResult_1 = require("./MethodResult");
async function GetLogGroupList(Region) {
    let result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        // Initialize the CloudWatchLogs client
        const cloudwatchlogs = new AWS.CloudWatchLogs({ region: Region });
        // Set the parameters for the describeLogGroups API
        const params = {
            limit: 50,
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
async function GetLogStreamList(Region, LogGroupName) {
    let result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        const cloudwatchlogs = new AWS.CloudWatchLogs({ region: Region });
        const params = {
            logGroupName: LogGroupName,
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
async function GetLogEvents(Region, LogGroupName, LogStreamName, StartTime) {
    if (!StartTime) {
        StartTime = 0;
    }
    let result = new MethodResult_1.MethodResult();
    // Initialize the CloudWatchLogs client
    const cloudwatchlogs = new AWS.CloudWatchLogs({ region: Region });
    // Set the parameters for the describeLogGroups API
    const params = {
        logGroupName: LogGroupName,
        logStreamName: LogStreamName,
        limit: 100,
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
exports.GetLogEvents = GetLogEvents;
async function GetRegionList() {
    let result = new MethodResult_1.MethodResult();
    result.result = [];
    try {
        const ec2 = new AWS.EC2({ region: 'us-east-1' });
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
//# sourceMappingURL=API.js.map