# AWS CloudWatch Extension - Refactoring Implementation Plan

## Overview
This plan outlines the step-by-step approach to refactor the extension while maintaining functionality at each step.

---

## 🎯 Strategy: Incremental Refactoring

We'll refactor in **3 phases** to minimize risk and maintain working code at each checkpoint.

---

## Phase 1: Critical Fixes (High Priority - Immediate)
**Goal:** Fix memory leaks and critical bugs WITHOUT renaming methods
**Duration:** Sprint 1  
**Risk:** Low

### Files to Modify:
1. ✅ `src/extension.ts`
2. ✅ `src/cloudwatch/CloudWatchLogView.ts`
3. ✅ `src/common/api.ts` (remove duplicates)

### Changes:

#### 1.1 Fix extension.ts (Keep existing method names)
```typescript
// Fix: Add all registrations to context.subscriptions
// Fix: Add try-catch blocks
// Keep: PascalCase method names (for now)

context.subscriptions.push(
    vscode.commands.registerCommand('CloudWatchTreeView.Refresh', async () => {
        try {
            await treeView.Refresh();  // Keep PascalCase for Phase 1
        } catch (error) {
            ui.showErrorMessage('Failed to refresh view', error as Error);
        }
    })
);
```

#### 1.2 Fix CloudWatchLogView.ts
```typescript
public dispose(): void {
    this.stopTimer(); // ADD THIS LINE
    CloudWatchLogView.Current = undefined;
    this._panel.dispose();
    // ... rest
}
```

#### 1.3 Fix api.ts
- Remove duplicate `getHomeDir`, `getCredentialsFilepath`, `getConfigFilepath`
- Import from `aws-sdk/` folder instead
- Make methods async where needed
- Add proper return types

#### 1.4 Add Loop Protection
In `CloudWatchLogView.ts` and `api.ts`:
```typescript
const MAX_ITERATIONS = 100;
let iterations = 0;
while (iterations++ < MAX_ITERATIONS) {
    // ... existing logic
}
if (iterations >= MAX_ITERATIONS) {
    throw new Error('Maximum iteration limit reached');
}
```

### Testing Checkpoint 1:
- ✅ Extension activates
- ✅ All commands work
- ✅ No memory leaks
- ✅ Proper error messages
- ✅ Timer cleanup works

---

## Phase 2: Naming & Code Quality (Medium Priority)
**Goal:** Rename methods to camelCase and improve TypeScript types
**Duration:** Sprint 2
**Risk:** Medium (requires coordinated changes across multiple files)

### Files to Modify:
1. `src/extension.ts`
2. `src/cloudwatch/CloudWatchTreeView.ts`
3. `src/cloudwatch/CloudWatchTreeDataProvider.ts`
4. `src/cloudwatch/CloudWatchLogView.ts`
5. `src/cloudwatch/CloudWatchTreeItem.ts`
6. `src/common/api.ts`
7. `src/common/ui.ts`

### Method Rename Map:

#### CloudWatchTreeView.ts:
| Old Name | New Name |
|----------|----------|
| `Refresh()` | `refresh()` |
| `LoadTreeItems()` | `loadTreeItems()` |
| `ResetView()` | `resetView()` |
| `AddToFav()` | `addToFavorites()` |
| `DeleteFromFav()` | `deleteFromFavorites()` |
| `Filter()` | `filter()` |
| `ShowOnlyFavorite()` | `showOnlyFavorite()` |
| `SetViewTitle()` | `setViewTitle()` |
| `SaveState()` | `saveState()` |
| `LoadState()` | `loadState()` |
| `SetFilterMessage()` | `setFilterMessage()` |
| `GetBoolenSign()` | `getBooleanSign()` (also fix typo) |
| `AddLogGroup()` | `addLogGroup()` |
| `AddLogGroupByName()` | `addLogGroupByName()` |
| `RemoveLogGroup()` | `removeLogGroup()` |
| `AddLogStream()` | `addLogStream()` |
| `RemoveLogStream()` | `removeLogStream()` |
| `AddAllLogStreams()` | `addAllLogStreams()` |
| `AddLogStreamsByDate()` | `addLogStreamsByDate()` |
| `RemoveAllLogStreams()` | `removeAllLogStreams()` |
| `ShowCloudWatchLogView()` | `showCloudWatchLogView()` |
| `SelectAwsProfile()` | `selectAwsProfile()` |
| `UpdateAwsEndPoint()` | `updateAwsEndPoint()` |

