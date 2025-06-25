# Git Flow Setup and Reference

This document provides detailed setup instructions and reference for using Git Flow with the ts-json-rpc project.

## 🚀 Quick Setup

### 1. Install Git Flow Extensions

Choose your platform:

**macOS (with Homebrew):**
```bash
brew install git-flow-avh
```

**Ubuntu/Debian:**
```bash
sudo apt-get install git-flow
```

**Windows:**
- Download from: [Git Flow AVH](https://github.com/petervanderdoes/gitflow-avh)
- Or use Git Bash with manual commands (see Manual Workflow section)

**Alternative - Use Manual Git Commands:**
You don't need the git-flow extensions. All workflows can be done with standard git commands (see examples throughout this document).

### 2. Initialize Git Flow

In your local repository:

```bash
git flow init
```

Accept the defaults:
- Production branch: `main`
- Development branch: `develop` 
- Feature prefix: `feature/`
- Release prefix: `release/`
- Hotfix prefix: `hotfix/`
- Support prefix: `support/`
- Version tag prefix: `v`

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
# With git-flow
git flow feature start add-websocket-transport

# Manual approach
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
```

#### Finish Feature
```bash
# With git-flow
git flow feature finish add-websocket-transport

# Manual approach
git checkout develop
git pull origin develop
git merge --no-ff feature/add-websocket-transport
git branch -d feature/add-websocket-transport
git push origin develop
```

### Release Process

#### Start Release (Maintainers)
```bash
# With git-flow
git flow release start 1.2.0

# Manual approach
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
```

#### Finish Release (Maintainers)
```bash
# With git-flow
git flow release finish 1.2.0

# Manual approach
git checkout main
git pull origin main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

git checkout develop
git pull origin develop  
git merge --no-ff release/1.2.0
git push origin develop

git branch -d release/1.2.0
```

### Hotfix Process

#### Start Hotfix
```bash
# With git-flow
git flow hotfix start critical-security-fix

# Manual approach
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
```

#### Finish Hotfix
```bash
# With git-flow  
git flow hotfix finish critical-security-fix

# Manual approach
git checkout main
git pull origin main
git merge --no-ff hotfix/critical-security-fix
git tag -a v1.1.1 -m "Hotfix version 1.1.1"
git push origin main --tags

git checkout develop
git pull origin develop
git merge --no-ff hotfix/critical-security-fix  
git push origin develop

git branch -d hotfix/critical-security-fix
```

## 🔧 Configuration

### Git Aliases (Optional)
Add to your `~/.gitconfig`:

```ini
[alias]
    fs = flow feature start
    ff = flow feature finish
    rs = flow release start  
    rf = flow release finish
    hs = flow hotfix start
    hf = flow hotfix finish
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
- Regularly rebase on develop
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
git branch -d feature/branch-name
git flow feature start branch-name
```

**"Not a git flow repository"**
```bash
git flow init
```

**"Merge conflicts during finish"**
```bash
# Resolve conflicts manually
git add .
git commit -m "resolve merge conflicts"
git flow feature finish feature-name
```

### Recovery Commands

**Clean up abandoned branches:**
```bash
git branch -D feature/abandoned-feature
git push origin --delete feature/abandoned-feature
```

**Reset to clean state:**
```bash
git flow init -f  # Force reinitialize
```

## 📚 References

- [Git Flow Original Blog Post](https://nvie.com/posts/a-successful-git-branching-model/)
- [Atlassian Git Flow Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Git Flow AVH](https://github.com/petervanderdoes/gitflow-avh)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)