import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const message = exception instanceof HttpException ? exception.getResponse() : exception;
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    
    response
      .status(status)
      .json({
        statusCode: status,
        message: message.toString(), // directly assign the message
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}