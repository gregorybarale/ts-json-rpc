# Git Flow Reference

This document provides detailed instructions for using Git Flow with the ts-json-rpc project using standard git commands only.

## 🚀 Quick Setup

### Prerequisites
- Git installed and configured
- Access to the repository

### Initial Setup

Ensure you have both main branches:

```bash
# Clone the repository
git clone <repository-url>
cd ts-json-rpc

# Create develop branch if it doesn't exist
git checkout -b develop
git push -u origin develop

# Switch back to main
git checkout main
```

## 📋 Branch Strategy Overview

### Main Branches
- **`main`**: Production-ready code only. Tagged releases.
- **`develop`**: Integration branch. Latest development changes.

### Supporting Branches
- **`feature/*`**: New features and enhancements
- **`release/*`**: Release preparation and versioning
- **`hotfix/*`**: Critical production fixes

## 🔄 Common Workflows

### Feature Development

#### Start a Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-websocket-transport
```

#### Work on Feature
```bash
# Make your changes
npm run build
npm test
npm run lint

# Commit regularly
git add .
git commit -m "feat(transport): add WebSocket transport implementation"

# Push feature branch for backup/collaboration
git push -u origin feature/add-websocket-transport
```

#### Finish Feature
```bash
# Update develop branch
git checkout develop
git pull origin develop

# Merge feature with no-fast-forward to preserve branch history
git merge --no-ff feature/add-websocket-transport

# Push changes
git push origin develop

# Clean up local branch
git branch -d feature/add-websocket-transport

# Clean up remote branch
git push origin --delete feature/add-websocket-transport
```

### Release Process

#### Start Release (Maintainers)
```bash
git checkout develop
git pull origin develop
git checkout -b release/1.2.0
```

#### Prepare Release
```bash
# Update package.json versions
npm version 1.2.0 --no-git-tag-version

# Update CHANGELOG.md
npm run changelog

# Final testing
npm run build
npm test
npm run lint

# Commit release changes
git add .
git commit -m "chore(release): prepare version 1.2.0"

# Push release branch
git push -u origin release/1.2.0
```

#### Finish Release (Maintainers)
```bash
# Merge to main
git checkout main
git pull origin main
git merge --no-ff release/1.2.0

# Tag the release
git tag -a v1.2.0 -m "Release version 1.2.0"

# Push main and tags
git push origin main --tags

# Merge back to develop
git checkout develop
git pull origin develop  
git merge --no-ff release/1.2.0
git push origin develop

# Clean up release branch
git branch -d release/1.2.0
git push origin --delete release/1.2.0
```

### Hotfix Process

#### Start Hotfix
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix
```

#### Apply Fix
```bash
# Make minimal fix
# Add regression test
# Update version (patch increment)

npm run build
npm test
npm run lint

git add .
git commit -m "fix(security): resolve critical vulnerability"

# Push hotfix branch
git push -u origin hotfix/critical-security-fix
```

#### Finish Hotfix
```bash
# Merge to main
git checkout main
git pull origin main
git merge --no-ff hotfix/critical-security-fix

# Tag the hotfix
git tag -a v1.1.1 -m "Hotfix version 1.1.1"

# Push main and tags
git push origin main --tags

# Merge to develop
git checkout develop
git pull origin develop
git merge --no-ff hotfix/critical-security-fix  
git push origin develop

# Clean up hotfix branch
git branch -d hotfix/critical-security-fix
git push origin --delete hotfix/critical-security-fix
```

## 🔧 Configuration

### Git Aliases (Optional)
Add to your `~/.gitconfig` for convenience:

