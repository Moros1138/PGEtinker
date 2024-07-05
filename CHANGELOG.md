# Changelog

All notable changes to this project will be documented in this file. Each batch of changes is marked by the date it was published to the repository for deployment to the PGEtinker site.

It is a summary of changes that would be pertinent to the end user of the PGEtinker website. For a comprehensive history of changes made to the project, please refer to the repository's commit history.
## 20204-07-05

- Fixed bug involving shared code persistence
- Changed threshold for responsive navbar

## 2024-06-30

- Fixed [Issue #111](https://github.com/Moros1138/PGEtinker/issues/111)
- Fixed [Issue #112](https://github.com/Moros1138/PGEtinker/issues/112)
- Added logo graphic

## 2024-06-29

- Added example code menu to navbar
- Added example code menu to mobile navigation
- Added PGEtinker Classic Demo to the example code menu
- Added Bare olcPixelGameEngine to the example code menu
- Changed default code to PGEtinker Classic Demo example code
- Removed default code button from settings dialog
- Removed unused api endpoint for default code
- Removed unused function to retrieve default code
- Fixed fieldId should always refresh with each instance of the settings dialog
- Added button to a form group to make the width uniform on the settings dialog
- Changed select now has label and value rather than just label

## 2024-06-25

- Fixed light theme persistence
- Added link icon to links menu item
- Added help to menu
- Added patreon icon to supporters menu item
- Added styles to account for space used by help menu item
- Added preloader that actually lives up to it's name!

## 2024-06-19

- Fixed [Issue #105](https://github.com/Moros1138/PGEtinker/issues/105)
- Fixed other dialog styles for the portrait layout

## 2024-06-17

- Fixed [Issue #98](https://github.com/Moros1138/PGEtinker/issues/98)
- Removed sponsor spot from navbar
- Added normalize.css
- Added link to Javid's youtube channel
- Changed navbar menu, made ready for mobile
- Added mobile menu
- Added settings dialog
- Changed dialog behavior, no more click anywhere!
- Added toast notifications
- Added Javid Mode to settings dialog
- Added editor.inlayHints to settings dialog
- Fixed browser tests, broke due to UI changes
- Changed screenshot fail graphic (Thanks TechnicJelle)
- Changed light theme, make dialogs easier on the eyes
- Fixed [Issue #101](https://github.com/Moros1138/PGEtinker/issues/101)
- Fixed [Issue #100](https://github.com/Moros1138/PGEtinker/issues/100)

## 2024-06-10

- Added language client automatic reconnect
- Changed to typescript, partially
- Removed glyph margin from line number gutter

## 2024-06-09

- Fixed [Issue #92](https://github.com/Moros1138/PGEtinker/issues/92)
- Fixed default layout button handler
- Removed emscripten cache messages from compiler output

## 2024-06-08

- Fixed mobile oversize issue (big win for mobile)
- Added diagnostics middleware to monaco language client
- Changed Build Information panel to Compiler Output
- Added Problems panel [Issue #85](https://github.com/Moros1138/PGEtinker/issues/85)
- Removed old default layout
- Added default layout for portrait
- Added default layout for landscape
- Added storage abstraction
- Fixed [Issue #88](https://github.com/Moros1138/PGEtinker/issues/88)
- Added [Issue #87](https://github.com/Moros1138/PGEtinker/issues/87)

## 2024-06-04

- Added Alert when a runtime error occurs

## 2024-06-03

- Added Clangd Language server to the backend
- Added Language client and related packages to the frontend
- Added Narrow screen tweaks for mobile users (first step)
- Added Donation link
- Added An easy way to set a panel to have focus, required for an upcoming mobile update
- Added Loading screen
- Removed "show-console" hook to the emscripten template, no longer used
- Fixed Overzealous auto complete
- Fixed Linker error when the Geometry utility was included after the OLC_PGE_APPLICATION macro

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
