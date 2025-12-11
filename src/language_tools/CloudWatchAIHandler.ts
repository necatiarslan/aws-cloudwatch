/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { OutputLogEvent } from '@aws-sdk/client-cloudwatch-logs';

export class CloudWatchAIHandler {
    public static Current: CloudWatchAIHandler;

    private logsContext: {
        region: string;
        logGroup: string;
        logStream: string;
        logEvents: OutputLogEvent[];
    } | undefined;

    constructor() {
        CloudWatchAIHandler.Current = this;
    }

    /**
     * Main AI handler for chat participant
     */
    public async aIHandler(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        ui.logToOutput('CloudWatchAIHandler.aIHandler Started');

        try {
            // Construct the initial messages
            const messages: vscode.LanguageModelChatMessage[] = [
                vscode.LanguageModelChatMessage.User(
                    'You are an expert in AWS CloudWatch logs analysis. Analyze the provided logs and identify any errors, warnings, or issues.'
                ),
            ];

            // Add context if available
            if (this.logsContext) {
                const logsSummary = this.formatLogsForContext(this.logsContext.logEvents);
                messages.push(
                    vscode.LanguageModelChatMessage.User(
                        `CloudWatch Logs Context:\nRegion: ${this.logsContext.region}\nLog Group: ${this.logsContext.logGroup}\nLog Stream: ${this.logsContext.logStream}\n\nLogs:\n${logsSummary}`
                    )
                );
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
                const toolCalls: vscode.LanguageModelToolCallPart[] = [];
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
                            const result = await vscode.lm.invokeTool(
                                toolCall.name,
                                { input: toolCall.input } as any,
                                token
                            );

                            const resultText = result.content
                                .filter((part) => part instanceof vscode.LanguageModelTextPart)
                                .map((part) => (part as vscode.LanguageModelTextPart).value)
                                .join('\n');

                            messages.push(
                                vscode.LanguageModelChatMessage.User([
                                    new vscode.LanguageModelToolResultPart(
                                        toolCall.callId,
                                        [new vscode.LanguageModelTextPart(resultText)]
                                    ),
                                ])
                            );
                        } catch (err) {
                            const errorMessage = `Tool execution failed: ${
                                err instanceof Error ? err.message : String(err)
                            }`;
                            messages.push(
                                vscode.LanguageModelChatMessage.User([
                                    new vscode.LanguageModelToolResultPart(
                                        toolCall.callId,
                                        [new vscode.LanguageModelTextPart(errorMessage)]
                                    ),
                                ])
                            );
                        }
                    }
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                stream.markdown(`I'm sorry, I couldn't connect to the AI model: ${err.message}`);
            } else {
                stream.markdown("I'm sorry, I couldn't connect to the AI model.");
            }
        }

        ui.logToOutput('CloudWatchAIHandler.aIHandler Completed');
    }

    /**
     * Format logs for context in chat
     */
    private formatLogsForContext(logEvents: OutputLogEvent[]): string {
        if (!logEvents || logEvents.length === 0) {
            return 'No logs available';
        }

        // Limit to last 50 logs for context
        const recentLogs = logEvents//logEvents.slice(-50);
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
    public async isChatCommandAvailable(): Promise<boolean> {
        const commands = await vscode.commands.getCommands(true);
        return commands.includes('workbench.action.chat.open');
    }

    /**
     * Ask AI with logs context
     */
    public async askAIWithLogsContext(
        region: string,
        logGroup: string,
        logStream: string,
        logEvents: OutputLogEvent[]
    ) {
        ui.logToOutput('CloudWatchAIHandler.askAIWithLogsContext Started');

        if (!await this.isChatCommandAvailable()) {
            ui.showErrorMessage(
                'Chat command is not available.',
                new Error('Please ensure you have access to VS Code AI features.')
            );
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
        } else if (appName.includes('Code - OSS') || appName.includes('Visual Studio Code')) {
            commandId = 'workbench.action.chat.open';
        } else {
            commandId = 'workbench.action.chat.open';
        }

        await vscode.commands.executeCommand(commandId, {
            query: `@awscloudwatch ${prompt}`,
        });
    }
}