```ini
[alias]
    # Feature workflow
    feature-start = "!f() { git checkout develop && git pull origin develop && git checkout -b feature/$1; }; f"
    feature-finish = "!f() { git checkout develop && git pull origin develop && git merge --no-ff feature/$1 && git push origin develop && git branch -d feature/$1 && git push origin --delete feature/$1; }; f"
    
    # Release workflow  
    release-start = "!f() { git checkout develop && git pull origin develop && git checkout -b release/$1; }; f"
    release-finish = "!f() { git checkout main && git pull origin main && git merge --no-ff release/$1 && git tag -a v$1 -m \"Release version $1\" && git push origin main --tags && git checkout develop && git pull origin develop && git merge --no-ff release/$1 && git push origin develop && git branch -d release/$1 && git push origin --delete release/$1; }; f"
    
    # Hotfix workflow
    hotfix-start = "!f() { git checkout main && git pull origin main && git checkout -b hotfix/$1; }; f"
    hotfix-finish = "!f() { git checkout main && git pull origin main && git merge --no-ff hotfix/$1 && git tag -a v$2 -m \"Hotfix version $2\" && git push origin main --tags && git checkout develop && git pull origin develop && git merge --no-ff hotfix/$1 && git push origin develop && git branch -d hotfix/$1 && git push origin --delete hotfix/$1; }; f"
```

Usage examples:
```bash
git feature-start websocket-transport
git feature-finish websocket-transport

git release-start 1.2.0
git release-finish 1.2.0

git hotfix-start critical-fix
git hotfix-finish critical-fix 1.1.1
```

### Branch Protection (Repository Settings)

Configure on GitHub/GitLab:

**`main` branch:**
- Require pull request reviews
- Require status checks (CI/CD)
- Require up-to-date branches
- Include administrators

**`develop` branch:**
- Require pull request reviews  
- Require status checks (CI/CD)
- Allow force pushes (for maintainers)

## 📊 Branch Naming Examples

### Features
- `feature/websocket-transport`
- `feature/batch-request-optimization`
- `feature/custom-error-types`
- `feature/typescript-5-support`

### Releases
- `release/1.0.0` (major)
- `release/1.1.0` (minor) 
- `release/1.1.1` (patch)

### Hotfixes
- `hotfix/security-vulnerability`
- `hotfix/memory-leak-fix`
- `hotfix/critical-error-handling`

## 🚨 Best Practices

### Feature Branches
- Keep features small and focused
- Regularly rebase on develop to avoid conflicts:
  ```bash
  git checkout feature/my-feature
  git rebase develop
  ```
- Write comprehensive tests
- Update documentation
- Use conventional commit messages

### Release Branches
- No new features, only bug fixes
- Update version numbers consistently
- Generate/update CHANGELOG.md
- Thorough testing before merge
- Tag with semantic version

### Hotfix Branches  
- Minimal changes only
- Include regression tests
- Fast-track testing
- Immediate deployment ready
- Merge to both main and develop

## 🔍 Troubleshooting

### Common Issues

**"Branch already exists"**
```bash  
git branch -D feature/branch-name
git checkout develop
git checkout -b feature/branch-name
```

**"Merge conflicts during merge"**
```bash
# During merge, if conflicts occur:
git status  # See conflicted files
# Edit files to resolve conflicts
git add .
git commit -m "resolve merge conflicts"
```

**"Accidentally committed to wrong branch"**
```bash
# Move commits to correct branch
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1  # Remove last commit
```

### Recovery Commands

**Clean up abandoned branches:**
```bash
# Local cleanup
git branch -D feature/abandoned-feature

# Remote cleanup
git push origin --delete feature/abandoned-feature
```

**Sync with remote:**
```bash
# Fetch all remote branches
git fetch --all

# See all branches
git branch -a

# Clean up local references to deleted remote branches
git remote prune origin
```

**Reset branch to match remote:**
```bash
git checkout main
git reset --hard origin/main
```

## 📈 Workflow Summary

### Daily Development
1. Start from `develop`
2. Create `feature/` branch
3. Work and commit regularly
4. Push feature branch for backup
5. Merge to `develop` when complete
6. Clean up feature branch

### Release Cycle
1. Create `release/` from `develop`
2. Prepare release (versions, changelog)
3. Test thoroughly
4. Merge to `main` and tag
5. Merge back to `develop`
6. Clean up release branch

### Emergency Fixes
1. Create `hotfix/` from `main`
2. Fix issue quickly
3. Test fix
4. Merge to `main` and tag
5. Merge to `develop`
6. Clean up hotfix branch

## 📚 References

- [Git Flow Original Blog Post](https://nvie.com/posts/a-successful-git-branching-model/)
- [Atlassian Git Flow Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)