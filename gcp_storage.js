const Storage = require('@google-cloud/storage');

/**
 * @param bucketName {String}
 * @param metadata {Object}
 * @returns {Void}
 */
function createBucket({bucketName, metadata={location: 'EUROPE-WEST1', regional: true}}, callback) {
    const storage = Storage();
    storage.createBucket(bucketName, metadata, (err, bucket) => {
        if(err) {
            console.log(`Error Message: ${err.message}.`);
            console.log(`Failed to create bucket: '${bucketName}'.`);
            return callback(err);
        }
        console.log(`Bucket '${bucket.name}' created.`);
        callback(null, bucket);
    });
}

/**
 * @param bucketName {String}
 * @returns {Promise}
 */
function deleteBucket(bucketName) {
    const storage = Storage();
    const bucket = storage.bucket(bucketName);
    return listFiles(bucketName)
        .then(files => {
            const deleteFilesPromises = files.map(file => deleteFile({bucketName, fileName: file.name}));
            Promise.all(deleteFilesPromises)
                .then(() => {
                    console.log(`Removed files from bucket '${bucketName}'.`);
                    bucket.delete()
                        .then(() => {
                            console.log(`Deleted bucket: '${bucket.name}'.`);
                        })
                        .catch(err => {
                            console.log(`Error Message: ${err.message}.`);
                            console.log(`Removed files of bucket '${bucketName}', but failed removing bucket itself.`);
                        });
                })
                .catch(err => {
                    console.log(`Error Message: ${err.message}.`);
                    console.log(`Failed removing all files from bucket '${bucketName}'.\n`);
                });
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log(`Failed listing files of bucket '${bucket}'.\n`);
        });
}

/**
 * @param bucketName {String}
 * @returns {Promise}
 */
function deleteEmptyBucket(bucketName) {
    const storage = Storage();
    const bucket = storage.bucket(bucketName);
    return bucket.delete()
        .then(() => {
            console.log(`Deleted bucket: '${bucket.name}'.`);
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log(`Filed to delete bucket '${bucketName}'.\n`);
        });
}

/**
 * @returns {Promise}
 */
function listBuckets() {
    const storage = Storage();
    return storage.getBuckets()
        .then(results => {
            const buckets = results[0];
            console.log(`Buckets: [${buckets.map(bucket => bucket.name)}]`);
            return buckets;
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log('Failed to list buckets.\n');
        });
}

/**
 * @param bucketName {String}
 * @returns {Promise}
 */
function getBucketMetadata(bucketName) {
    const storage = Storage();
    const bucket = storage.bucket(bucketName);
    return bucket.getMetadata()
        .then(results => {
            const metadata = results[0];
            console.log(`Bucket '${bucketName}' metadata: ${JSON.stringify(metadata)}`);
            return metadata;
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log(`Failed to get '${bucket.name}' metadata.`);
        });
}

/**
 * @returns {Promise}
 */
function getAllBucketsMetadata() {
    return listBuckets()
        .then(buckets => {
            const bucketsMetadataPromises = buckets.map(bucket => getBucketMetadata(bucket.name));
            return Promise.all(bucketsMetadataPromises);
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log(`Failed getting all buckets metadata.`);
        })
        .then(results => {
            console.log(`Got All Buckets Metadata.`);
            return results;
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log('Failed listing buckets.');
        });
}

/**
 * @returns {Void}
 */
function removeAllBuckets() {
    listBuckets().then(buckets => {
       const deleteBucketsPromises = buckets.map(bucket => deleteBucket(bucket.name));
       Promise.all(deleteBucketsPromises)
           .then(() => {
                console.log('Finished operation.');
           })
           .catch(err => {
               console.log(`Error Message: ${err.message}.`);
               console.log('Failed removing all buckets.\n');
           });
    });
}

/**
 * @param bucketName {String}
 * @returns {Promise}
 */
function listFiles(bucketName) {
    const storage = Storage();
    const bucket = storage.bucket(bucketName);
    return bucket.getFiles()
        .then(results => {
            const files = results[0];
            files.forEach(file => console.log(`${bucket.name}: File '${file.name}' is listed.`));
            return files;
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log('Failed listing the files.\n');
        });
}

