import Bull from 'bull';
import dbClient from './utils/db.js';
import fs from 'fs';
import path from 'path';
import imageThumbnail from 'image-thumbnail';

// Create the queue
const fileQueue = new Bull('fileQueue');

// Process the queue
fileQueue.process(async (job) => {
    const { userId, fileId } = job.data;

    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    // Retrieve the file from the database
    const file = await dbClient.client.db().collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
    });

    if (!file) throw new Error('File not found');

    // Ensure the file is an image
    if (file.type !== 'image') throw new Error('File is not an image');

    // Generate thumbnails and save them
    const sizes = [500, 250, 100];
    const originalPath = file.localPath;

    for (const size of sizes) {
        const options = { width: size };
        const thumbnail = await imageThumbnail(originalPath, options);
        const thumbnailPath = `${originalPath}_${size}`;
        fs.writeFileSync(thumbnailPath, thumbnail);
    }
});
