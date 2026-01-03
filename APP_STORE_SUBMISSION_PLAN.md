# App Store Submission Plan - RentalEase Technician

## Overview
This plan outlines all steps required to prepare the RentalEase Technician mobile app for submission to the Apple App Store.

**Current Status:** App is functional but not production-ready. Missing critical configuration, compliance documentation, and App Store assets.

**Prerequisites Confirmed:**
✅ Apple Developer Program membership active
✅ Production API server live at https://server.rentalease.com.au
✅ Domain access for privacy policy hosting (rentalease.com.au)
✅ App name: "RentalEase Technician" (without underscore)

---

## Quick Summary - What Needs to Be Done

### Code Changes Required (Can be automated):
1. ❌ Fix critical security issue: Remove `NSAllowsArbitraryLoads: true` from app.json
2. ❌ Add missing `expo-calendar` plugin to app.json
3. ❌ Update app name from `RentalEase_Technician` to `RentalEase Technician`
4. ❌ Create `eas.json` build configuration file
5. ❌ Update `.env` to use production API URL
6. ❌ Create missing `favicon.png` asset

### Manual Tasks Required (You need to do):
7. ❌ Create and host privacy policy at rentalease.com.au/privacy-policy
8. ❌ Create App Store screenshots (2-10 per device size)
9. ❌ Write app description and marketing copy
10. ❌ Set up app in App Store Connect
11. ❌ Create demo account with test data
12. ❌ Test build via TestFlight
13. ❌ Submit for App Store review

**Estimated Time:** ~2 weeks total (1 week prep + 1 week Apple review)

---

## Phase 1: Critical Security & Configuration Fixes

### 1.1 Fix iOS Network Security (CRITICAL)
**File:** `app.json` (line 21-23)

**Current Issue:** `"NSAllowsArbitraryLoads": true` allows insecure HTTP connections - WILL CAUSE REJECTION

**Action:**
```json
"NSAppTransportSecurity": {
  "NSAllowsArbitraryLoads": false
}
```
Or remove the entire NSAppTransportSecurity block to use iOS defaults (HTTPS only)

### 1.2 Update App Name
**File:** `app.json` (line 3-4)

**Current:** `"RentalEase_Technician"` (with underscore)
**Change to:** `"RentalEase Technician"` (space instead of underscore)

**Update both:**
- `name` field (line 3)
- `slug` can stay as `RentalEase_Technician` or change to `rentalease-technician`

### 1.3 Add Missing expo-calendar Plugin
**File:** `app.json` (line 46-57, plugins array)

**Issue:** App uses expo-calendar (installed in package.json) but plugin not configured in app.json

**Action:** Add to plugins array:
```json
[
  "expo-calendar",
  {
    "calendarPermission": "Allow RentalEase to access your calendar to sync job schedules and send reminders.",
    "remindersPermission": "Allow RentalEase to set reminders for upcoming jobs."
  }
]
```

### 1.4 Configure Production Environment
**File:** `.env` (line 2-3)

**Current:** `EXPO_PUBLIC_API_BASE_URL=http://localhost:4000`
**Production:** `https://server.rentalease.com.au` (currently commented)

**Actions:**
- Uncomment production URL
- Comment out localhost URL
- Or use EAS Build environment variables to set per-build profile

