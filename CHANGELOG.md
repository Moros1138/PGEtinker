# Changelog

All notable changes to this project will be documented in this file. Each batch of changes is marked by the date it was published to the repository for deployment to the PGEtinker site.

It is a summary of changes that would be pertinent to the end user of the PGEtinker website. For a comprehensive history of changes made to the project, please refer to the repository's commit history.
## 2024-06-03

- Added Clangd Language server to the backend
- Added Language client and related packages to the frontend
- Added Narrow screen tweaks for mobile users (first step)
- Added Donation link
- Added An easy way to set a panel to have focus, required for an upcoming mobile update
- Added Loading screen
- Removed "show-console" hook to the emscripten template, no longer used

## 2024-05-28

- Fixed [Issue #78](https://github.com/Moros1138/PGEtinker/issues/78)

## 2024-05-27

- Changed complete revamp of the frontend code, much more organized
- Fixed UI annoyances
- Added Control+S to the Build and Run command
- Added Default editor font size
- Added Control+Mouse Wheel zooming in the editor
- Added Control+0 to reset editor zoom
- Changed Build &amp; Run to Run, that turns into a stop button when the player is running

## 2024-05-25

- Fixed screenshot failure handling
- Changed example code to use image hosted in the pit, rather than imgur

## 2024-05-23

- Added screenshot thumbnails for share embeds
- Fixed [Issue #73](https://github.com/Moros1138/PGEtinker/issues/73)

## 2024-05-20

- Fixed [Issue #70](https://github.com/Moros1138/PGEtinker/issues/70)
- Fixed PGE focus hijacking.

## 2024-05-17

- Added support to deploy on subpaths
- Added updated version of PGE, Extensions, and Utlities
- Fixed patreon supporters not updated after PGEtinker upgrades
- Added filters for compiler output

## 2024-05-14

- Added view counter to shared codes

## 2024-05-12

- Added health check and compiler existence checks

## 2024-05-08

- Added limitations to the remote include feature
- Catch compiler/linker timeout for better error handling

## 2024-05-06

- Added cloudflare analytics and disclosure
- Added supporter wall
- Fixed bug with supporter wall
- Fixed security flaw. iframes weren't created with sandbox

## 2024-05-05

- Added logging to database
- Added s3 bucket storage system
- Fixed hashCode string literal test

## 2024-05-02

- Fixed [Issue #50](https://github.com/Moros1138/PGEtinker/issues/50)
- Added Build Information panel (Requires you to reset to default layout)
- Added Console panel (Requires you to reset to default layout)

## 2024-05-01

- Added the changelog
- Added the first changelog entry
- Added version indicators in frontend/backend
- Added versioning to the container image build process
- Added Pixel Code font
- Added news and update dialog (you're seeing it right now!)
- Removed unused assets
