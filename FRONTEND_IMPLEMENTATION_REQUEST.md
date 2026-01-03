# Frontend Implementation Request - RentalEase Mobile App Pages

**Priority:** URGENT - Required for Apple App Store submission
**Deadline:** ASAP (Blocking App Store submission)
**Requested by:** Mobile App Development Team
**Date:** January 3, 2026

---

## Overview

We need to add 2 new pages to the RentalEase website (rentalease.com.au) to support our mobile app submission to the Apple App Store. These pages are **REQUIRED** by Apple and must be publicly accessible before we can submit.

---

## Page 1: Mobile App Privacy Policy (CRITICAL)

### URL Required
**Primary Option (Recommended):**
```
https://rentalease.com.au/app-privacy-policy
```

**Alternative Options:**
- `https://rentalease.com.au/technician-privacy`
- `https://rentalease.com.au/mobile-privacy-policy`

### Purpose
This privacy policy specifically covers our RentalEase Technician mobile app and is required by Apple App Store Review Guidelines. The existing `/privacy-policy` page only covers the website and does not include mobile app-specific permissions and data collection.

### Content Source
The complete HTML content is provided in the file:
```
PRIVACY_POLICY.html
```

This file is located in the mobile app repository.

### Implementation Requirements

1. **Create a new route/page** at the URL specified above
2. **Use the exact HTML content** from `PRIVACY_POLICY.html`
3. **Ensure proper styling** - The HTML includes inline styles, but you may want to:
   - Apply RentalEase website theme/branding
   - Use consistent header/footer with main site
   - Ensure mobile responsiveness
4. **No modifications needed** to the core content - it's ready to use as-is
5. **Must be publicly accessible** - No authentication required

### Technical Specifications

- **Content Type:** HTML page
- **Response Headers:**
  - `Content-Type: text/html; charset=UTF-8`
  - `Cache-Control: public, max-age=3600` (1 hour cache)
- **Response Time:** Must load within 3 seconds
- **SSL/HTTPS:** REQUIRED - Must use HTTPS only
- **Mobile Responsive:** Yes - must work on all device sizes
- **SEO:**
  - Title: "Privacy Policy - RentalEase Technician"
  - Meta description: "Privacy policy for the RentalEase Technician mobile app"

### Content Overview

The privacy policy includes:
- Introduction and scope
- Information we collect (personal data, permissions)
- Mobile permissions explained (Calendar, Camera, Photos)
- How we use data
- Data sharing practices
- Third-party services (Cloudinary, MongoDB)
- Data security measures
- User rights (GDPR, CCPA compliance)
- Contact information
- Legal compliance statements

### Important Notes

⚠️ **DO NOT modify the content** without consulting the mobile team - it's been specifically written to comply with:
- Apple App Store Review Guidelines
- Australian Privacy Principles (APPs)
- GDPR (European users)
- CCPA (California users)

### Testing Requirements

Before marking as complete, verify:
- [ ] URL is accessible at `https://rentalease.com.au/app-privacy-policy`
- [ ] Page loads without errors
- [ ] Content displays correctly on desktop
- [ ] Content displays correctly on mobile devices
- [ ] All sections are visible and readable
- [ ] Links (if any) work correctly
- [ ] Page loads over HTTPS (secure)
- [ ] No console errors in browser developer tools

---

## Page 2: Support Page for Mobile App (REQUIRED)

### URL Required
```
https://rentalease.com.au/support
```

**Alternative (if /support is used for something else):**
```
https://rentalease.com.au/app-support
```

### Purpose
Apple requires a publicly accessible support URL where users can get help with the mobile app. This page will be listed in the App Store.

### Content Template

I'm providing a basic template below. You can enhance it with RentalEase branding and styling:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support - RentalEase Technician App</title>
    <meta name="description" content="Get support for the RentalEase Technician mobile app">
