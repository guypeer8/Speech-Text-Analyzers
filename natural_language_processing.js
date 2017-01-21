const Language = require('@google-cloud/language');

/**
 * @param text {String}
 * @returns {Promise}
 */
function analyzeTextSentiment(text) {
    const language = Language();
    const document = language.document({
        type: "PLAIN_TEXT",
        content: text
    });
    return document.detectSentiment()
        .then(results => {
            const sentiment = results[0];
            return sentiment;
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
        });
}

/**
 * @param text {String}
 * @returns {Promise}
 */
function analyzeTextEntities(text) {
    const language = Language();
    const document = language.document({
        type: "PLAIN_TEXT",
        content: text
    });
    return document.detectEntities()
        .then(results => {
            const {people, other, goods, events, organizations, art} = results[0];
            const {entities} = results[1];
            return {
                people,
                other,
                goods,
                events,
                organizations,
                art,
                entities
            };
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
        });
}

/**
 * @param text {String}
 * @returns {Promise}
 */
function analyzeTextSyntax(text) {
    const language = Language();
    const document = language.document({
        type: "PLAIN_TEXT",
        content: text
    });
    return document.detectSyntax()
        .then(results => {
            const syntax = results[0];
            const {sentences, tokens} = results[1];
            return {
                syntax,
                sentences,
                tokens
            };
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
        });
}

/**
 * @param text {String}
 * @returns {Promise}
 */
function analyzeTextAnnotate(text) {
    const language = Language();
    const document = language.document({
        type: "PLAIN_TEXT",
        content: text
    });
    return document.annotate()
        .then(results => {
            const [res0, res1] = results;
            const {language, sentiment, entities, sentences, tokens} = res0;
            const sentencesAnalyzed = res1.sentences;
            const tokensAnalyzed = res1.tokens;
            return {
                language,
                sentiment,
                entities.
                sentences,
                tokens.
                sentencesAnalyzed,
                tokensAnalyzed
            };
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
        });
}

/**
 * Exports
 */
module.exports = {
    analyzeTextSentiment,
    analyzeTextEntities,
    analyzeTextSyntax,
    analyzeTextAnnotate
};
