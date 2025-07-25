# 🚀 Quick GitHub Deployment Guide

## Prerequisites (Install First!)

### 1. Install Git
- Download: https://git-scm.com/download/windows
- Install with default settings
- Restart PowerShell after installation

### 2. Install Node.js
- Download: https://nodejs.org (LTS version)
- Install with default settings
- Restart computer after installation

## Step-by-Step Deployment

### 1. Open PowerShell as Administrator
```powershell
# Navigate to your project
cd "c:\Users\Acer\Desktop\raghuvanshi"

# Run the deployment script
.\deploy.ps1
```

### 2. Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `raghuvanshi-healthcare`
4. Keep it **Public** (required for free GitHub Pages)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 3. Connect to GitHub
```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/raghuvanshi-healthcare.git

# Push to GitHub
git push -u origin main
```

### 4. Configure GitHub Secrets (Important!)
1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" and add each of these:

**Required Secrets:**
- Name: `NEXT_PUBLIC_FIREBASE_API_KEY`
  Value: `AIzaSyC7w-5Z6K-Cow_PmBfoDFOcRVIBxJYmGgs`

- Name: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  Value: `raghunathapi.firebaseapp.com`

- Name: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  Value: `raghunathapi`

- Name: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  Value: `raghunathapi.firebasestorage.app`

- Name: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  Value: `480084683759`

- Name: `NEXT_PUBLIC_FIREBASE_APP_ID`
  Value: `1:480084683759:web:461bb8721beb3de2eb241a`

### 5. Enable GitHub Pages
1. In your repository, go to "Settings" → "Pages"
2. Under "Source", select "GitHub Actions"
3. Wait for the deployment to complete (check "Actions" tab)

### 6. Access Your Live Site
Your website will be available at:
```
https://YOUR_USERNAME.github.io/raghuvanshi-healthcare/
```

## 🔄 Future Updates

To update your live site:
```powershell
# Make your changes, then:
git add .
git commit -m "Update: describe your changes"
git push
```

The site will automatically rebuild and deploy!

## 🛠️ Troubleshooting

### Build Fails?
- Check the "Actions" tab for error details
- Ensure all secrets are configured correctly
- Make sure Firebase config is correct

### Site Not Loading?
- Wait 5-10 minutes after first deployment
- Check that GitHub Pages is enabled
- Verify the repository is public

### Need Help?
- Check GitHub Actions logs for specific errors
- Ensure all dependencies are in package.json
- Verify Firebase configuration is correct

## 📱 Features Available Online
- ✅ Healthcare services showcase
- ✅ Product catalog
- ✅ Appointment booking system
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Firebase integration
