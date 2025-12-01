const { axiosCall, headers } = require(".");

async function createDashManifest(encodingId, name, s3OutputId, outputPath) {

    const dashManifest = {
        method: 'POST',
        url: 'https://api.bitmovin.com/v1/encoding/manifests/dash/default',
        headers,
        data: {
            name: name,
            version: 'V2',
            profile: 'ON_DEMAND',
            encodingId: encodingId,
            manifestName: 'manifest.mpd',
            outputs: [{ outputId: s3OutputId, outputPath: outputPath, acl: [{ permission: 'PUBLIC_READ' }] }],
        }
    };

    const dashManifestId = await axiosCall(dashManifest);

    return dashManifestId;

};

async function createHLSManifest(encodingId, name, s3OutputId, outputPath) {

    const hlsManifest = {
        method: 'POST',
        url: 'https://api.bitmovin.com/v1/encoding/manifests/hls/default',
        headers,
        data: {
            name: name,
            version: 'V1',
            encodingId: encodingId,
            manifestName: 'manifest.m3u8',
            channelsAttributeForAudio: 'LEGACY',
            targetDurationRoundingMode: 'NORMAL_ROUNDING',
            outputs: [{ outputId: s3OutputId, outputPath: outputPath, acl: [{ permission: 'PUBLIC_READ' }] }],
        }
    };

    const hlsManifestId = await axiosCall(hlsManifest);

    return hlsManifestId;

};

module.exports = {

    createHLSManifest,
    createDashManifest,

};