"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchAIHandler = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = __importStar(require("vscode"));
const ui = __importStar(require("../common/UI"));
class CloudWatchAIHandler {
    constructor() {
        CloudWatchAIHandler.Current = this;
    }
    /**
     * Main AI handler for chat participant
     */
    async aIHandler(request, context, stream, token) {
        ui.logToOutput('CloudWatchAIHandler.aIHandler Started');
        try {
            // Construct the initial messages
            const messages = [
                vscode.LanguageModelChatMessage.User('You are an expert in AWS CloudWatch logs analysis. Analyze the provided logs and identify any errors, warnings, or issues.'),
            ];
            // Add context if available
            if (this.logsContext) {
                const logsSummary = this.formatLogsForContext(this.logsContext.logEvents);
                messages.push(vscode.LanguageModelChatMessage.User(`CloudWatch Logs Context:\nRegion: ${this.logsContext.region}\nLog Group: ${this.logsContext.logGroup}\nLog Stream: ${this.logsContext.logStream}\n\nLogs:\n${logsSummary}`));
            }
            messages.push(vscode.LanguageModelChatMessage.User(request.prompt));
            // Select Model and Send Request
            const [model] = await vscode.lm.selectChatModels({ family: 'gpt-4' });
            if (!model) {
                stream.markdown('No suitable AI model found.');
                return;
            }
            // Tool calling loop
            let keepGoing = true;
            while (keepGoing && !token.isCancellationRequested) {
                keepGoing = false;
                const chatResponse = await model.sendRequest(messages, {}, token);
                for await (const fragment of chatResponse.text) {
                    stream.markdown(fragment);
                }
                // Collect tool calls from the response
                const toolCalls = [];
                for await (const part of chatResponse.stream) {
                    if (part instanceof vscode.LanguageModelToolCallPart) {
                        toolCalls.push(part);
                    }
                }
                // Execute tools if any were called
                if (toolCalls.length > 0) {
                    keepGoing = true;
                    messages.push(vscode.LanguageModelChatMessage.Assistant(toolCalls));
                    for (const toolCall of toolCalls) {
                        stream.progress(`Running tool: ${toolCall.name}...`);
                        try {
                            const result = await vscode.lm.invokeTool(toolCall.name, { input: toolCall.input }, token);
                            const resultText = result.content
                                .filter((part) => part instanceof vscode.LanguageModelTextPart)
                                .map((part) => part.value)
                                .join('\n');
                            messages.push(vscode.LanguageModelChatMessage.User([
                                new vscode.LanguageModelToolResultPart(toolCall.callId, [new vscode.LanguageModelTextPart(resultText)]),
                            ]));
                        }
                        catch (err) {
                            const errorMessage = `Tool execution failed: ${err instanceof Error ? err.message : String(err)}`;
                            messages.push(vscode.LanguageModelChatMessage.User([
                                new vscode.LanguageModelToolResultPart(toolCall.callId, [new vscode.LanguageModelTextPart(errorMessage)]),
                            ]));
                        }
                    }
                }
            }
        }
        catch (err) {
            if (err instanceof Error) {
                stream.markdown(`I'm sorry, I couldn't connect to the AI model: ${err.message}`);
            }
            else {
                stream.markdown("I'm sorry, I couldn't connect to the AI model.");
            }
        }
        ui.logToOutput('CloudWatchAIHandler.aIHandler Completed');
    }
    /**
     * Format logs for context in chat
     */
    formatLogsForContext(logEvents) {
        if (!logEvents || logEvents.length === 0) {
            return 'No logs available';
        }
        // Limit to last 50 logs for context
        const recentLogs = logEvents; //logEvents.slice(-50);
        return recentLogs
            .map((event) => {
            const timeString = event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : '';
            return `[${timeString}] ${event.message || ''}`;
        })
            .join('\n');
    }
    /**
     * Check if chat command is available
     */
    async isChatCommandAvailable() {
        const commands = await vscode.commands.getCommands(true);
        return commands.includes('workbench.action.chat.open');
    }
    /**
     * Ask AI with logs context
     */
    async askAIWithLogsContext(region, logGroup, logStream, logEvents) {
        ui.logToOutput('CloudWatchAIHandler.askAIWithLogsContext Started');
        if (!await this.isChatCommandAvailable()) {
            ui.showErrorMessage('Chat command is not available.', new Error('Please ensure you have access to VS Code AI features.'));
            return;
        }
        // Store context for the chat handler
        this.logsContext = {
            region,
            logGroup,
            logStream,
            logEvents,
        };
        // Build the prompt with log information
        const logsSummary = this.formatLogsForContext(logEvents);
        const prompt = `Region: ${region}\nLog Group: ${logGroup}\nLog Stream: ${logStream}\n\nLogs:\n${logsSummary}\n\nAnalyse these logs and explain if any error`;
        // Open chat with initial prompt
        const appName = vscode.env.appName;
        let commandId = '';
        if (appName.includes('Antigravity')) {
            commandId = 'antigravity.startAgentTask';
        }
        else if (appName.includes('Code - OSS') || appName.includes('Visual Studio Code')) {
            commandId = 'workbench.action.chat.open';
        }
        else {
            commandId = 'workbench.action.chat.open';
        }
        await vscode.commands.executeCommand(commandId, {
            query: `@awscloudwatch ${prompt}`,
        });
    }
}
exports.CloudWatchAIHandler = CloudWatchAIHandler;
//# sourceMappingURL=CloudWatchAIHandler.js.map