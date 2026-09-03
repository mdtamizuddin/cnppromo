const { S3Client, DeleteObjectsCommand } = require("@aws-sdk/client-s3");

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "cnppromo-files";
const REGION = process.env.AWS_REGION || "ap-south-1";
const URL_PREFIX = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`;

// This app's only prefix that is ever purged in bulk by application code.
// Deletion is deliberately restricted to this one prefix — see below.
const DELETABLE_PREFIX = "task-proofs/";

const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

/**
 * Deletes the given S3 objects, addressed by their full public URLs.
 *
 * Refuses any key that does not fall under task-proofs/. This is the guard
 * that stops a malformed or hostile stored URL from making a bulk purge
 * delete something permanent, like the site logo — non-negotiable, and it
 * pairs with the submit-time URL check in task.service.js.
 */
const deleteObjectsByUrl = async (urls = []) => {
    const keys = [];
    for (const url of urls) {
        if (typeof url !== "string" || !url.startsWith(URL_PREFIX)) continue;
        const key = url.slice(URL_PREFIX.length);
        if (!key.startsWith(DELETABLE_PREFIX)) continue;
        keys.push(key);
    }
    if (!keys.length) return { deleted: 0 };

    let deleted = 0;
    for (let i = 0; i < keys.length; i += 1000) {
        const batch = keys.slice(i, i + 1000);
        await s3.send(new DeleteObjectsCommand({
            Bucket: BUCKET_NAME,
            Delete: { Objects: batch.map((Key) => ({ Key })) },
        }));
        deleted += batch.length;
    }
    return { deleted };
};

module.exports = { deleteObjectsByUrl, DELETABLE_PREFIX, URL_PREFIX };