#### CloudWatchTreeDataProvider.ts:
| Old Name | New Name |
|----------|----------|
| `Refresh()` | `refresh()` |
| `AddLogGroup()` | `addLogGroup()` |
| `RemoveLogGroup()` | `removeLogGroup()` |
| `RemoveAllLogStreams()` | `removeAllLogStreams()` |
| `AddLogStream()` | `addLogStream()` |
| `RemoveLogStream()` | `removeLogStream()` |
| `LoadLogGroupNodeList()` | `loadLogGroupNodeList()` |
| `LoadRegionNodeList()` | `loadRegionNodeList()` |
| `GetRegionNode()` | `getRegionNode()` |
| `LoadLogStreamNodeList()` | `loadLogStreamNodeList()` |
| `GetNodesRegionLogGroupLogStream()` | `getNodesRegionLogGroupLogStream()` |
| `GetRegionNodes()` | `getRegionNodes()` |
| `GetNodesLogStream()` | `getNodesLogStream()` |
| `GetNodesLogGroupLogStream()` | `getNodesLogGroupLogStream()` |
| `GetLogGroupNodes()` | `getLogGroupNodes()` |
| `GetLogGroupNodesParentRegion()` | `getLogGroupNodesParentRegion()` |
| `GetLogStreamNodesParentLogGroup()` | `getLogStreamNodesParentLogGroup()` |
| `GetLogStreamNodes()` | `getLogStreamNodes()` |

#### Property Renames:
| Old Name | New Name |
|----------|----------|
| `FilterString` | `filterString` |
| `AwsProfile` | `awsProfile` |
| `AwsEndPoint` | `awsEndPoint` |
| `LastUsedRegion` | `lastUsedRegion` |
| `LogGroupList` | `logGroupList` |
| `LogStreamList` | `logStreamList` |
| `RegionNodeList` | `regionNodeList` |
| `LogGroupNodeList` | `logGroupNodeList` |
| `LogStreamNodeList` | `logStreamNodeList` |
| `TreeItemType` | `treeItemType` |
| `IsFav` | `isFavorite` |
| `IsHidden` | `isHidden` |
| `ProfileToShow` | `profileToShow` |

### TypeScript Improvements:
- Replace `var` with `const`/`let`
- Add return types to all methods
- Replace `any` with proper types
- Add proper null checks

### Testing Checkpoint 2:
- ✅ All functionality still works
- ✅ No lint errors
- ✅ TypeScript compilation successful
- ✅ Consistent naming throughout

---

## Phase 3: Architecture & Performance (Low Priority - Future)
**Goal:** Extract services, add caching, improve architecture
**Duration:** Sprint 3+
**Risk:** Medium

### New Files to Create:
1. `src/services/StateManager.ts`
2. `src/services/CloudWatchService.ts`
3. `src/services/CacheService.ts`
4. `src/types/index.ts` (centralized types)

### Architectural Changes:

#### 3.1 StateManager Service
```typescript
export class StateManager {
    constructor(private context: vscode.ExtensionContext) {}
    
    async save<T>(key: string, value: T): Promise<void> {
        // Validation, versioning, error handling
    }
    
    async load<T>(key: string, defaultValue: T): Promise<T> {
        // Migration, validation
    }
}
```

#### 3.2 CloudWatchService 
```typescript
export class CloudWatchService {
    constructor(
        private cache: CacheService,
        private stateManager: StateManager
    ) {}
    
    async getLogGroups(region: string): Promise<string[]> {
        // Check cache first
        // Call AWS API
        // Update cache
    }
}
```

