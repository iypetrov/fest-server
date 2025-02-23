import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({ region: process.env.AWS_REGION });

const streamToBuffer = (stream: Readable): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
};

class ImagesService {
    constructor() {
        this.upload = this.upload.bind(this);
        this.get = this.get.bind(this);
    }

    public async upload(prefix: string, id: string, file: Express.Multer.File): Promise<string | null> {
        try {
            const key = `${prefix}/${id}`;
            await s3.send(new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'private',
            }));

            return `http://localhost:8080/api/v0/${key}/thumbnail`;
        } catch (error) {
                console.error('Error uploading image:', error);
                return null;
            }
    }

    public async get(prefix: string, id: string): Promise<{ buffer: Buffer, contentType: string } | null> {
        try {
            const key = `${prefix}/${id}`;
            const params = {
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
            };
            const data: GetObjectCommandOutput = await s3.send(new GetObjectCommand(params));

            const buffer = await streamToBuffer(data.Body as Readable); 
            const contentType = data.ContentType || 'application/octet-stream';  

            return { buffer, contentType };
        } catch (error) {
            console.error('Error retrieving image:', error);
            return null;
        }
    }
}

export const imagesService = new ImagesService();