</head>
<body>
    <header>
        <h1>RentalEase Technician - Support</h1>
    </header>

    <main>
        <section>
            <h2>Need Help?</h2>
            <p>We're here to help you get the most out of the RentalEase Technician app.</p>
        </section>

        <section>
            <h2>Contact Support</h2>
            <p><strong>Email:</strong> <a href="mailto:support@rentalease.com.au">support@rentalease.com.au</a></p>
            <p><strong>Phone:</strong> <a href="tel:1300736853">1300 RENTLEASE (1300 736 853)</a></p>
            <p><strong>Response Time:</strong> We typically respond within 24 hours on business days.</p>
        </section>

        <section>
            <h2>Getting Started</h2>
            <h3>How do I log in to the app?</h3>
            <p>Use the email address and password provided by your property management company. If you haven't received credentials, please contact your agency administrator.</p>

            <h3>How do I sync jobs to my calendar?</h3>
            <p>When prompted, allow calendar access. Jobs will automatically sync to a "RentalEase Work Schedule" calendar on your device with reminders.</p>

            <h3>How do I upload inspection photos?</h3>
            <p>When prompted, allow camera and photo library access. You can then take photos directly or select from your photo library when completing job inspections.</p>

            <h3>I'm not receiving job notifications</h3>
            <p>Please check that notifications are enabled for RentalEase Technician in your device settings. Go to Settings > Notifications > RentalEase Technician and ensure "Allow Notifications" is turned on.</p>
        </section>

        <section>
            <h2>Technical Issues</h2>
            <p>If you're experiencing technical difficulties, please contact us with the following information:</p>
            <ul>
                <li>Your device model (e.g., iPhone 14 Pro)</li>
                <li>iOS version (found in Settings > General > About)</li>
                <li>App version (found in More > About)</li>
                <li>Description of the issue</li>
                <li>Screenshots if applicable</li>
            </ul>
        </section>

        <section>
            <h2>Privacy & Security</h2>
            <p>Your privacy and security are important to us. Read our <a href="/app-privacy-policy">Privacy Policy</a> to learn how we protect your data.</p>
        </section>

        <section>
            <h2>About RentalEase</h2>
            <p>RentalEase is Australia's leading property management platform, trusted by agencies to manage thousands of rental properties.</p>
            <p><strong>Office:</strong> Melbourne, VIC, Australia</p>
            <p><strong>Website:</strong> <a href="https://rentalease.com.au">www.rentalease.com.au</a></p>
        </section>
    </main>

    <footer>
        <p>&copy; 2026 RentalEase. All rights reserved.</p>
    </footer>
</body>
</html>
```

### Customization Options

Feel free to:
- ✅ Add RentalEase branding (logo, colors, fonts)
- ✅ Use the same header/footer as the main website
- ✅ Add CSS styling to match the website design
- ✅ Add more FAQs based on common support questions
- ✅ Add links to tutorial videos or documentation
- ✅ Add a contact form instead of just email/phone
- ❌ Don't remove the contact information
- ❌ Don't remove the FAQ section entirely

### Technical Specifications

- **Content Type:** HTML page
- **Response Time:** Must load within 3 seconds
- **SSL/HTTPS:** REQUIRED
- **Mobile Responsive:** Yes
- **SEO:**
  - Title: "Support - RentalEase Technician App"
  - Meta description: "Get support for the RentalEase Technician mobile app"

### Testing Requirements

Before marking as complete, verify:
- [ ] URL is accessible at `https://rentalease.com.au/support`
- [ ] Page loads without errors
- [ ] Contact email link works (`mailto:` link)
- [ ] Phone link works on mobile (`tel:` link)
- [ ] Link to privacy policy works
- [ ] Page is mobile responsive
- [ ] No console errors

---

## Implementation Timeline

**URGENT:** These pages are blocking our App Store submission.

**Ideal Timeline:**
- **Day 1:** Implement both pages
- **Day 2:** QA testing and fixes
- **Day 3:** Live on production

