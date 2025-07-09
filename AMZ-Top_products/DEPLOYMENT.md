# Deployment Guide

This guide will help you deploy the Amazon Affiliate Store to your hosting environment.

## Prerequisites

1. Web hosting with support for:
   - Static file hosting (HTML, CSS, JS)
   - HTTPS (SSL/TLS)
   - Custom domain configuration

2. Amazon Associates Account:
   - Sign up at [Amazon Associates](https://affiliate-program.amazon.com/)
   - Get your tracking ID (starts with `yourstore-20`)

## Deployment Steps

### 1. Prepare Your Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/pepino17/reznero-site.git
   cd reznero-site/AMZ-Top_products
   ```

2. Update configuration:
   - Open `assets/js/api-service.js`
   - Update the `associateTag` with your Amazon Associates tracking ID
   - Configure any other API settings as needed

### 2. Build and Test Locally

1. Start a local server (Python example):
   ```bash
   python -m http.server 8000
   ```

2. Test the site at `http://localhost:8000`
   - Verify all links work
   - Check responsive design on different devices
   - Test form submissions and interactive elements

### 3. Deploy to Production

#### Option A: Netlify (Recommended)

1. Push your code to a GitHub repository
2. Log in to [Netlify](https://www.netlify.com/)
3. Click "New site from Git"
4. Select your repository and branch
5. Configure build settings:
   - Build command: (leave empty for static sites)
   - Publish directory: `AMZ-Top_products`
6. Click "Deploy site"

#### Option B: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd AMZ-Top_products
   vercel
   ```

#### Option C: Traditional Web Hosting

1. Upload all files to your web server using FTP/SFTP
2. Ensure `.htaccess` (Apache) or equivalent is configured for clean URLs

### 4. Configure Custom Domain

1. In your hosting provider's dashboard:
   - Add your domain (e.g., `amazon.pezmax.com`)
   - Follow the DNS verification steps

2. Set up SSL/TLS:
   - Most hosts provide Let's Encrypt integration
   - Enable HTTPS redirect

### 5. Verify Deployment

1. Visit your live site
2. Check:
   - All pages load correctly
   - Images and assets are loading
   - Forms and interactive elements work
   - Mobile responsiveness

## Post-Deployment

### 1. Submit Sitemap to Search Engines

1. Google Search Console:
   - Add your property
   - Submit your sitemap: `https://yourdomain.com/sitemap.xml`

2. Bing Webmaster Tools:
   - Add your site
   - Submit your sitemap

### 2. Set Up Analytics

1. Google Analytics:
   - Update the tracking ID in `index.html`
   - Set up goals and events

2. Amazon Associates:
   - Add your site to your Amazon Associates account
   - Configure tracking settings

### 3. Monitor Performance

1. Use Google PageSpeed Insights
2. Set up monitoring (e.g., Uptime Robot)
3. Monitor 404 errors in Google Search Console

## Maintenance

1. Regular updates:
   - Update product data
   - Check for broken links
   - Update content regularly

2. Security:
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Regular backups

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your Amazon Product Advertising API settings allow your domain
   - Check API credentials

2. **Mixed Content Warnings**
   - Ensure all resources are loaded over HTTPS
   - Update any hardcoded HTTP URLs

3. **Broken Images**
   - Check Amazon image URLs
   - Verify CORS headers from Amazon

### Getting Help

For support, please open an issue on the GitHub repository or contact your development team.
