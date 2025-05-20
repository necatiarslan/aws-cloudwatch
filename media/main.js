/* eslint-disable @typescript-eslint/naming-convention */
const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const PauseTimerButton = document.getElementById("pause_timer");
  PauseTimerButton.addEventListener("click", PauseTimerClick);

  const ExportLogsButton = document.getElementById("export_logs");
  ExportLogsButton.addEventListener("click", ExportLogsClick);

  const SearchTextBox = document.getElementById("search_text");
  SearchTextBox.addEventListener("keydown", SearchTextBoxKeyDown);

  const HideTextBox = document.getElementById("hide_text");
  HideTextBox.addEventListener("keydown", HideTextBoxKeyDown);

  const FilterTextBox = document.getElementById("filter_text");
  FilterTextBox.addEventListener("keydown", HideTextBoxKeyDown);

  const RefreshButton = document.getElementById("refresh");
  RefreshButton.addEventListener("click", RefreshButtonClick);

}

function RefreshButtonClick() {
  const SearchTextBox = document.getElementById("search_text");
  const HideTextBox = document.getElementById("hide_text");
  const FilterTextBox = document.getElementById("filter_text");
  vscode.postMessage({
    command: "refresh",
    search_text: SearchTextBox._value,
    hide_text: HideTextBox._value,
    filter_text: FilterTextBox._value
  });
}

function RefreshNoLogLoad() {
  const SearchTextBox = document.getElementById("search_text");
  const HideTextBox = document.getElementById("hide_text");
  const FilterTextBox = document.getElementById("filter_text");
  vscode.postMessage({
    command: "refresh_nologload",
    search_text: SearchTextBox._value,
    hide_text: HideTextBox._value,
    filter_text: FilterTextBox._value
  });
}

function PauseTimerClick() {
  vscode.postMessage({
    command: "pause_timer"
  });
}

function ExportLogsClick() {
  vscode.postMessage({
    command: "export_logs"
  });
}

function SearchTextBoxKeyDown(e) {
  if (e.key === "Enter") {
    RefreshNoLogLoad();
  }
}

function HideTextBoxKeyDown(e) {
  if (e.key === "Enter") {
    RefreshNoLogLoad();
  }
}

function FilterTextBoxKeyDown(e) {
  if (e.key === "Enter") {
    RefreshNoLogLoad();
  }
}
