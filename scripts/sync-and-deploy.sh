#!/bin/bash
set -e

echo "Syncing content from ~/notes..."

# Remove symlinks if they exist
rm -f src/content/notes src/content/writings src/content/projects 2>/dev/null || true
rm -f public/assets/notes 2>/dev/null || true

# Ensure directories exist
mkdir -p src/content/notes src/content/writings src/content/projects
mkdir -p public/assets/notes

# Copy markdown content to src/content/
rsync -av --delete --include='*.md' --exclude='*' ~/notes/notes/ src/content/notes/
rsync -av --delete --include='*.md' --exclude='*' ~/notes/writings/ src/content/writings/
rsync -av --delete --include='*.md' --exclude='*' ~/notes/projects/ src/content/projects/

# Copy images and PDFs to public/assets/notes/
rsync -av --delete \
  --include='*.png' \
  --include='*.jpg' \
  --include='*.jpeg' \
  --include='*.gif' \
  --include='*.webp' \
  --include='*.svg' \
  --include='*.pdf' \
  --exclude='*.md' \
  --exclude='*' \
  ~/notes/notes/ public/assets/notes/

echo "Content synced."

# Stage, commit, and push
echo "Committing and pushing..."
git add -A
# Force-add content directories (they're in .gitignore for symlink support)
git add --force src/content/notes src/content/writings src/content/projects
git add --force public/assets/notes
git commit -m "Update content" || echo "No changes to commit"
git push origin main

echo "Done! GitHub Actions will build and deploy."
