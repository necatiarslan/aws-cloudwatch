/* eslint-disable @typescript-eslint/naming-convention */
const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const PauseTimerButton = document.getElementById("pause_timer");
  PauseTimerButton.addEventListener("click", PauseTimerClick);


}


function PauseTimerClick() {
  vscode.postMessage({
    command: "pause_timer"
  });
}
