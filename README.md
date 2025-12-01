# Bitmovin-Encoding

A Node.js application for automated video encoding and media streaming using the Bitmovin API. This project handles multi-resolution video encoding with support for DRM (Digital Rights Management) protection, subtitle processing, and manifest generation for both DASH and HLS streaming protocols.

## Project Overview

This project provides a comprehensive solution for:
- **Multi-Resolution Video Encoding**: Encode videos at 144p, 240p, 480p, 720p, and 1080p resolutions
- **DRM Support**: Integration with EZ-DRM for Widevine, PlayReady, and FairPlay protection
- **Subtitle Handling**: WebVTT subtitle processing and encoding
- **Manifest Generation**: Automatic DASH and HLS manifest creation
- **Sprite Generation**: Thumbnail sprite creation for video preview

## Project Structure

```
bitmovin-encoding/
├── index.js                 # Main application entry point
├── package.json             # Project dependencies
├── demo.txt                 # Sample HLS manifest output
├── README.md                # This file
├── common/
│   ├── index.js            # Configuration and S3 settings
│   ├── encodings.js        # Encoding operations (streams, muxing, DRM)
│   ├── configurations.js   # Video/audio codec configurations
│   └── manifest.js         # DASH and HLS manifest generation
└── ezDrm/
    └── index.js            # EZ-DRM integration for license keys
```

## Dependencies

- **axios**: ^1.7.7 - HTTP client for API requests
- **xml2js**: ^0.6.2 - XML parsing for manifest handling

## Key Features

### 1. **Multi-Resolution Encoding**
Supports encoding at multiple resolutions with customizable bitrates and codec settings:
- 144p (256x144) @ 30fps
- 240p (426x240) @ 30fps
- 480p (854x480) @ 30fps
- 720p (1280x720) @ 60fps
- 1080p (1920x1080) @ 60fps

### 2. **DRM Protection**
- **DASH Format**: Widevine and PlayReady protection
- **HLS Format**: FairPlay protection
- Integration with EZ-DRM for key management

### 3. **Subtitle Support**
- WebVTT subtitle processing
- Multi-language subtitle support
- Automatic subtitle chunking and encoding

### 4. **Manifest Generation**
- DASH manifest creation for multi-bitrate adaptive streaming
- HLS (M3U8) manifest generation
- Automatic master manifest creation

## Configuration

Edit `common/index.js` to configure:

```javascript
// Project Settings
const name = "YOUR_PROJECT_NAME";
const isDRM = false;  // Enable/disable DRM
const drmType = "HLS"; // "DASH" or "HLS"
const ContentID = "YOUR_CONTENT_ID";

// Bitmovin API Credentials
const ApiKey = 'YOUR_API_KEY';
const OrgId = 'YOUR_ORG_ID';

// S3 Storage IDs
const s3InputId = "INPUT_BUCKET_ID";   // Input video location
const s3OutputId = "OUTPUT_BUCKET_ID"; // Output encoded files location

// File Paths
const inputPath = "path/to/input/video.mp4";
const outputPath = "path/to/output/";

// Subtitles (optional)
const subtitlePaths = [
    { language: 'EN', path: "path/to/subtitle.vtt", name: 'English' }
];
```

## Usage

### Installation

```bash
npm install
```

### Running the Encoder

```bash
node index.js
```

The application will:
1. Fetch DRM license keys from EZ-DRM
2. Create a new encoding job on Bitmovin
3. Configure video and audio streams
4. Create video and audio muxings
5. Apply DRM protection (if enabled)
6. Generate DASH or HLS manifests
7. Start the encoding process

## Encoding Workflow

```
Start
  ↓
Fetch DRM Options (if enabled)
  ↓
Create Encoding Job
  ↓
Create Configurations (video, audio, subtitles)
  ↓
Create Streams
  ↓
Create Sprite (thumbnail preview)
  ↓
Create Muxings (FMP4)
  ↓
Apply DRM Protection (if enabled)
  ↓
Generate Manifests (DASH or HLS)
  ↓
Start Encoding
  ↓
End
```

## Output

The application generates:
- **Video Segments**: Encoded video files at each resolution
- **Audio Segments**: Encoded audio files
- **Subtitle Files**: WebVTT chunked subtitle files
- **Manifests**: Master and variant m3u8/mpd files
- **DRM Protected Files**: Additional DRM muxings (if enabled)
- **Sprite**: Thumbnail preview sprite image

## API Endpoints Used

- Bitmovin API for encoding operations
- EZ-DRM API for DRM key management
- S3-compatible storage for input/output

## Error Handling

The application includes error handling for:
- API request failures
- Invalid configuration
- Missing S3 credentials
- DRM service unavailability