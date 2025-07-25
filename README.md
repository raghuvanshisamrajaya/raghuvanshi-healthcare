# 🏥 Raghuvanshi Healthcare Website

A comprehensive, modern full-stack healthcare website built with Next.js, Firebase, and Tailwind CSS.

## 🚀 Quick Setup Guide

### 1. Install Node.js (Required)
**You need to install Node.js first to run this project:**

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS version** (recommended)
3. Run the installer and follow the setup wizard
4. Restart your computer after installation

### 2. Install Git (For GitHub deployment)
1. Go to [https://git-scm.com/download/windows](https://git-scm.com/download/windows)
2. Download and install Git for Windows
3. Restart your terminal/PowerShell after installation

### 3. Verify Installation
Open Command Prompt or PowerShell and run:
```bash
node --version
npm --version
git --version
```

### 4. Install Project Dependencies
Navigate to the project folder and run:
```bash
cd "c:\Users\Acer\Desktop\raghuvanshi"
npm install
```

### 5. Setup Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration values
3. Add your Razorpay keys if using payment features

### 6. Start Development Server
```bash
npm run dev
```

The website will be available at: http://localhost:3000

## 🌐 Deploy to GitHub Pages

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it `raghuvanshi-healthcare` or any name you prefer
3. Keep it public for GitHub Pages to work (free)

### Step 2: Initialize Git and Push to GitHub
```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Raghuvanshi Healthcare Website"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Configure GitHub Secrets
1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

### Step 4: Enable GitHub Pages
1. Go to repository "Settings" → "Pages"
2. Under "Source", select "GitHub Actions"
3. Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

### Step 5: Automatic Deployment
- Every time you push to the `main` branch, GitHub Actions will automatically build and deploy your site
- Check the "Actions" tab to see deployment progress

## 🛠️ Current Issues & Solutions

### Problem: 660+ TypeScript Errors
**Cause:** Missing Node.js and npm dependencies

**Solution:** 
1. Install Node.js (see step 1 above)
2. Run `npm install` to install all required packages
3. All TypeScript errors will be resolved automatically

### Problem: Module Import Errors
**Cause:** Missing packages like React, Next.js, Framer Motion, etc.

**Solution:** The `npm install` command will install all required dependencies:
- React & Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Firebase
- Lucide React (icons)
- And many more...

### Key Features
- 📱 **Mobile-First Design**: Optimized for Android and iOS
- 🎨 **Modern UI**: Clean design with royal blue (#004AAD) and health green (#29AB87)
- ⚡ **Fast Loading**: Optimized images and performance
- 🔄 **Responsive Navigation**: Hamburger menu for mobile
- 💬 **WhatsApp Integration**: Direct appointment booking
- 📧 **Email Integration**: Contact forms with mailto links
- 🎭 **Smooth Animations**: AOS library for scroll animations
- 🏪 **Shopping Features**: Product catalog and prescription upload

## 🚀 Quick Start

1. **Download/Clone** the files to your computer
2. **Open** `index.html` in your web browser
3. **Customize** colors, content, and contact information
4. **Deploy** to your web hosting service

## 📁 File Structure

```
raghuvanshi/
├── index.html              # Homepage
├── about.html              # About page
├── services.html           # Services page
├── shop.html              # Online shop
├── contact.html           # Contact page
└── assets/
    ├── css/
    │   ├── style.css      # Main stylesheet
    │   └── placeholders.css # Placeholder styles
    ├── js/
    │   └── script.js      # Main JavaScript
    └── images/
        └── logo.svg       # Company logo
```

## 🛠️ Customization

### Colors
Update CSS variables in `assets/css/style.css`:
```css
:root {
    --primary-color: #004AAD;    /* Royal Blue */
    --secondary-color: #29AB87;  /* Health Green */
    --accent-color: #f8f9fa;     /* Light Gray */
}
```

### Contact Information
Update phone numbers and email addresses:
- Search for `+919876543210` and replace with your phone
- Search for `info@raghuvanshihealthcare.com` and replace with your email
- Update WhatsApp links with your number

### Content
- Replace placeholder text with your actual content
- Update doctor names and specializations
- Modify service descriptions and pricing
- Add your actual address and location

### Images
Replace placeholder images with actual photos:
- Hero doctor image
- Service images
- Team photos
- Product images
- Testimonial photos

## 📱 Mobile Optimization

### Android Features
- Touch-friendly buttons (minimum 48px height)
- Optimized font sizes for readability
- Fast-loading images with lazy loading
- Swipeable testimonials slider
- One-tap calling with `tel:` links
- WhatsApp deep linking

### iOS Compatibility
- Safari-optimized CSS
- Proper viewport settings
- Touch gesture support
- Smooth scrolling behavior

## 🔧 Technical Features

### Performance
- Lazy loading images
- Minified external libraries
- Optimized CSS/JS
- AOS animations for engagement

### SEO Optimized
- Semantic HTML structure
- Meta descriptions for all pages
- Alt tags for images
- Proper heading hierarchy
- Schema markup ready

### Accessibility
- ARIA labels
- Keyboard navigation
- High contrast ratios
- Screen reader compatible
- Focus indicators

## 📞 Contact Integration

### WhatsApp
Appointment bookings automatically create WhatsApp messages with:
- Patient name and phone
- Selected service
- Preferred date and time
- Additional message

### Email
Contact forms create mailto links with pre-filled:
- Subject lines
- Message content
- Recipient addresses

## 🎨 Design System

### Typography
- Primary: Poppins (headings)
- Secondary: Roboto (body text)
- Weight: 300, 400, 500, 600, 700

### Spacing
- Consistent 8px grid system
- Responsive padding/margins
- Mobile-first breakpoints

### Components
- Reusable button styles
- Consistent card layouts
- Modular form elements
- Responsive grid system

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📈 Performance Tips

1. **Optimize Images**: Compress all images before uploading
2. **Use WebP**: Convert images to WebP format for better compression
3. **Enable Gzip**: Configure your server for gzip compression
4. **CDN**: Use a Content Delivery Network for faster loading
5. **Caching**: Set proper cache headers for static assets

## 🔒 Security

- Form validation on frontend and backend
- HTTPS recommended for production
- Sanitize all user inputs
- Regular security updates

## 📝 License

This template is free to use for healthcare providers. Please maintain attribution in the footer.

## 🆘 Support

For technical support or customization help:
- Email: support@raghuvanshihealthcare.com
- Phone: +91 98765 43210
- WhatsApp: Available during business hours

## 🔄 Updates

Regular updates include:
- New features
- Bug fixes
- Security improvements
- Browser compatibility updates

---

**Built with ❤️ for healthcare providers**
