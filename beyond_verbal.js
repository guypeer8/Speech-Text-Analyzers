const request = require('request');
const {ANALYSIS_URL, TOKEN_URL, API_KEY} = require('./beyond_verbal_conf.js');

/**
 * @param url {String}
 * @param headers {Object}
 * @param body {Object}
 * @param form {Object}
 * @param json {Boolean}
 * @returns {Promise}
 */
function createPostRequest({url, headers={"Content-Type": "application/x-www-form-urlencoded"}, body, form, json}) {
    const params = {url, headers};
    if(json) {
        params.json = true;
    }
    if(form) {
        params.form = form;
    }
    if(body) {
        params.body = body;
    }
    // create promise
    const promise = new Promise((resolve, reject) => {
        request.post(params, (err, rsp, body) => {
            if(err) {
                return reject(err);
            }
            if(typeof(body) === 'string') {
                body = JSON.parse(body);
            }
            resolve(body);
        });
    });
    return promise;
}

/**
 * @returns {Promise}
 */
function getToken() {
    return createPostRequest({
        url: TOKEN_URL,
        form: {
            grant_type: 'client_credentials',
            apiKey: API_KEY
        }
    });
}

/**
 * @param url {String}
 * @param token {String}
 * @returns {Promise}
 */
function startAnalyze(url, token, type='WAV') {
    return createPostRequest({
        url,
        json: true,
        body: {
            dataFormat: {type}
        },
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
}

/**
 * @param url {String}
 * @param token {String}
 * @returns {Promise}
 */
function recordAnalyze(url, token, cbk) {
    return request.post({
        url,
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }, (err, rsp, body) => {
        if(err) {
            return cbk(err);
        }
        cbk(null, JSON.parse(body));
    });
}

/**
 * @param file_path {String}
 * @param cbk {Function}
 */
function analyzeAudio(file_path, cbk) {
    const {createReadStream} = require('fs');
    const stream = createReadStream(file_path);
    let token;
    getToken()
        .then(({access_token}) => {
            token = access_token;
            return startAnalyze(`${ANALYSIS_URL}/start`, token);
        })
        .then(({recordingId}) => {
            stream.pipe(recordAnalyze(`${ANALYSIS_URL}/${recordingId}`, token, cbk));
        })
        .catch(cbk);
}

/**
 * Exports
 */
module.exports = {
    analyzeAudio
}
