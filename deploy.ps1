# GitHub Deployment Script for Raghuvanshi Healthcare (PowerShell)

Write-Host "🏥 Raghuvanshi Healthcare - GitHub Deployment Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "   https://git-scm.com/download/windows" -ForegroundColor Yellow
    exit 1
}

# Check if node is installed
try {
    node --version | Out-Null
    Write-Host "✅ Node.js is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first:" -ForegroundColor Red
    Write-Host "   https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the project to check for errors
Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Initialize git if not already initialized
if (!(Test-Path ".git")) {
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Cyan
    git init
}

# Add and commit files
Write-Host "📝 Adding files to Git..." -ForegroundColor Cyan
git add .
git commit -m "Deploy: Raghuvanshi Healthcare Website $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "🚀 Ready to push to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a repository on GitHub" -ForegroundColor White
Write-Host "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor White
Write-Host "3. Run: git push -u origin main" -ForegroundColor White
Write-Host "4. Configure GitHub Pages in repository settings" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your site will be available at:" -ForegroundColor Cyan
Write-Host "   https://YOUR_USERNAME.github.io/YOUR_REPO/" -ForegroundColor White
