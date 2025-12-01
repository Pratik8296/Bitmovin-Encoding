const { name, resolutions, inputPath, outputPath, s3InputId, s3OutputId, subtitlePaths, isDRM, ContentID, drmType } = require("./common/index");

const { fetchDRMOptions, fetchDRMOptionsV2 } = require("./ezDrm/index");

const { startEncoding, createEncoding, createAudioStream, createVideoStream, createSubtitleStream, createAudioFmp4Muxing, createWebVttChunkText, createVideoFmp4Muxing,
    createWebVttInputStream, createDRMVideoCENCMuxing, createDRMVideoCENCMuxingV2, createSprite } = require("./common/encodings");

const { createDashManifest, createHLSManifest } = require("./common/manifest");

const { createAudioConfiguration, createVideoConfiguration, createWebVttConfiguration } = require("./common/configurations");

(async () => {

    try {

        // * EZ-DRM-OPTIONS
        const { widevineObject, playreadyObject, fairplayObject } = await fetchDRMOptionsV2(ContentID, drmType);
        console.log(widevineObject, playreadyObject, fairplayObject);

        // * ENCODING
        const encodingId = await createEncoding(name);
        console.log({ name, encodingId });


        // * CONFIGURATIONS
        const videoConfigIds = await Promise.all(resolutions.map(([resulation, ...otherThings]) => createVideoConfiguration(name + "_" + resulation, ...otherThings)));
        const audioConfig = await createAudioConfiguration(name, 128000);
        console.log({ videoConfigIds, audioConfig });


        // * STREAMS
        const videoStreamIds = await Promise.all(videoConfigIds.map(configId => createVideoStream(encodingId, name, s3InputId, inputPath, configId)));
        const audioStreamId = await createAudioStream(encodingId, name, s3InputId, inputPath, audioConfig);
        console.log({ videoStreamIds, audioStreamId });

        // * SPRITE
        const spriteId = await createSprite(encodingId, videoStreamIds[0], name, s3OutputId, outputPath + "sprite/");
        console.log({ spriteId });

        // * SUBTITLES
        if (subtitlePaths && subtitlePaths.length > 0) {
            for (let subtitle of subtitlePaths) {
                const webvtt = await createWebVttConfiguration(name + `-${subtitle.language}`);
                const webVttInputStream = await createWebVttInputStream(encodingId, s3InputId, subtitle.path, subtitle.name);
                const webVttStreamId = await createSubtitleStream(encodingId, name + `-subtitle-${subtitle.language}`, webvtt, webVttInputStream, subtitle.name);
                const webVttChunkText = await createWebVttChunkText(encodingId, webVttStreamId, s3OutputId, outputPath + drmType + `/subtitle/${subtitle.language}/`);
                console.log({ webvtt, webVttInputStream, webVttStreamId, webVttChunkText });
            };
        }

        // * MUXINGS
        const videoMuxingIds = await Promise.all(videoStreamIds.map((streamId, index) => createVideoFmp4Muxing(encodingId, name, streamId, s3OutputId, outputPath + drmType + "/h264/" + resolutions[index][0] + "/")));
        const audioFmp4MuxingId = await createAudioFmp4Muxing(encodingId, name, audioStreamId, s3OutputId, outputPath + drmType + "/aac/" + "128000/");
        console.log({ videoMuxingIds, audioFmp4MuxingId });


        if (drmType == 'DASH') {
            // * DRM
            if (isDRM) {
                const videoDRM_CENCMuxing = await Promise.all(videoMuxingIds.map((muxingId, index) => createDRMVideoCENCMuxing(encodingId, muxingId, s3OutputId, outputPath + drmType + `/drm/video/${resolutions[index][0]}/`, drmType, widevineObject.KeyHEX, widevineObject.KeyIDHEX, widevineObject.PSSH, playreadyObject.LAURL)));
                const audioDRM_CENCMuxing = await createDRMVideoCENCMuxing(encodingId, audioFmp4MuxingId, s3OutputId, outputPath + drmType + '/drm/audio/', drmType, widevineObject.KeyHEX, widevineObject.KeyIDHEX, widevineObject.PSSH, playreadyObject.LAURL);
                console.log({ videoDRM_CENCMuxing, audioDRM_CENCMuxing });
            };
        }

        if (drmType == 'HLS') {
            // * DRM
            if (isDRM) {
                const videoDRM_CENCMuxing = await Promise.all(videoMuxingIds.map((muxingId, index) => createDRMVideoCENCMuxing(encodingId, muxingId, s3OutputId, outputPath + drmType + `/drm/video/${resolutions[index][0]}/`, drmType, fairplayObject.key, fairplayObject.KeyID, null, null, fairplayObject.KeyUri, fairplayObject.iv)));
                const audioDRM_CENCMuxing = await createDRMVideoCENCMuxing(encodingId, audioFmp4MuxingId, s3OutputId, outputPath + drmType + '/drm/audio/', drmType, fairplayObject.key, fairplayObject.KeyID, null, null, fairplayObject.KeyUri, fairplayObject.iv);
                console.log({ videoDRM_CENCMuxing, audioDRM_CENCMuxing });
            };
        }

        // * Manifests
        let dashManifestIds = [];
        let hlsManifestIds = [];
        if (drmType == 'DASH') {
            dashManifestIds = await Promise.all(videoStreamIds.map(e => createDashManifest(encodingId, name, s3OutputId, outputPath + drmType + '/')));
            console.log({ dashManifestIds });
        }

        if (drmType == 'HLS') {
            hlsManifestIds = await Promise.all(videoStreamIds.map(e => createHLSManifest(encodingId, name, s3OutputId, outputPath + drmType + '/')));
            console.log({ hlsManifestIds });
        }


        // * START-ENCODING
        if (drmType == 'DASH') {
            const startEncodingId = await startEncoding(encodingId, dashManifestIds.map(e => ({ manifestId: e })), []);
            console.log({ startEncodingId });
        }

        if (drmType == 'HLS') {
            const startEncodingId = await startEncoding(encodingId, [], hlsManifestIds.map(e => ({ manifestId: e })));
            console.log({ startEncodingId });
        }

    } catch (error) { console.log(error); };

})();