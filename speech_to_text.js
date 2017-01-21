const Speech = require('@google-cloud/speech');

/**
 * @param filename {String}
 * @param callback {Function}
 */
function streamingSpeechToText(filename, callback) {
    const {createReadStream} = require('fs');
    const speech = Speech();

    const options = {
        config: {
            encoding: 'LINEAR16',
            sampleRate: 16000
        }
    };

    const recognizeStream = speech.createRecognizeStream(options);

    recognizeStream
        .on('data', (data) => {
            console.log(`Data Received: ${data}.`);
            callback(null, data);
        })
        .on('error', (err) => {
            console.log(`Error: ${err.message}`);
            callback(err);
        });

    createReadStream(filename).pipe(recognizeStream);
}

/**
 * @param filename {String}
 * @returns {Promise}
 */
function asyncSpeechToText(filename) {
  const speech = Speech();

  const config = {
    encoding: 'LINEAR16',
    sampleRate: 16000
  };

  let startTime;

  return speech.startRecognition(filename, config)
    .then((results) => {
      // create promises array from results
      const promises = results.filter(result => !!result.promise).map(result => result.promise());
      console.log('Starting to analyze speech.');
      startTime = Date.now();
      return Promise.all(promises);
    })
    .then((transcriptions) => {
      console.log(`Speech Analyzer Result: ${JSON.stringify(transcriptions)}.`);
      console.log(`Analyze took ${(Date.now() - startTime) / 1000} seconds.`);
      return transcriptions.reduce((acc, arr) => acc.concat(arr)).filter(transcript => !!transcript).join(' ');
    })
    .catch(err => {
        console.log(`Error Message: ${err.message}.`);
        console.log(`Speech Analyzer Failed.`);
    });
}

/**
 * Exports
 */
module.exports = {
    asyncSpeechToText,
    streamingSpeechToText
};
