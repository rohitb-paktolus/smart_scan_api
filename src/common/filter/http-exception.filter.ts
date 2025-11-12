import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    // Format the response consistently
    let message: string | string[];
    let error: string;

    if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
      message = exceptionResponse['message'];
      error = exceptionResponse['error'] || exception.name;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = exception.name;
    } else {
      message = 'An error occurred';
      error = 'Internal Server Error';
    }

    // Convert all messages to array format for consistency
    const formattedMessage = Array.isArray(message) ? message : [message];

    response.status(status).json({
      statusCode: status,
      message: formattedMessage, // Always array
      error: error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
