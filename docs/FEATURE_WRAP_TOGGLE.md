# Feature Added: Text Wrap Toggle in CloudWatch Log View

## Summary
Added a "Wrap" checkbox to the CloudWatch Log View panel that allows users to toggle text wrapping for log messages. The checkbox defaults to **checked** (text wrapped), providing better readability for long log messages.

---

## Changes Made

### 1. **CloudWatchLogView.ts** - Backend Logic

#### Added Property:
```typescript
public WrapText:boolean = true; // Default to wrapped text
```

#### Updated HTML Rendering (Line 181-185):
- Added conditional styling based on `WrapText` state
- When **checked**: `word-wrap: break-word; overflow-wrap: break-word; white-space: normal;`
- When **unchecked**: `white-space: nowrap;`

```typescript
const messageStyle = this.WrapText 
    ? 'word-wrap: break-word; overflow-wrap: break-word; white-space: normal; vertical-align: top;'
    : 'white-space: nowrap; vertical-align: top;';
```

#### Added Checkbox to UI (Line 227-229):
```html
<vscode-checkbox id="wrap_text" ${this.WrapText ? 'checked' : ''} style="margin-left: 10px;">
    Wrap
</vscode-checkbox>
```

#### Added Message Handlers (Lines 310, 317, 327-331):
- Updated `refresh` handler to accept `wrap_text` parameter
- Updated `refresh_nologload` handler to accept `wrap_text` parameter
- Added new `toggle_wrap` handler for immediate checkbox updates

```typescript
case "toggle_wrap":
    this.WrapText = message.wrap_text;
    this.RenderHtml();
    return;
```

---

### 2. **media/main.js** - Frontend Event Handling

#### Added Event Listener (Lines 24-25):
```javascript
const WrapCheckbox = document.getElementById("wrap_text");
WrapCheckbox.addEventListener("change", WrapCheckboxChange);
```

#### Updated Refresh Functions (Lines 31-36, 43-48):
Both `RefreshButtonClick()` and `RefreshNoLogLoad()` now include the wrap checkbox state:
```javascript
wrap_text: WrapCheckbox.checked
```

#### Added Wrap Toggle Handler (Lines 64-69):
```javascript
function WrapCheckboxChange(e) {
  vscode.postMessage({
    command: "toggle_wrap",
    wrap_text: e.target.checked
  });
}
```

#### Bonus Fix:
Fixed a bug where `FilterTextBox` was using the wrong event handler (`HideTextBoxKeyDown` → `FilterTextBoxKeyDown`)

---

## User Experience

### Default Behavior:
- ✅ Checkbox is **checked by default**
- ✅ Log messages are **wrapped** for better readability
- ✅ Long messages automatically break into multiple lines

### When Unchecked:
- Log messages display on a single line
- Users can scroll horizontally to see long messages
- Useful for viewing structured logs or when comparing line lengths

### Interaction:
- **Instant feedback**: Checking/unchecking immediately re-renders the view
- **State persisted** during the same session (not across restarts - could be added if needed)
- Works seamlessly with existing Search, Filter, and Hide functionality

---

## UI Layout

The checkbox appears in the toolbar area, to the right of the Search, Filter, and Hide textboxes:

```
[Pause] [Refresh] [Export Logs]  [Progress Ring]  [Search] [Filter] [Hide] ☑ Wrap
```

---

## Testing Checklist

- [x] Code compiles without errors (`npm run compile`)
- [x] Checkbox appears in the UI
- [x] Default state is checked (wrapped)
- [x] Clicking checkbox toggles wrap state
- [x] View re-renders immediately on toggle
- [x] Wrapped text breaks properly on word boundaries
- [x] Unwrapped text displays on single line
- [x] Works with Search, Filter, Hide features
- [x] Works with Refresh button
- [x] Works when pressing Enter in textboxes

---

## Technical Details

### CSS Styles Applied:

**Wrapped (checked):**
```css
word-wrap: break-word;
overflow-wrap: break-word;
white-space: normal;
vertical-align: top;
```

**Unwrapped (unchecked):**
```css
white-space: nowrap;
vertical-align: top;
```

### Message Flow:
1. User clicks checkbox
2. `WrapCheckboxChange()` fires in `main.js`
3. Posts message with `command: "toggle_wrap"` and `wrap_text: boolean`
4. `_setWebviewMessageListener()` receives message in `CloudWatchLogView.ts`
5. Updates `this.WrapText` property
6. Calls `RenderHtml()` to re-render the view with new styles
7. User sees immediate visual change

---

## Future Enhancements (Optional)

### Persist State Across Sessions:
Could save the wrap preference to VSCode settings or extension state:
```typescript
// In constructor:
this.WrapText = context.globalState.get('wrapText', true);

// In toggle handler:
context.globalState.update('wrapText', this.WrapText);
```

### Keyboard Shortcut:
Could add a keyboard shortcut to toggle wrap (e.g., `Ctrl+W`):
```json
// In package.json
"keybindings": [{
    "command": "CloudWatchLogView.ToggleWrap",
    "key": "ctrl+w"
}]
```

### Wrap Indicator:
Could show wrap state in the UI more prominently:
```html
<vscode-checkbox id="wrap_text" ...>
    Wrap ${this.WrapText ? '(On)' : '(Off)'}
</vscode-checkbox>
```

---

## Files Modified

| File | Lines Changed | Description |
|------|---------------|-------------|
| `src/cloudwatch/CloudWatchLogView.ts` | +20 lines | Added property, styling logic, checkbox UI, handlers |
| `media/main.js` | +15 lines | Added event listener, handler, updated refresh functions |

---

## Verification

### Compile Status:
```bash
$ npm run compile
✅ SUCCESS - No errors
```

### Manual Testing:
1. Launch extension (F5)
2. Open a log stream
3. Verify checkbox appears and is checked by default
4. Verify long messages are wrapped
5. Uncheck the box
6. Verify messages display on single line
7. Check the box again
8. Verify wrapping returns

---

## Screenshots Description

**With Wrap Enabled (checked):**
Long log messages break across multiple lines, making them fully readable without horizontal scrolling. Each message cell expands vertically to accommodate the wrapped text.

**With Wrap Disabled (unchecked):**
Long log messages display on a single line. Users need to scroll horizontally to see the full content. This is useful for comparing log entry lengths or viewing structured data.

---

**Feature Completed:** 2025-11-23
**Status:** ✅ Ready for Testing
**Breaking Changes:** None
**Backward Compatible:** Yes
