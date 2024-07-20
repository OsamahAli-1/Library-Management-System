import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorContent = {
      url: request.url,
      timestamp: new Date().toISOString(),
      status: status,
      message: exception.message,
      exceptionResponse: exceptionResponse,
    };
    this.logger.error(`HTTP EXCEPTION: ${JSON.stringify(errorContent)}`);

    response.status(status).json(exceptionResponse);
  }
}
