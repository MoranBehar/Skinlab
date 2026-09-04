import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private logger = new Logger(S3Service.name);

  constructor(private configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('AWS_REGION');
    const accessKeyId =
      this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    this.bucketName =
      this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
  }

  /**
   * upload photo to s3
   * file name: products/{product_id}/{UUID}.jpg
   */
  async uploadProductImage(
    productId: number,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const uniqeId = uuid();

    const baseDir = `products/${productId}`;
    const key = `${baseDir}/${uniqeId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      const imageUrl = `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
      this.logger.log(`Image uploaded successfully: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error('Failed to upload image to S3', error);
      throw new Error('Failed to upload image');
    }
  }

  async deleteProductImage(productId: number): Promise<void> {
    this.logger.warn(
      `Soft delete activated for Product ID: ${productId}. Skipping physical image cleanup`,
    );
  }

  //Get a signed URL (in case you need private access)
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
