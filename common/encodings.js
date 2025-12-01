const { axiosCall, headers, isDRM } = require("./index");

async function createEncoding(name) {

    const createEncodingId = {
        method: 'POST',
        url: 'https://api.bitmovin.com/v1/encoding/encodings',
        headers,
        data: { name: name, cloudRegion: 'AWS_US_EAST_1' }
    };

    const EncodingId = await axiosCall(createEncodingId);
    // console.log(EncodingId);

    return EncodingId;

};

async function createVideoStream(encodingId, name, s3InputId, inputPath, videoConfigId) {

    const videoStream = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/streams`,
        headers,
        data: {
            name: name,
            codecConfigId: videoConfigId,
            decodingErrorMode: 'FAIL_ON_ERROR',
            inputStreams: [{ selectionMode: 'AUTO', inputId: s3InputId, inputPath: inputPath }],
        }
    };

    const videoStreamId = await axiosCall(videoStream);

    return videoStreamId;

};

async function createAudioStream(encodingId, name, s3InputId, inputPath, audioConfigId) {

    const audioStream = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/streams`,
        headers,
        data: {
            name: name,
            codecConfigId: audioConfigId,
            decodingErrorMode: 'FAIL_ON_ERROR',
            inputStreams: [{ selectionMode: 'AUTO', inputId: s3InputId, inputPath: inputPath }],
        }
    };

    const audioStreamId = await axiosCall(audioStream);

    return audioStreamId;

};

const createWebVttInputStream = async (encodingId, s3InputId, inputPath, name) => {

    const webVttInputStream = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/input-streams/file`,
        headers,
        data: { fileType: 'WEBVTT', inputId: s3InputId, inputPath: inputPath }
    };

    const webVttInputStreamId = await axiosCall(webVttInputStream);

    return webVttInputStreamId;

};

async function createSubtitleStream(encodingId, name, webConfigId, inputStreamId, languageName) {

    const subtitleStream = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/streams`,
        headers,
        data: {
            name: name,
            codecConfigId: webConfigId,
            decodingErrorMode: 'FAIL_ON_ERROR',
            inputStreams: [{ inputStreamId: inputStreamId }],
            metadata: { language: languageName },
        }
    };

    const subtitleStreamId = await axiosCall(subtitleStream);

    return subtitleStreamId;

};

const createWebVttChunkText = async (encodingId, streamId, s3OutputId, outputPath) => {

    const webVttChunkText = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/muxings/chunked-text`,
        headers,
        data: {
            segmentLength: 5,
            segmentNaming: 'segment_%number%',
            streams: [{ streamId: streamId }],
            outputs: [{ outputId: s3OutputId, outputPath: outputPath, acl: [{ permission: 'PUBLIC_READ' }] }],
        }
    };

    const webVttChunkTextId = await axiosCall(webVttChunkText);

    return webVttChunkTextId;

};

async function createVideoFmp4Muxing(encodingId, name, videoStreamId, s3OutputId, outputPath) {

    let videoFmp4Muxing = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/muxings/fmp4`,
        headers,
        data: {
            name: name,
            segmentLength: 5,
            streamConditionsMode: 'DROP_MUXING',
            streams: [{ streamId: videoStreamId }],
            outputs: [{ outputId: s3OutputId, outputPath: outputPath }],
        }
    };

    if (isDRM) { delete videoFmp4Muxing.data.outputs };

    const videoFmp4MuxingId = await axiosCall(videoFmp4Muxing);

    return videoFmp4MuxingId;

};

