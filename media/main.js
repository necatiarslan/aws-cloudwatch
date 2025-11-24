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
  FilterTextBox.addEventListener("keydown", FilterTextBoxKeyDown);

  const RefreshButton = document.getElementById("refresh");
  RefreshButton.addEventListener("click", RefreshButtonClick);

  const WrapCheckbox = document.getElementById("wrap_text");
  WrapCheckbox.addEventListener("change", WrapCheckboxChange);

  const UseDateTimeFilterCheckbox = document.getElementById("use_datetime_filter");
  UseDateTimeFilterCheckbox.addEventListener("change", UseDateTimeFilterCheckboxChange);

  const FilterStartDate = document.getElementById("filter_start_date");
  FilterStartDate.addEventListener("change", DateTimeFilterChange);

  const FilterStartTime = document.getElementById("filter_start_time");
  FilterStartTime.addEventListener("change", DateTimeFilterChange);
}

function RefreshButtonClick() {
  const SearchTextBox = document.getElementById("search_text");
  const HideTextBox = document.getElementById("hide_text");
  const FilterTextBox = document.getElementById("filter_text");
  const WrapCheckbox = document.getElementById("wrap_text");
  const UseDateTimeFilterCheckbox = document.getElementById("use_datetime_filter");
  const FilterStartDate = document.getElementById("filter_start_date");
  const FilterStartTime = document.getElementById("filter_start_time");

  vscode.postMessage({
    command: "refresh",
    search_text: SearchTextBox._value,
    hide_text: HideTextBox._value,
    filter_text: FilterTextBox._value,
    wrap_text: WrapCheckbox.checked,
    use_datetime_filter: UseDateTimeFilterCheckbox.checked,
    filter_start_date: FilterStartDate.value,
    filter_start_time: FilterStartTime.value
  });
}

function RefreshNoLogLoad() {
  const SearchTextBox = document.getElementById("search_text");
  const HideTextBox = document.getElementById("hide_text");
  const FilterTextBox = document.getElementById("filter_text");
  const WrapCheckbox = document.getElementById("wrap_text");
  const UseDateTimeFilterCheckbox = document.getElementById("use_datetime_filter");
  const FilterStartDate = document.getElementById("filter_start_date");
  const FilterStartTime = document.getElementById("filter_start_time");

  vscode.postMessage({
    command: "refresh_nologload",
    search_text: SearchTextBox._value,
    hide_text: HideTextBox._value,
    filter_text: FilterTextBox._value,
    wrap_text: WrapCheckbox.checked,
    use_datetime_filter: UseDateTimeFilterCheckbox.checked,
    filter_start_date: FilterStartDate.value,
    filter_start_time: FilterStartTime.value
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

function WrapCheckboxChange(e) {
  vscode.postMessage({
    command: "toggle_wrap",
    wrap_text: e.target.checked
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

function UseDateTimeFilterCheckboxChange(e) {
  // Enable/disable the date and time inputs
  const FilterStartDate = document.getElementById("filter_start_date");
  const FilterStartTime = document.getElementById("filter_start_time");

  FilterStartDate.disabled = !e.target.checked;
  FilterStartTime.disabled = !e.target.checked;

  vscode.postMessage({
    command: "toggle_datetime_filter",
    use_datetime_filter: e.target.checked
  });
}

function DateTimeFilterChange() {
  const FilterStartDate = document.getElementById("filter_start_date");
  const FilterStartTime = document.getElementById("filter_start_time");

  vscode.postMessage({
    command: "update_datetime_filter",
    filter_start_date: FilterStartDate.value,
    filter_start_time: FilterStartTime.value
  });
}
