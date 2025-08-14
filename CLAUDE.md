# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
RentalEase Technician is a React Native mobile application built with Expo and Expo Router. It's a technician-focused app for rental management services using file-based routing.

**Package Manager: This project uses pnpm. Always use `pnpm` commands instead of npm.**

## Development Commands
- `pnpm start` - Start Expo development server
- `pnpm run android` - Start on Android device/emulator  
- `pnpm run ios` - Start on iOS device/simulator
- `pnpm run web` - Start web version

## Architecture

### Routing Structure
The app uses Expo Router with file-based routing in the `/app` directory:
- Root layout (`app/_layout.tsx`) manages navigation between auth and app sections
- `app/index.tsx` redirects to login by default
- `app/(auth)/` - Authentication flow (login, forgot-password)
- `app/(app)/` - Main application screens (post-authentication)
- Each route group has its own `_layout.tsx` for navigation configuration

### Key Technologies
- **Expo SDK 53** with New Architecture enabled
- **React Native 0.79.5** with React 19
- **Expo Router 5.1** for navigation
- **Expo Secure Store** for secure data persistence
- **TypeScript** with strict mode enabled

### Project Structure
- `/app` - File-based routing and screens
- `/assets` - Static assets (icons, splash screens)
- `/contexts` - React contexts (currently empty)
- `index.ts` - Expo Router entry point
- App scheme: `rentalease://`

### Navigation Flow
The app follows a standard auth flow pattern:
1. Root redirect to login (`/(auth)/login`)
2. Login screen navigates to main app (`/(app)`)
3. Forgot password accessible from login

### Styling
Uses React Native StyleSheet with consistent design patterns:
- Primary color: `#007AFF` (iOS blue)
- White backgrounds with centered layouts
- Consistent button and text styling patterns