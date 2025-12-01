const axios = require('axios');
const xml2js = require('xml2js');

async function fetchDRMOptions() {

    const url = 'http://wvm.ezdrm.com/ws/LicenseInfo.asmx/GenerateKeys';

    const params = { U: 'kelly@joltspace.com', P: 's3cur3R4nKuMMpK1ck', C: '' };

    const apiResult = await axios.get(url, { params });
    const fairplayApiresult = await axios.post(`https://fps.ezdrm.com/api/keys?U=${params.U}&P=${params.P}`);

    const jsonData = await xml2js.parseStringPromise(apiResult.data, { explicitArray: false });
    const fairplayJsonData = await xml2js.parseStringPromise(fairplayApiresult.data, { explicitArray: false });

    const json = JSON.parse(JSON.stringify(jsonData));
    const fairplayJson = JSON.parse(JSON.stringify(fairplayJsonData));

    const widevineObject = {
        ContentID: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.ContentID,
        Key: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.Key,
        KeyHEX: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.KeyHEX,
        KeyID: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.KeyID,
        KeyIDGUID: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.KeyIDGUID,
        KeyIDHEX: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.KeyIDHEX,
        PSSH: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.PSSH,
        ServerURL: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.ServerURL,
    };

    const playreadyObject = {
        Key: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.Key,
        KeyHEX: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.KeyHEX,
        KeyIDGUID: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.KeyIDGUID,
        LAURL: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.LAURL,
        Checksum: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.Checksum,
    };

    const fairplayObject = {
        AssetID: fairplayJson.FairPlay.AssetID,
        KeyHEX: fairplayJson.FairPlay.KeyHEX,
        KeyID: fairplayJson.FairPlay.KeyID,
        KeyUri: fairplayJson.FairPlay.KeyUri,
        LicensesUrl: fairplayJson.FairPlay.LicensesUrl,
        SupportedFPSVersions: fairplayJson.FairPlay.SupportedFPSVersions,
        FairplayLAURL: fairplayJson.FairPlay.LicensesUrl + '/' + fairplayJson.FairPlay.AssetID,
        iv: fairplayJson.FairPlay.KeyHEX.slice(32),
        key: fairplayJson.FairPlay.KeyHEX.slice(0, 32)
    }

    console.log("widevineObject.KeyHEX, fairplayObject.KeyHEX",widevineObject.KeyHEX, fairplayObject.KeyHEX);

    return { widevineObject, playreadyObject, fairplayObject };
};

async function fetchDRMOptionsV2(ContentID, drmType) {

    const params = { U: 'kelly@joltspace.com', P: 's3cur3R4nKuMMpK1ck', C: ContentID };
    let widevineObject, playreadyObject, fairplayObject;

    if (drmType === "DASH") {
        const url = 'http://wvm.ezdrm.com/ws/LicenseInfo.asmx/GenerateKeys';
        const apiResult = await axios.get(url, { params });
        const jsonData = await xml2js.parseStringPromise(apiResult.data, { explicitArray: false });
        const json = JSON.parse(JSON.stringify(jsonData));

        widevineObject = {
            ContentID: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.ContentID,
            Key: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.Key,
            KeyHEX: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.KeyHEX,
            KeyID: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.KeyID,
            KeyIDGUID: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.KeyIDGUID,
            KeyIDHEX: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.KeyIDHEX,
            PSSH: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.PSSH,
            ServerURL: json.DataSet['diffgr:diffgram'].EZDRM.WideVine.ServerURL,
        };
    
        playreadyObject = {
            Key: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.Key,
            KeyHEX: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.KeyHEX,
            KeyIDGUID: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.KeyIDGUID,
            LAURL: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.LAURL,
            Checksum: json.DataSet['diffgr:diffgram'].EZDRM.PlayReady.Checksum,
        };

        return { widevineObject, playreadyObject };
    }

    if (drmType === "HLS") {
        const fairplayApiresult = await axios.post(`https://fps.ezdrm.com/api/keys?U=${params.U}&P=${params.P}`);
        const fairplayJsonData = await xml2js.parseStringPromise(fairplayApiresult.data, { explicitArray: false });
        const fairplayJson = JSON.parse(JSON.stringify(fairplayJsonData));

        fairplayObject = {
            AssetID: fairplayJson.FairPlay.AssetID,
            KeyHEX: fairplayJson.FairPlay.KeyHEX,
            KeyID: fairplayJson.FairPlay.KeyID,
            KeyUri: fairplayJson.FairPlay.KeyUri,
            LicensesUrl: fairplayJson.FairPlay.LicensesUrl,
            SupportedFPSVersions: fairplayJson.FairPlay.SupportedFPSVersions,
            FairplayLAURL: fairplayJson.FairPlay.LicensesUrl + '/' + fairplayJson.FairPlay.AssetID,
            iv: fairplayJson.FairPlay.KeyHEX.slice(32),
            key: fairplayJson.FairPlay.KeyHEX.slice(0, 32)
        }
    
        return { fairplayObject };
    }
};

module.exports = { fetchDRMOptions, fetchDRMOptionsV2 };