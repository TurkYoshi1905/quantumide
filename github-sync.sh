#!/usr/bin/env bash
# github-sync.sh — QuantumIDE GitHub Sync
# Pushes all project changes to GitHub using GITHUB_PAT env variable.
# Usage: ./github-sync.sh [commit-message]
# Env:   GITHUB_PAT — Personal Access Token (required)
#        GITHUB_REPO — e.g. username/repo-name (required)
#        GITHUB_BRANCH — target branch (default: main)

set -e

COMMIT_MSG="${1:-"QuantumIDE sync: $(date '+%Y-%m-%d %H:%M:%S')"}"
BRANCH="${GITHUB_BRANCH:-main}"

if [ -z "$GITHUB_PAT" ]; then
  echo "❌ Hata: GITHUB_PAT ortam değişkeni tanımlanmamış."
  echo "   export GITHUB_PAT=ghp_yourtoken123"
  exit 1
fi

if [ -z "$GITHUB_REPO" ]; then
  echo "❌ Hata: GITHUB_REPO ortam değişkeni tanımlanmamış."
  echo "   export GITHUB_REPO=kullanici/repo-adi"
  exit 1
fi

REMOTE_URL="https://${GITHUB_PAT}@github.com/${GITHUB_REPO}.git"

echo "🔄 QuantumIDE → GitHub senkronizasyonu başlatılıyor..."
echo "   Repo   : ${GITHUB_REPO}"
echo "   Dal    : ${BRANCH}"
echo "   Mesaj  : ${COMMIT_MSG}"

# Configure git identity if not set
git config --global user.email "quantumide@noreply.github.com" 2>/dev/null || true
git config --global user.name "QuantumIDE" 2>/dev/null || true

# Initialize repo if needed
if [ ! -d ".git" ]; then
  echo "📁 Git deposu başlatılıyor..."
  git init
  git remote add origin "$REMOTE_URL"
fi

# Update remote URL with token
git remote set-url origin "$REMOTE_URL" 2>/dev/null || git remote add origin "$REMOTE_URL"

# Stage all changes
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "✅ Değişiklik yok — zaten güncel."
  exit 0
fi

# Commit changes
git commit -m "$COMMIT_MSG"

# Push to remote (no --force)
echo "⬆️  GitHub'a gönderiliyor..."
git push origin "$BRANCH" || git push --set-upstream origin "$BRANCH"

echo "✅ Başarıyla senkronize edildi: ${GITHUB_REPO}@${BRANCH}"
