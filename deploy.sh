#!/bin/bash
# GitHub Deployment Script for Raghuvanshi Healthcare

echo "🏥 Raghuvanshi Healthcare - GitHub Deployment Script"
echo "=================================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   https://git-scm.com/download/windows"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
fi

# Add and commit files
echo "📝 Adding files to Git..."
git add .
git commit -m "Deploy: Raghuvanshi Healthcare Website $(date)"

echo "🚀 Ready to push to GitHub!"
echo ""
echo "Next steps:"
echo "1. Create a repository on GitHub"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "3. Run: git push -u origin main"
echo "4. Configure GitHub Pages in repository settings"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://YOUR_USERNAME.github.io/YOUR_REPO/"