**Minimum Acceptable:**
- Pages live within 48 hours

---

## Deployment Checklist

Before marking this task as complete:

### Privacy Policy Page
- [ ] Created route/page at chosen URL
- [ ] Used content from `PRIVACY_POLICY.html`
- [ ] Applied RentalEase branding/styling
- [ ] Tested on desktop browsers (Chrome, Safari, Firefox)
- [ ] Tested on mobile browsers (iOS Safari, Android Chrome)
- [ ] Verified HTTPS is working
- [ ] Verified page loads in under 3 seconds
- [ ] No console errors or warnings
- [ ] Deployed to production
- [ ] Verified URL is publicly accessible (no auth required)

### Support Page
- [ ] Created route/page at `/support`
- [ ] Added all required sections (contact, FAQs, etc.)
- [ ] Email link (`mailto:`) works
- [ ] Phone link (`tel:`) works
- [ ] Privacy policy link works
- [ ] Applied RentalEase branding/styling
- [ ] Tested on desktop browsers
- [ ] Tested on mobile browsers
- [ ] Verified HTTPS is working
- [ ] No console errors or warnings
- [ ] Deployed to production
- [ ] Verified URL is publicly accessible

---

## Files Provided

The mobile app team is providing:

1. **PRIVACY_POLICY.html** - Complete privacy policy content
2. **This document** - Implementation requirements

Location: Mobile app repository at:
```
/RentalEase-CRM-Mobile-App/PRIVACY_POLICY.html
```

---

## Post-Deployment Verification

After deployment, please provide:

1. **Confirmation URLs:**
   - Privacy Policy: `https://rentalease.com.au/___________`
   - Support Page: `https://rentalease.com.au/___________`

2. **Screenshots:**
   - Desktop view of privacy policy page
   - Mobile view of privacy policy page
   - Desktop view of support page
   - Mobile view of support page

3. **Verification:**
   - [ ] Both pages load successfully
   - [ ] Both pages are HTTPS
   - [ ] No authentication required
   - [ ] Mobile responsive confirmed

---

## Why This is Critical

**Apple App Store Requirements:**
- Privacy Policy URL is **REQUIRED** for all apps
- Support URL is **REQUIRED** for all apps
- Both must be **publicly accessible** (no login)
- Both must load over **HTTPS**
- Content must specifically cover mobile app permissions

**Without these pages:**
- ❌ Cannot submit app to App Store
- ❌ App will be rejected if already submitted
- ❌ Delays launch by several days/weeks

**With these pages:**
- ✅ Can submit app immediately
- ✅ Meets Apple's requirements
- ✅ Provides transparency to users
- ✅ Complies with legal requirements (GDPR, CCPA, etc.)

---

## Contact Information

**For Questions About This Request:**
- **Mobile App Team Lead:** [Your Name]
- **Email:** [Your Email]
- **Slack/Teams:** [Your Handle]

**For Technical Issues During Implementation:**
- Please reach out ASAP - this is blocking our App Store submission
- We can provide additional support or clarification as needed

---

## Success Criteria

This task is considered complete when:

1. ✅ Privacy policy page is live and accessible
2. ✅ Support page is live and accessible
3. ✅ Both pages load correctly on desktop and mobile
4. ✅ Both pages use HTTPS
5. ✅ URLs have been provided to mobile team for verification
6. ✅ Mobile team has verified and approved both pages

---

**Thank you for your help in getting our mobile app to the App Store! 🚀**

---

## Appendix: Example URLs from Competitors

For reference, here are examples of how other apps structure these pages:

**Privacy Policies:**
- `https://example.com/app-privacy`
- `https://example.com/mobile-privacy`
- `https://example.com/privacy/mobile-app`

**Support Pages:**
- `https://example.com/support`
- `https://example.com/help`
- `https://example.com/app-support`

We recommend:
- Privacy: `https://rentalease.com.au/app-privacy-policy`
- Support: `https://rentalease.com.au/support`
