import { ValidationPipe } from '@nestjs/common';

export const validationPipe = new ValidationPipe({
  whitelist: true, // Strip properties that don't have any decorators
  transform: true, // Transform payloads to DTO instances
  forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
  transformOptions: {
    enableImplicitConversion: true, // Automatically transform payload types
  },
});