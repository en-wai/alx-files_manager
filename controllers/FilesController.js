import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import Bull from 'bull';
const fileQueue = new Bull('fileQueue');

class FilesController{
    // POST /files
   // POST /files
   static async postUpload(req, res) {
       const { name, type, data, parentId = 0, isPublic = false } = req.body;
       const token = req.headers['x-token'];
   
       // Validate inputs
       if (!name) return res.status(400).json({ error: 'Missing name' });
       if (!type || !['folder', 'file', 'image'].includes(type)) {
           return res.status(400).json({ error: 'Missing or invalid type' });
       }
       if (type !== 'folder' && !data) {
           return res.status(400).json({ error: 'Missing data' });
       }
   
       // Validate token and retrieve user
       const userId = await redisClient.get(`auth_${token}`);
       if (!userId) return res.status(401).json({ error: 'Unauthorized' });
   
       // Validate parentId if provided
       if (parentId !== 0) {
           const parent = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(parentId) });
           if (!parent) {
               return res.status(400).json({ error: 'Parent not found' });
           }
           if (parent.type !== 'folder') {
               return res.status(400).json({ error: 'Parent is not a folder' });
           }
       }
   
       try {
           if (type === 'file' || type === 'image') {
               const buffer = Buffer.from(data, 'base64');
               const fileId = uuidv4();
               const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
   
               // Ensure the folder exists
               if (!fs.existsSync(folderPath)) {
                   fs.mkdirSync(folderPath, { recursive: true });
               }
   
               const filePath = path.join(folderPath, fileId);
               fs.writeFileSync(filePath, buffer);
   
               // Create file document in DB
               const fileDocument = {
                   userId: ObjectId(userId),
                   name,
                   type,
                   isPublic,
                   parentId: parentId === 0 ? '0' : ObjectId(parentId),
                   localPath: filePath,
               };
   
               const result = await dbClient.client.db().collection('files').insertOne(fileDocument);
   
               // Add job to Bull queue if type is image
               if (type === 'image') {
                   fileQueue.add({ userId, fileId: result.insertedId });
               }
   
               return res.status(201).json({
                   id: result.insertedId,
                   userId,
                   name: fileDocument.name,
                   type: fileDocument.type,
                   isPublic: fileDocument.isPublic,
                   parentId: fileDocument.parentId,
               });
           }
   
           // Handle folder creation
           if (type === 'folder') {
               const folderDocument = {
                   userId: ObjectId(userId),
                   name,
                   type,
                   isPublic,
                   parentId: parentId === 0 ? '0' : ObjectId(parentId),
               };
   
               const result = await dbClient.client.db().collection('files').insertOne(folderDocument);
               return res.status(201).json({
                   id: result.insertedId,
                   userId,
                   name: folderDocument.name,
                   type: folderDocument.type,
                   isPublic: folderDocument.isPublic,
                   parentId: folderDocument.parentId,
               });
           }
       } catch (err) {
           console.error('Error while uploading file/folder:', err);
           return res.status(500).json({ error: 'Internal server error' });
       }
   }
   

    static async getShow(req, res){

        const { id } = req.params;
        const token = req.headers['x-token'];

         // Validate token and retrieve user
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) 
            return res.status(401).json({ error: 'Unauthorized' });

        try {
            // Retrieve file based on id and userId
            const file = await dbClient.client.db().collection('files').findOne({
                _id: ObjectId(id),
                userId: ObjectId(userId),
            });

            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            return res.status(200).json({
                id: file._id,
                userId: file.userId,
                name: file.name,
                type: file.type,
                isPublic: file.isPublic,
                parentId: file.parentId,
            });
        } catch (err) {
            console.error('Error while retrieving file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // GET /files
    static async getIndex(req, res) {
        const { parentId = 0, page = 0 } = req.query;
        const token = req.headers['x-token'];

        // Validate token and retrieve user
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });

        try {
            // Get the files for the given parentId with pagination
            const files = await dbClient.client.db().collection('files').aggregate([
                { $match: { userId: ObjectId(userId), parentId: ObjectId(parentId) } },
                { $skip: page * 20 },
                { $limit: 20 },
                { $project: { name: 1, type: 1, isPublic: 1, parentId: 1 } },
            ]).toArray();

            return res.status(200).json(files);
        } catch (err) {
            console.error('Error while retrieving files:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // PUT /files/:id/publish
    static async putPublish(req, res) {
        const { id } = req.params;
        const token = req.headers['x-token'];

        // Validate token and retrieve user
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        try {
            // Find the file in the database
            const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            // Update isPublic to true
            file.isPublic = true;

            // Update the file document
            await dbClient.client.db().collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: true } });

            // Return the updated file document
            return res.status(200).json(file);
        } catch (err) {
            console.error('Error while publishing file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    // PUT /files/:id/unpublish
    static async putUnpublish(req, res) {
        const { id } = req.params;
        const token = req.headers['x-token'];

        // Validate token and retrieve user
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        try {
            // Find the file in the database
            const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            // Update isPublic to false
            file.isPublic = false;

            // Update the file document
            await dbClient.client.db().collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: false } });

            // Return the updated file document
            return res.status(200).json(file);
        } catch (err) {
            console.error('Error while unpublishing file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Retrieve the file
    static async getFile(req, res) {
      try {
        const { id } = req.params;
        const { size } = req.query;
        const token = req.headers['x-token'];
    
        // Get the userId from Redis
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
        // Retrieve the file by ID and ensure it belongs to the user
        const file = await dbClient.client.db().collection('files').findOne({ 
          _id: ObjectId(id) 
        });
    
        if (!file) {
          return res.status(404).json({ error: 'Not found' });
        }

        console.log('Retrieved file:', file);
        
    
        // Check if the file is public or if the user is the owner
        if (!file.isPublic && String(file.userId) !== String(userId)) {
          return res.status(404).json({ error: 'Not found' });
        }
    
        // Check if the file is a folder
        if (file.type === 'folder') {
          return res.status(400).json({ error: "A folder doesn't have content" });
        }
    
        // Check if the file exists locally
        const filePath = file.localPath;
        if (size) {
            const validSizes = ['500', '250', '100'];
            if (!validSizes.includes(size)) {
                return res.status(400).json({ error: 'Invalid size parameter' });
            }
            filePath = `${file.localPath}_${size}`;
        }
        
        if (!fs.existsSync(filePath)) {
            console.log(`File not found at path: ${filePath}`);
            return res.status(404).json({ error: 'Not found' });
        }
    
        // Get MIME type based on the file extension
        const mimeType = mime.lookup(file.name);
        if (!mimeType) {
          return res.status(400).json({ error: 'Unsupported file type' });
        }
    
        // Return the file content with the correct MIME type
        res.setHeader('Content-Type', mimeType);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    
      } catch (error) {
        console.error(error); // Log error for debugging
        res.status(500).json({ error: 'Internal server error' });
      }
    }
}

module.exports = FilesController;