### 1.5 Create Missing favicon.png
**File:** `assets/favicon.png` (referenced in app.json line 44 but doesn't exist)

**Action:**
- Create 48x48px PNG for web favicon
- Can use resized version of existing icon.png

### 1.6 Create EAS Build Configuration
**File:** `eas.json` (currently does not exist)

**Action:** Run `eas build:configure` or create manually:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://server.rentalease.com.au"
      }
    },
    "production": {
      "distribution": "store",
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://server.rentalease.com.au"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "will-be-generated-in-app-store-connect",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

---

## Phase 2: Privacy & Compliance Documentation

### 2.1 Create Privacy Policy (REQUIRED)
**Status:** Missing - CRITICAL for App Store submission
**Host at:** `https://rentalease.com.au/privacy-policy`

**Required Content:**
- **Data Collected:** Name, email, phone, license number/expiry, address, profile photos, job data, calendar events
- **How Used:** Job management, work scheduling, inspection documentation, calendar sync
- **Third-Party Services:**
  - Cloudinary (image hosting for profile photos and inspection images)
  - Backend API server (MongoDB database)
- **Permissions Explained:**
  - Camera: Take inspection photos
  - Photos: Attach existing inspection images
  - Calendar: Sync job schedules to device calendar with reminders
- **Data Storage:** Secure token storage (platform keychain), encrypted server storage
- **Data Retention:** How long data is kept, account deletion process
- **User Rights:** Access, export, delete personal data
- **Contact:** privacy@rentalease.com.au (or appropriate email)

**App Store Requirements:**
- Must be publicly accessible
- Must load quickly
- Must be in plain, understandable language

### 2.2 Create Terms of Service
**Status:** Recommended but not strictly required

**Content:**
- User responsibilities
- Service description
- Liability limitations
- Account termination conditions

### 2.3 Update app.json with Privacy Information
**File:** `app.json`

**Add to expo object:**
```json
"privacy": "public",
"description": "RentalEase Technician is a mobile app for property maintenance technicians to manage job assignments, schedules, and inspection documentation.",
"githubUrl": "optional-if-open-source",
"slug": "rentalease-technician",
"primaryColor": "#007AFF",
"privacy": "public"
```

**Add iOS metadata:**
```json
"ios": {
  "bundleIdentifier": "com.rentalease.technician",
  "buildNumber": "1",
  "supportsTablet": true,
  "config": {
    "usesNonExemptEncryption": false
  },
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false,
    "UILaunchStoryboardName": "SplashScreen",
    "UIViewControllerBasedStatusBarAppearance": true
  }
}
```

Note: Remove NSAllowsArbitraryLoads as per Phase 1.1

### 2.4 Create iOS Privacy Manifest
**For iOS 17+:** Create `PrivacyInfo.xcprivacy`

**Declare:**
- Data collection practices
- Purpose of camera/photo permissions
- Purpose of calendar permissions
- No tracking/analytics usage

---

## Phase 3: App Store Listing Preparation

### 3.1 Complete App Metadata
**File:** `app.json`

**Add/Update:**
- App name: Consider user-friendly name vs technical name
- Description: Clear, compelling description of app functionality
- Subtitle: Brief tagline (max 30 characters)
- Keywords: For App Store search optimization
- Primary category: Productivity or Business
- Secondary category: (optional)
- Support URL: Support website or contact page
- Marketing URL: Main product page

### 3.2 Create App Store Screenshots (REQUIRED)
**Minimum Required:**
- iPhone 6.7" display: 1290×2796 pixels (at least 2, max 10)
- iPhone 6.5" display: 1242×2688 pixels (recommended)
- iPad Pro 12.9": 2048×2732 pixels (required if claiming tablet support)

**Recommended Screenshots:**
1. Login/Welcome screen
2. Jobs list view
3. Job detail with inspection photos
4. Calendar integration
5. Profile/Settings

**Notes:**
- Must be actual app screenshots (no mockups)
- Can add text overlays for clarity
- Should showcase key features
- Use status bar simulator for polished look

### 3.3 Create App Preview Video (Optional but Recommended)
**Specs:**
- 15-30 seconds long
- Same resolutions as screenshots
- Portrait orientation
- Showcase key workflows

### 3.4 Prepare App Icon
**Current:** `icon.png` (1024×1024) exists

**Verify:**
- No transparency (must be opaque)
- No rounded corners (iOS adds these)
- Looks good at small sizes
- Follows iOS design guidelines

### 3.5 Create Promotional Text
**For App Store:**
- What's New section (for updates)
- App description (4000 character max)
- Promotional text (170 character max)
- Subtitle (30 character max)

---

## Phase 4: Build Configuration & Testing

### 4.1 Set Up EAS Build
**Prerequisites:**
- Expo account (already have: juhan.rokoautomations)
- Project ID configured (already set: f04bd6f3-3938-48b7-9807-a95724efde88)

**Actions:**
- Run `eas build:configure` to create eas.json
- Configure iOS credentials (certificates & provisioning profiles)
- Set up automatic credential management or manual upload

### 4.2 Update Build Numbers
**Files:** `app.json`

**Current:**
- Version: 1.0.0
- Build Number: 1

**Strategy:**
- Keep version for user-facing releases (1.0.0)
- Auto-increment build number per submission
- Use EAS Build's auto-increment feature

### 4.3 Create Test Build
**Command:** `eas build --platform ios --profile preview`

**Purpose:**
- Test on real devices via TestFlight
- Verify all permissions work correctly
- Ensure calendar sync functions
- Test camera/photo access
- Verify production API connection

### 4.4 Testing Checklist
- [ ] Login/authentication flow
- [ ] Job list loads correctly
- [ ] Job details display properly
- [ ] Calendar sync creates events with alarms
- [ ] Camera permission prompt appears with correct text
- [ ] Photo library access works
- [ ] Image upload to Cloudinary succeeds
- [ ] All navigation works (tabs, back buttons)
- [ ] App doesn't crash on iPad (tablet support claimed)
- [ ] Logout works correctly
- [ ] No console errors in production build

---

## Phase 5: Apple Developer Program Setup

### 5.1 Apple Developer Account
**Status:** ✅ Already enrolled and active (confirmed)

### 5.2 App Store Connect Setup
**Steps:**
1. Log in to appstoreconnect.apple.com
2. Create new app
3. Fill in required information:
   - Bundle ID: `com.rentalease.technician`
   - App Name: RentalEase Technician (or chosen name)
   - Primary Language: English (Australia or US)
   - SKU: Unique identifier for internal use

### 5.3 Configure App Information
**In App Store Connect:**
- App Privacy section (data collection declarations)
- Age Rating questionnaire
- App Review Information (contact, notes for reviewers)
- Version Information
- Content Rights information

---

## Phase 6: Production Build & Submission

### 6.1 Create Production Build
**Command:** `eas build --platform ios --profile production`

**Ensure:**
- Production environment variables active
- HTTPS-only API endpoint
- Network security fixed (NSAllowsArbitraryLoads: false)
- Build number incremented
- No development/debugging code

### 6.2 Upload to App Store Connect
**Options:**
- EAS Submit: `eas submit --platform ios`
- Manual upload via Transporter app
- Automatic upload if configured in eas.json

### 6.3 Complete App Store Listing
**In App Store Connect:**
1. Add all screenshots for required device sizes
2. Add app preview video (if created)
3. Write app description and promotional text
4. Set pricing (Free for technician app?)
5. Configure availability (regions/countries)
6. Add privacy policy URL
7. Complete data practices questionnaire

### 6.4 App Review Information
**Provide to Apple reviewers:**
- Demo account credentials (username/password)
- Special instructions for testing
- Contact information for urgent issues
- Notes about calendar/camera permissions usage

**Demo Account Requirements:**
- Must be fully functional
- Should have sample jobs/data populated
- Should demonstrate all key features

---

## Phase 7: Submit for Review

### 7.1 Pre-Submission Checklist
- [ ] Production build uploaded and processed
- [ ] All screenshots added for required sizes
- [ ] App description complete and compelling
- [ ] Privacy policy live and URL added
- [ ] Keywords optimized
- [ ] Age rating completed
- [ ] Data practices declarations completed
- [ ] Demo account credentials provided
- [ ] Contact information verified
- [ ] Build tested via TestFlight
- [ ] No crashes or critical bugs

### 7.2 Submit for Review
**In App Store Connect:**
1. Select build for submission
2. Review all information one final time
3. Click "Submit for Review"
4. Respond to any follow-up questions from Apple

### 7.3 Review Timeline
**Typical:** 24-48 hours
**Can extend to:** 1-2 weeks during busy periods

**Common Rejection Reasons:**
- Missing privacy policy
- Permissions without clear justification
- Network security issues (NSAllowsArbitraryLoads)
- App crashes or bugs
- Incomplete metadata
- Demo account doesn't work

---

## Phase 8: Post-Submission

### 8.1 Monitor Review Status
**Check daily:**
- App Store Connect notifications
- Email from Apple
- Status changes in dashboard

### 8.2 If Rejected
**Steps:**
1. Read rejection reason carefully
2. Address all issues mentioned
3. Update build if code changes needed
4. Update metadata if listing issues
5. Respond in Resolution Center
6. Resubmit

### 8.3 If Approved
**Actions:**
1. App goes live automatically or on scheduled date
2. Monitor user reviews and ratings
3. Track crashes via App Store Connect
4. Prepare for ongoing updates and maintenance

---

## Critical Files to Modify

### 1. `app.json` (Multiple Changes)
Line 3: Change `"RentalEase_Technician"` → `"RentalEase Technician"`
Line 4: Change `"RentalEase_Technician"` → `"rentalease-technician"`
Line 21-23: Remove or set NSAllowsArbitraryLoads to false
Line 46-57: Add expo-calendar plugin configuration
After line 7: Add description, privacy fields

### 2. `eas.json` (CREATE NEW FILE)
Create complete EAS Build configuration with development, preview, production profiles

### 3. `.env`
Line 2: Comment out localhost URL
Line 3: Uncomment production URL

### 4. `assets/favicon.png` (CREATE NEW FILE)
Create 48x48px PNG favicon for web

### 5. Privacy Policy (EXTERNAL)
Create and host at: `https://rentalease.com.au/privacy-policy`

### 6. App Store Screenshots (CREATE NEW)
Create 2-10 screenshots per device size showing app features

---

## Estimated Timeline

- **Phase 1-2 (Security & Compliance):** 1-2 days
- **Phase 3 (Metadata & Assets):** 2-3 days (screenshot creation)
- **Phase 4 (Build & Testing):** 1-2 days
- **Phase 5 (Apple Setup):** 1 day (if account exists)
- **Phase 6 (Production Build):** 1 day
- **Phase 7 (Submission):** 1 day
- **Apple Review:** 1-7 days

**Total:** ~2 weeks from start to potential approval

---

## Dependencies & Prerequisites

**Required:**
- [x] Active Apple Developer Program membership ✅
- [x] Access to rentalease.com.au for hosting privacy policy ✅
- [x] Production API server (https://server.rentalease.com.au) ready ✅
- [ ] Privacy policy created and hosted
- [ ] App description and marketing copy written
- [ ] Demo account with test data on production server
- [ ] App Store screenshots created

**Tools Needed:**
- [x] Expo EAS CLI (already installed)
- [ ] Screenshot creation tool (Xcode Simulator + design software)
- [ ] Privacy policy generator or legal counsel
- [ ] iOS device for testing (iPhone and iPad if supporting tablets)

**Quick Start Commands:**
```bash
# Configure EAS Build
eas build:configure

# Create preview build for TestFlight
eas build --platform ios --profile preview

# Create production build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

---

## Risk Mitigation

**High-Risk Items:**
1. **Network Security Setting** - Will cause automatic rejection if not fixed
2. **Privacy Policy** - Missing = automatic rejection
3. **Demo Account** - Must work perfectly for reviewers
4. **Permissions Justification** - Must clearly explain calendar/camera usage

**Mitigation:**
- Fix all critical issues before first submission
- Thoroughly test with TestFlight before production
- Have legal counsel review privacy documentation
- Create detailed reviewer notes explaining app functionality

---

## Success Criteria

**App is ready for submission when:**
1. ✅ All critical security issues resolved
2. ✅ Privacy policy live and linked
3. ✅ All required screenshots created
4. ✅ Production build tested via TestFlight
5. ✅ Demo account functional
6. ✅ App Store listing complete
7. ✅ No crashes or critical bugs
8. ✅ Apple Developer account active
9. ✅ EAS Build configured and working
10. ✅ Production API endpoint secure and operational
