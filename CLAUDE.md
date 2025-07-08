# Claude Code CLI Development Guidelines

## Core Instructions for Claude Code

### PRIMARY RULES
1. **EXAMINE FIRST** - Always read relevant codebase before making changes
2. **KEEP IT SIMPLE** - Choose the most straightforward solution
3. **ASK PERMISSION** - Never introduce new patterns/packages without explicit approval
4. **LOG EVERYTHING** - Document all changes in `todo.md` with detailed explanations

## Pre-Change Protocol

### Before Any Code Changes
```bash
# Always run these checks first:
1. Examine the codebase area you're modifying
2. Search for similar existing functionality
3. Identify all files that might be affected
4. Plan the minimal change required
```

### Required Examination Steps
- **Read the entire relevant section** - don't just look at the specific file
- **Search for duplicates** - `grep -r "similar_function" .` to find existing implementations
- **Check imports/exports** - understand what depends on your changes
- **Map the data flow** - trace how data moves through the system

## Change Implementation Rules

### What Requires Permission
- New npm packages or dependencies
- New architectural patterns or approaches
- Major refactoring (>20 lines changed)
- Package version updates
- Changes to config files (.env, package.json, etc.)
- New build tools or scripts

### Allowed Without Permission
- Bug fixes using existing patterns
- Minor refactoring within existing structure
- Adding comments or documentation
- Performance optimizations using existing code
- Requested feature implementations using existing patterns

## Code Quality Standards
- for this project, everything in typescript
### Function Design
```javascript
// GOOD: Small, focused functions
function validateUser(user) {
  if (!user.email) throw new Error('Email required');
  return user;
}

// BAD: Large, multi-purpose functions
function handleUserStuff(user, db, logger, config) {
  // 50+ lines of mixed responsibilities
}
```

### Error Handling
```javascript
// ALWAYS include error logging
try {
  const result = await someOperation();
  console.log('Operation successful:', result);
  return result;
} catch (error) {
  console.error('Operation failed:', error.message);
  throw error;
}
```

### Duplication Prevention
```bash
# Before writing new code, search for existing implementations:
grep -r "function.*similar" src/
grep -r "const.*similar" src/
grep -r "similar.*=" src/
```

## File Management

### Scripts Policy
- **NO scripts in main codebase** unless absolutely necessary
- **NO one-time scripts** - use external tools instead
- **Document any scripts** with clear purpose and usage

### Environment Files
- **NEVER overwrite .env** without explicit confirmation
- **Always backup** before env changes: `cp .env .env.backup`
- **Test env changes** in development first

## Change Logging Protocol

### Required `todo.md` Entry Format
```markdown
## [DATE] - [CHANGE_TYPE]: [BRIEF_DESCRIPTION]

**What Changed:**
- Specific files and functions modified
- New code added or removed

**Why:**
- Reason for the change
- Problem being solved

**How:**
- Implementation approach
- Key decisions made

**Impact:**
- Areas of code affected
- Potential side effects
- Breaking changes (if any)

**Testing:**
- How the change was verified
- Edge cases considered
```

## CLI Workflow Commands

### Examination Phase
```bash
# 1. Understand the codebase structure
find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | head -20

# 2. Search for similar functionality
grep -r "keyword" src/ --include="*.js" --include="*.ts"

# 3. Check dependencies
cat package.json | grep -A 10 -B 10 "dependencies"

# 4. Look for existing patterns
grep -r "export.*function" src/ | grep -i "similar_concept"
```

### Development Phase
```bash
# 1. Make minimal changes
# 2. Test frequently
# 3. Add error logging
# 4. Comment complex logic
```

### Post-Change Phase
```bash
# 1. Run tests
npm test

# 2. Check for issues
npm run lint

# 3. Update todo.md
echo "## $(date) - [CHANGE]: Description" >> todo.md

# 4. Verify no duplicates created
grep -r "new_function_name" src/
```

## Red Flags - Stop and Ask

### Immediate Stop Signals
- Adding `npm install` for new packages
- Creating new architectural patterns
- Modifying package.json dependencies
- Writing scripts that will only run once
- Changing .env files
- Refactoring multiple files simultaneously
- Creating duplicate functionality

### Warning Signs
- Code change affects >3 files
- Need to modify existing interfaces
- Introducing new design patterns
- Change requires new configuration
- Modifying shared utilities
- Adding new error types

## Quick Reference Commands

### Before Starting
```bash
# Examine codebase
find . -name "*.js" | xargs grep -l "relevant_keyword"

# Check for duplicates
grep -r "similar_function" src/

# Understand dependencies
npm list --depth=0
```

### During Development
```bash
# Test changes
npm test -- --watch

# Check code quality
npm run lint

# Add logging
console.log('DEBUG: operation_name', data);
console.error('ERROR: operation_name', error);
```

### After Changes
```bash
# Verify no duplicates
grep -r "new_function" src/

# Update documentation
echo "Change details" >> todo.md

# Final check
npm run build
```

## Emergency Protocols

### If You Break Something
1. **Immediately revert** - `git checkout -- file.js`
2. **Document what happened** in todo.md
3. **Analyze the failure** - what was missed in examination?
4. **Ask for guidance** before attempting fix

### If Unsure About Change
1. **Stop immediately**
2. **Document the uncertainty** in todo.md
3. **Ask for clarification** on the specific point
4. **Wait for permission** before proceeding

## Success Metrics

### Good Change Indicators
- ✅ Minimal lines of code changed
- ✅ Existing patterns followed
- ✅ No new dependencies added
- ✅ Comprehensive error logging
- ✅ Detailed todo.md entry
- ✅ Tests still pass
- ✅ No duplicate functionality created

### Bad Change Indicators
- ❌ Large refactoring without permission
- ❌ New patterns introduced
- ❌ Dependencies added without approval
- ❌ Poor or missing documentation
- ❌ Duplicate code created
- ❌ Existing functionality broken

---

**Remember: When in doubt, examine more, change less, and ask for permission.**
