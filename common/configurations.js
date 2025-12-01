
const { axiosCall, headers } = require(".");
async function createVideoConfiguration(name, level, width, height, rate, bitrate, maxBitrate, minBitrate, refFrames, bframes, rcLookahead, motionEstimationMethod, profile) {

    var bframes = bframes;
    var cabac = true;
    var weightedPredictionPFrames = 'SMART';

    if (profile === 'BASELINE') {
        bframes = 0;
        cabac = false;
        weightedPredictionPFrames = 'DISABLED';
    };


    const videoConfig = {
        method: 'POST',
        url: 'https://api.bitmovin.com/v1/encoding/configurations/video/h264',
        headers,
        data: {

            nalHrd: 'NONE',
            subMe: 'RD_REF_IP',
            bPyramid: 'NORMAL',
            mvSearchRangeMax: 16,
            interlaceMode: 'NONE',
            pixelFormat: 'YUV420P',
            mvPredictionMode: 'AUTO',
            bAdaptiveStrategy: 'FULL',
            autoLevelSetup: 'ENABLED',
            encodingMode: 'THREE_PASS',
            trellis: 'ENABLED_FINAL_MB',
            weightedPredictionPFrames: weightedPredictionPFrames,
            adaptiveQuantizationMode: 'VARIANCE',
            cea608708SubtitleConfig: { passthroughMode: 'VIDEO_STREAM' },

            name: name,
            rate: rate,
            cabac: cabac,
            width: width,
            level: level,
            height: height,
            bitrate: bitrate,
            bframes: bframes,
            profile: profile,
            refFrames: refFrames,
            maxBitrate: maxBitrate,
            minBitrate: minBitrate,
            rcLookahead: rcLookahead,
            motionEstimationMethod: motionEstimationMethod,
        }
    };

    const videoConfigId = await axiosCall(videoConfig);

    return videoConfigId;

};

async function createAudioConfiguration(name, bitrate) {

    const audioConfig = {
        method: 'POST',
        url: 'https://api.bitmovin.com/v1/encoding/configurations/audio/aac',
        headers,
        data: {
            name: name,
            bitrate: bitrate,
            channelLayout: 'NONE',
        }
    };

    const audioConfigId = await axiosCall(audioConfig);

    return audioConfigId;

};

async function createWebVttConfiguration(name) {

    const webVttSubtitle = {
        method: 'POST',
        url: 'https://api.bitmovin.com/v1/encoding/configurations/subtitles/webvtt',
        headers,
        data: { name: name }
    };

    const webVttSubtitleId = await axiosCall(webVttSubtitle);

    return webVttSubtitleId;

};

module.exports = {

    createVideoConfiguration,
    createAudioConfiguration,
    createWebVttConfiguration,

};