/**
 * @param bucketName {String}
 * @param fileName {String}
 * @returns {Promise}
 */
function uploadFile({bucketName, fileName}) {
    const storage = Storage();
    const bucket = storage.bucket(bucketName);
    return bucket.upload(fileName)
        .then(results => {
            const file = results[0];
            console.log(`File '${file.name}' uploaded to bucket '${bucket.name}'.`);
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log(`Filed to upload file '${fileName}' to ${bucketName}.`);
        });
}

/**
 * @param bucketName {String}
 * @param srcFileName {String}
 * @param destFileName {String}
 * @returns {Promise}
 */
function downloadFile({bucketName, srcFileName, destFileName}) {
    const storage = Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(srcFileName);
    return file.download({destination: destFileName})
        .then(() => {
            console.log(`'${file.name}' was downloaded to '${destFileName}'.`);
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log(`Failed to download file '${srcFileName}' from '${bucketName}'.\n`);
        });
}

/**
 * @param bucketName {String}
 * @param fileName {String}
 * @returns {Promise}
 */
function deleteFile({bucketName, fileName}) {
    const storage = Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    return file.delete()
        .then(() => {
            console.log(`File '${file.name}' was deleted from bucket '${bucket.name}'.`);
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log(`File '${fileName}' probably does not exists in bucket '${bucketName}'.\n`);
        });
}

/**
 * @param bucketName {String}
 * @param fileName {String}
 * @returns {Promise}
 */
function getFileMetadata({bucketName, fileName}) {
    const storage = Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    return file.getMetadata()
        .then(results => {
            const metadata = results[0];
            console.log(`File: ${metadata.name}`);
            console.log(`Bucket: ${metadata.bucket}`);
            console.log(`Storage class: ${metadata.storageClass}`);
            console.log(`ID: ${metadata.id}`);
            console.log(`Size: ${metadata.size}`);
            console.log(`Updated: ${metadata.updated}`);
            console.log(`Generation: ${metadata.generation}`);
            console.log(`Metageneration: ${metadata.metageneration}`);
            console.log(`Etag: ${metadata.etag}`);
            console.log(`Owner: ${metadata.owner}`);
            console.log(`Component count: ${metadata.component_count}`);
            console.log(`Crc32c: ${metadata.crc32c}`);
            console.log(`md5Hash: ${metadata.md5Hash}`);
            console.log(`Cache-control: ${metadata.cacheControl}`);
            console.log(`Content-type: ${metadata.contentType}`);
            console.log(`Content-disposition: ${metadata.contentDisposition}`);
            console.log(`Content-encoding: ${metadata.contentEncoding}`);
            console.log(`Content-language: ${metadata.contentLanguage}`);
            console.log(`Metadata: ${metadata.metadata}\n`);
            return metadata;
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
            console.log(`Could not process metadata of file '${file.name}' in bucket '${bucket.name}'.`);
        });
}

/**
 * @param bucketName {String}
 * @returns {Promise}
 */
function getBucketFilesMetadata(bucketName) {
    return listFiles(bucketName)
        .then(files => {
            const metadataPromises = files.map(file => getFileMetadata({bucketName, fileName: file.name}));
            Promise.all(metadataPromises)
                .then(results => {
                    // callback to use metadata
                    return results;
                })
                .catch(err => {
                    console.log(`Error Message: ${err.message}.`);
                    console.log(`Getting metadata for files of bucket ${bucketName} failed.`);
                })
        })
        .catch(err => {
            console.log(`Error Message: ${err.message}.`);
        });
}

/**
 * Exports
 */
module.exports = {
    listBuckets,
    createBucket,
    deleteBucket,
    deleteEmptyBucket,
    getBucketMetadata,
    removeAllBuckets,
    getAllBucketsMetadata,
    listFiles,
    uploadFile,
    downloadFile,
    deleteFile,
    getFileMetadata,
    getBucketFilesMetadata
};

