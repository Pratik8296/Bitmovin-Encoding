const axios = require('axios');

const name = "BRIBE-INC-V2_HLS";
const isDRM = false;
const ContentID = "BRIBE-INC-V2_HLS";
const drmType = "HLS"; // DASH, HLS

const resolutions = [
    ["144", '3', 256, 144, 30, 300000, 400000, 200000, 1, 1, 10, "DIA", "BASELINE"],
    ["240", '3', 426, 240, 30, 500000, 600000, 400000, 1, 1, 10, "DIA", "BASELINE"],
    ["480", '3.1', 854, 480, 30, 1200000, 1500000, 900000, 2, 2, 15, "HEX", "MAIN"],
    ["720", '4.1', 1280, 720, 60, 3500000, 5000000, 2500000, 3, 2, 25, "HEX", "MAIN"],
    ["1080", '4.2', 1920, 1080, 60, 7000000, 9000000, 5000000, 4, 3, 35, "HEX", "HIGH"],
];

const ApiKey = 'ded0a952-64d1-4b1c-9a94-c486703fefaf';
const OrgId = '57c980ab-1448-4ffc-9b06-3df68f00a574';

const headers = { 'accept': 'application/json', 'content-type': 'application/json', 'X-Api-Key': ApiKey, 'X-Tenant-Org-Id': OrgId };

const s3InputId = "6eb65b94-4036-4dd1-83dc-2ee9c478d8d8";    // joltspace-assests
const s3OutputId = "571f1878-5472-4dcc-bd26-6b01407b3f6b";   // jolt-film-stream-destination
// const s3InputId = "991febd4-3e51-427c-bb5a-96a02a1c3b4e"; // jolt-film-stream-source

// const inputPath = "development/filmSource/MIB2/MIB2.mp4";
// const outputPath = "development/Bitmovin-Movies/MIB_MULTI_DRM/";

// const subtitlePaths = [
//     { language: 'HI', path: "development/filmSource/MIB2/subtitles/MIB2-hi-IN.vtt", name: 'Hindi' },
//     { language: 'ML', path: "development/filmSource/MIB2/subtitles/MIB2-ml-IN.vtt", name: 'Malayalam' },
//     { language: 'PT', path: "development/filmSource/MIB2/subtitles/MIB2-pt-BR.vtt", name: 'Portuguese' },
// ];

// const inputPath = "development/filmSource/STREEE_2/STREEE_2.mkv";
// const outputPath = "development/Bitmovin-Movies/STREEE_2_V2/";

const subtitlePaths = [
    { language: 'EN', path: "production/filmSource/BRIBE-INC/BribeInc_subtitles_updated_Nov2025.vtt", name: 'English' }
];

const inputPath = "production/filmSource/BRIBE-INC/BribeInc_Theatrical_Recut_1920x1080_ProRes422HQ_5_1_20250408-Apple Devices HD (Best Quality).m4v";
const outputPath = "production/Bitmovin-API-Subtitle-Stream/BRIBE-INC-V2/";

// const subtitlePaths = [];

async function axiosCall(requestOptions) {
    try {
        const response = await axios.request(requestOptions);
        if (!response || !response?.data?.data?.result?.id || response?.data?.status !== "SUCCESS") { throw new Error("Api Issue !!!"); };
        return response?.data?.data?.result?.id;
    } catch (error) {
        console.log(error);
    };
};

module.exports = { name, isDRM, headers, s3InputId, axiosCall, s3OutputId, inputPath, outputPath, resolutions, subtitlePaths, ContentID, drmType };