async function createAudioFmp4Muxing(encodingId, name, audioStreamId, s3OutputId, outputPath) {

    let audioFmp4Muxing = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/muxings/fmp4`,
        headers,
        data: {
            name: name,
            segmentLength: 5,
            streamConditionsMode: 'DROP_MUXING',
            streams: [{ streamId: audioStreamId }],
            outputs: [{ outputId: s3OutputId, outputPath: outputPath }],
        }
    };

    if (isDRM) { delete audioFmp4Muxing.data.outputs };

    const audioFmp4MuxingId = await axiosCall(audioFmp4Muxing);

    return audioFmp4MuxingId;

};

async function createDRMVideoCENCMuxing(encodingId, muxingId, s3OutputId, outputPath, drmType, key = null, kid = null, pssh = null, laUrl = null, KeyUri = null, iv = null) {

    var data = {};

    if (drmType == 'HLS') {
        console.log("In FairPlay HLS", key, iv, KeyUri);
        data = {
            key: key,
            ivSize: '16_BYTES',
            encryptionMode: 'CTR', // CTR // CBC
            fairPlay: {
                iv: iv,
                uri: KeyUri
            },
            outputs: [{ acl: [{ permission: 'PUBLIC_READ' }], outputId: s3OutputId, outputPath: outputPath }],
        }
    }

    if (drmType == 'DASH') {
        console.log("In playready/widevine DASH", key, kid, pssh, laUrl);
        data = {
            key: key,
            kid: kid,
            encryptionMode: 'CTR', // CTR // CBC
            ivSize: '16_BYTES',
            widevine: { pssh: pssh },
            playReady: { laUrl: laUrl },
            outputs: [{ acl: [{ permission: 'PUBLIC_READ' }], outputId: s3OutputId, outputPath: outputPath }]
        }
    }

    const DRMVideoCENCMuxing = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/muxings/fmp4/${muxingId}/drm/cenc`,
        headers,
        data: data
    };

    const DRMVideoCENCMuxingId = await axiosCall(DRMVideoCENCMuxing);
    return DRMVideoCENCMuxingId;
};

async function createDRMVideoCENCMuxingV2(encodingId, muxingId, s3OutputId, outputPath, drmType, key = null, kid = null, pssh = null, laUrl = null, fpKey = null, fpKeyID = null, KeyUri = null, iv = null) {

    var data = {};
    console.log("In DRM CENC Muxing V2", key, kid, pssh, laUrl, iv, KeyUri);
    data = {
        key: key,
        kid: kid,
        encryptionMode: 'CTR', // CTR // CBC
        ivSize: '16_BYTES',
        widevine: { pssh: pssh },
        playReady: { laUrl: laUrl },
        fairPlay: {
            iv: iv,
            uri: KeyUri
        },
        outputs: [{ acl: [{ permission: 'PUBLIC_READ' }], outputId: s3OutputId, outputPath: outputPath }]
    }

    const DRMVideoCENCMuxing = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/muxings/fmp4/${muxingId}/drm/cenc`,
        headers,
        data: data
    };

    const DRMVideoCENCMuxingId = await axiosCall(DRMVideoCENCMuxing);
    return DRMVideoCENCMuxingId;
};

async function startEncoding(encodingId, vodDashManifests, vodHlsManifests) {

    const startEncoding = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/start`,
        headers,
        data: {
            manifestGenerator: 'V2',
            vodHlsManifests: vodHlsManifests,
            vodDashManifests: vodDashManifests,
            tweaks: { audioVideoSyncMode: 'RESYNC_AT_START_AND_END' },
        }
    };

    const startEncodingId = await axiosCall(startEncoding);
    return startEncodingId;
};

async function createSprite(encodingId, videoStreamId, name, s3OutputId, outputPath) {
    const sprite = {
        method: 'POST',
        url: `https://api.bitmovin.com/v1/encoding/encodings/${encodingId}/streams/${videoStreamId}/sprites`,
        headers,
        data: {
            name: name,
            height: 67,
            width: 120,
            distance: 10,
            unit: 'SECONDS',
            aspectMode: 'STRETCH',
            vttName: 'sprite.vtt',
            spriteName: 'sprite.jpg',
            creationMode: 'INTERVAL_END',
            hTiles: 7,
            vTiles: 7,
            // jpegConfig: { quality: 25 },
            outputs: [{ outputId: s3OutputId, outputPath: outputPath, acl: [{ permission: 'PUBLIC_READ' }] }],
        }
    };
    const spriteId = await axiosCall(sprite);
    return spriteId;
};

module.exports = {
    startEncoding,
    createEncoding,
    createVideoStream,
    createAudioStream,
    createSubtitleStream,
    createWebVttChunkText,
    createVideoFmp4Muxing,
    createAudioFmp4Muxing,
    createWebVttInputStream,
    createDRMVideoCENCMuxing,
    createDRMVideoCENCMuxingV2,
    createSprite
};