#### 3.3 CacheService
```typescript
export class CacheService<T> {
    private cache = new Map<string, CachedItem<T>>();
    
    get(key: string, ttl: number = 60000): T | undefined {
        // TTL-based caching
    }
    
    set(key string, value: T): void {
        // Store with timestamp
    }
}
```

### Testing Checkpoint 3:
- ✅ Improved performance (fewer AWS calls)
- ✅ Better testability
- ✅ Cleaner separation of concerns

---

## 🔍 Current Status

**Completed:**
- ✅ Created CODE_REVIEW.md with detailed analysis
- ✅ Created REFACTORING_SUMMARY.md
- ✅ Created this IMPLEMENTATION_PLAN.md
- ⏳ Started Phase 1 (in progress)

**Next Steps:**
1. Complete Phase 1 (fix critical issues without renaming)
2. Test thoroughly
3. Proceed to Phase 2 (naming refactor)

---

## 📋 Detailed File Changes for Phase 1

### File 1: `src/extension.ts` (Phase 1 Version)

**Changes:**
- Add all `context.subscriptions.push()` calls
- Add try-catch error handling
- Make command handlers async
- Keep existing PascalCase method names (change in Phase 2)

### File 2: `src/cloudwatch/CloudWatchLogView.ts`

**Changes:**
- Add `this.stopTimer()` to `dispose()` method
- Add iteration limit to `GetLogEvents` while loop (line 203)
- Clean up commented code (lines 117-131)
- Replace `var` with `const`
- Add return types

### File 3: `src/common/api.ts`

**Changes:**
- Remove duplicate functions (lines 264-278)
- Import from `aws-sdk/` folder:
  ```typescript
  import { getHomeDir } from '../aws-sdk/getHomeDir';
  import { getCredentialsFilepath } from '../aws-sdk/getCredentialsFilepath';
  import { getConfigFilepath } from '../aws-sdk/getConfigFilepath';
  ```
- Add return types to all functions
- Improve error messages
- Add iteration limit in GetLogEvents

### File 4: `src/cloudwatch/CloudWatchTreeDataProvider.ts`

**Changes:**
- Replace array splice loops with filter (lines 39-60, 63-72, 91-100)
- Remove unused `ViewType` enum (lines 276-280)
- Add return types

### File 5: `src/cloudwatch/CloudWatchTreeView.ts`

**Changes:**
- Make `LoadTreeItems` properly async
- Remove obsolete migration code (lines 143-159)
- Fix property rename `ShowOnlyFavorite` → `isShowOnlyFavorite` (already exists)
- Add return types
- Replace `var` with `const`

---

## 🧪 Testing Strategy

### Unit Tests (Future):
```typescript
describe('CloudWatchTreeView', () => {
    it('should add log group without duplicates', () => {
        // Test addLogGroup logic
    });
    
    it('should filter items correctly', () => {
        // Test filtering logic
    });
});
```

### Manual Testing Checklist:
- [ ] Extension activates without errors
- [ ] Refresh command works
- [ ] Filter command works
- [ ] Add/Remove log groups works
- [ ] Add/Remove log streams works
- [ ] View logs works
- [ ] Profile selection works
- [ ] State persists between sessions
- [ ] No memory leaks (check after 1 hour)
- [ ] Error messages are user-friendly

---

## 📊 Risk Assessment

| Phase | Risk Level | Mitigation |
|-------|------------|------------|
| Phase 1 | 🟢 Low | Minimal changes, keeps existing names |
| Phase 2 | 🟡 Medium | Coordinated rename, thorough testing |
| Phase 3 | 🟡 Medium | New architecture, gradual migration |

---

## 🎓 Best Practices Applied

1. **Incremental refactoring** - Don't change everything at once
2. **Testing checkpoints** - Verify after each phase
3. **Backward compatibility** - State format unchanged
4. **Error handling** - Comprehensive try-catch blocks
5. **Memory management** - Proper disposable cleanup
6. **Type safety** - Full TypeScript typing
7. **Documentation** - JSDocs for public APIs
8. **Code quality** - Consistent naming, no dead code

---

**Created:** 2025-11-23  
**Last Updated:** 2025-11-23  
**Status:** Phase 1 In Progress
