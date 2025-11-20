import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Res,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiFile } from '../../common/decorators/api-file.decorator';
import { FileUploadService } from './file-upload.service';

class UploadResponseDto {
  key: string;
  url: string;
  message: string;
}

class PresignedUploadResponseDto {
  presignedUrl: string;
  key: string;
  url: string;
  message: string;
}

class PresignedDownloadResponseDto {
  presignedUrl: string;
  message: string;
}

class DeleteResponseDto {
  message: string;
}

class PresignedUploadRequestDto {
  filename: string;
  contentType?: string;
}

@ApiTags('File Management')
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiFile('file', true)
  @ApiOperation({ summary: 'Upload a file directly to the server' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const result = await this.fileUploadService.uploadFile(file);

    return {
      ...result,
      message: 'File uploaded successfully',
    };
  }

  @Post('presigned-upload-url')
  @ApiOperation({ summary: 'Generate presigned URL for direct client upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', example: 'document.pdf' },
        contentType: {
          type: 'string',
          example: 'application/pdf',
          nullable: true,
        },
      },
      required: ['filename'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Presigned URL generated successfully',
    type: PresignedUploadResponseDto,
  })
  async generatePresignedUploadUrl(
    @Body() body: PresignedUploadRequestDto,
  ): Promise<PresignedUploadResponseDto> {
    const { filename, contentType } = body;
    const result = await this.fileUploadService.generatePresignedUploadUrl(
      filename,
      contentType,
    );

    return {
      ...result,
      message:
        'Presigned URL generated successfully. Use PUT method to upload directly.',
    };
  }

  @Get('presigned-download-url/:key')
  @ApiOperation({ summary: 'Generate presigned URL for file download' })
  @ApiParam({ name: 'key', description: 'File key' })
  @ApiResponse({
    status: 200,
    description: 'Presigned download URL generated',
    type: PresignedDownloadResponseDto,
  })
  async generatePresignedDownloadUrl(
    @Param('key') key: string,
  ): Promise<PresignedDownloadResponseDto> {
    const { presignedUrl } =
      await this.fileUploadService.generatePresignedDownloadUrl(key);

    return {
      presignedUrl,
      message: 'Presigned download URL generated successfully',
    };
  }

  @Get('url/:key')
  @ApiOperation({ summary: 'Get public URL for file' })
  @ApiParam({ name: 'key', description: 'File key' })
  @ApiResponse({ status: 200, description: 'File URL returned' })
  getFileUrl(@Param('key') key: string): { url: string } {
    const url = this.fileUploadService.getFileUrl(key);
    return { url };
  }

  @Get('download/:key')
  @ApiOperation({ summary: 'Generate download URL for file' })
  @ApiParam({ name: 'key', description: 'File key' })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  async getDownloadUrl(
    @Param('key') key: string,
  ): Promise<{ downloadUrl: string }> {
    const { presignedUrl } =
      await this.fileUploadService.generatePresignedDownloadUrl(key);
    return { downloadUrl: presignedUrl };
  }

  @Get('view/:key')
  @ApiOperation({ summary: 'Get public URL to view file' })
  @ApiParam({ name: 'key', description: 'File key' })
  @ApiResponse({ status: 200, description: 'File URL returned' })
  getViewUrl(@Param('key') key: string): { viewUrl: string } {
    const viewUrl = this.fileUploadService.getFileUrl(key);
    return { viewUrl };
  }

  @Get('content/:key')
  @ApiOperation({ summary: 'Serve file content directly' })
  @ApiParam({ name: 'key', description: 'File key' })
  @ApiResponse({ status: 200, description: 'File content served' })
  @Header('Content-Type', 'application/octet-stream')
  async serveFile(
    @Param('key') key: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const downloadUrl =
        await this.fileUploadService.generatePresignedDownloadUrl(key);

      // Fetch the file and stream it
      const response = await fetch(downloadUrl.presignedUrl);
      const buffer = await response.arrayBuffer();

      res.setHeader(
        'Content-Type',
        response.headers.get('content-type') || 'application/octet-stream',
      );
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${key.split('/').pop()}"`,
      );
      res.send(Buffer.from(buffer));
    } catch (error) {
      throw new BadRequestException(`File not found: ${error.message}`);
    }
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'key', description: 'File key' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    type: DeleteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'File deletion failed' })
  async deleteFile(@Param('key') key: string): Promise<DeleteResponseDto> {
    await this.fileUploadService.deleteFile(key);
    return { message: 'File deleted successfully' };
  }
}
