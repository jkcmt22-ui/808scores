# App Store Submission Guide

## Prerequisites

### 1. EAS Account Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Link this project (run from apps/mobile directory)
eas init
```

### 2. Update Configuration
After running `eas init`, update these files with your project ID:
- `app.json` → `extra.eas.projectId`
- `app.json` → `updates.url`

---

## Required Assets

### App Icons (Replace defaults in `assets/images/`)

| Asset | Size | Purpose |
|-------|------|---------|
| `icon.png` | 1024x1024 | Main app icon |
| `adaptive-icon.png` | 1024x1024 | Android adaptive icon (foreground) |
| `splash-icon.png` | 1024x1024 | Splash screen logo |
| `favicon.png` | 48x48 | Web favicon |

**Tips:**
- Use PNG format with transparency where appropriate
- Avoid text that may be cropped on different devices
- Test on multiple screen sizes

### App Store Screenshots (Create in Figma/Photoshop)

**iOS Required:**
- 6.7" iPhone (1290 x 2796)
- 6.5" iPhone (1242 x 2688)
- 5.5" iPhone (1242 x 2208)
- 12.9" iPad Pro (2048 x 2732)

**Android Required:**
- Phone screenshots (1080 x 1920 or 1080 x 2340)
- Tablet 7" (1200 x 1920)
- Tablet 10" (1600 x 2560)

---

## Apple App Store

### 1. Apple Developer Account
- Cost: $99/year
- Sign up: https://developer.apple.com/programs/

### 2. App Store Connect Setup
1. Create new app in App Store Connect
2. Fill in app information:
   - **Name:** Hawaii Sports Center
   - **Subtitle:** Live High School Sports Scores
   - **Category:** Sports
   - **Privacy Policy URL:** https://www.hawaiisportscenter.com/privacy
   - **Support URL:** https://www.hawaiisportscenter.com

3. App Description:
```
Hawaii Sports Center is your go-to app for Hawaii high school sports coverage.

Features:
• Live scores for football, basketball, volleyball, soccer, and more
• Real-time game updates and notifications
• Follow your favorite schools (ILH, OIA, BIIF, MIL, KIF)
• Division I and Division II coverage
• Community chat and discussions
• Standings and schedules

Never miss a game! Get instant notifications when your team scores.
```

4. Keywords (100 characters max):
```
hawaii,high school,sports,scores,football,basketball,volleyball,oia,ilh,hhsaa
```

### 3. Build and Submit
```bash
cd apps/mobile

# Build for iOS
npm run build:ios

# After build completes, submit
npm run submit:ios
```

---

## Google Play Store

### 1. Google Play Developer Account
- Cost: $25 one-time
- Sign up: https://play.google.com/console/signup

### 2. Create Service Account (for automated submissions)
1. Go to Google Cloud Console
2. Create a service account with "Service Account User" role
3. Download JSON key and save as `google-services.json` in `apps/mobile/`
4. In Play Console, grant the service account access

### 3. Play Store Listing
- **App name:** Hawaii Sports Center
- **Short description:** Live Hawaii high school sports scores and updates
- **Full description:** (Same as iOS)
- **Category:** Sports
- **Content rating:** Everyone
- **Privacy policy:** https://www.hawaiisportscenter.com/privacy

### 4. Build and Submit
```bash
cd apps/mobile

# Build for Android (AAB format for Play Store)
npm run build:android

# After build completes, submit
npm run submit:android
```

---

## Build Commands Reference

```bash
# Development build (for testing)
npm run build:dev

# Preview build (internal testing)
npm run build:preview

# Production build (store submission)
npm run build:prod

# Platform-specific production builds
npm run build:ios
npm run build:android

# Submit to stores
npm run submit:ios
npm run submit:android
```

---

## Pre-Submission Checklist

### Technical
- [ ] All features working on both iOS and Android
- [ ] Push notifications configured and tested
- [ ] Deep links working (808scores://game/123)
- [ ] No crash on app startup
- [ ] Offline mode shows appropriate message
- [ ] Login/logout flow works correctly

### Legal
- [ ] Privacy policy published and accessible
- [ ] Terms of service published
- [ ] COPPA compliance (if targeting under 13)
- [ ] Data handling disclosure accurate

### Content
- [ ] App icons created (all sizes)
- [ ] Screenshots captured for all required sizes
- [ ] App description written
- [ ] Keywords optimized
- [ ] Contact email configured

### Testing
- [ ] TestFlight (iOS) beta testing completed
- [ ] Internal testing track (Android) completed
- [ ] No obvious bugs or crashes
- [ ] Performance acceptable on older devices

---

## Timeline Expectations

- **EAS Build:** 15-30 minutes
- **Apple Review:** 1-7 days (average 24-48 hours)
- **Google Review:** 1-7 days (average 24-48 hours)
- **First submission:** May take longer due to thorough review

---

## Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
eas build --clear-cache --platform all
```

### Submission Rejections
Common reasons:
- Missing privacy policy
- Incomplete metadata
- Crashes during review
- Broken features
- Guideline violations

Check rejection email for specific issues and resubmit after fixing.
