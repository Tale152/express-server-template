import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { validateRequestBody } from '../../../../src/setup/middleware/classValidation';

// Mock class-validator and class-transformer
jest.mock('class-validator');
jest.mock('class-transformer');

class TestDTO {
  name!: string;
  email!: string;
}

describe('classValidation middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockValidate: jest.MockedFunction<typeof validate>;
  let mockPlainToClass: jest.MockedFunction<typeof plainToClass>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      body: { name: 'Test', email: 'test@example.com' }
    };
    
    mockResponse = {};
    
    mockNext = jest.fn();

    mockValidate = validate as jest.MockedFunction<typeof validate>;
    mockPlainToClass = plainToClass as jest.MockedFunction<typeof plainToClass>;
  });

  describe('validateRequestBody', () => {
    it('should pass validation with no errors', async () => {
      const dtoInstance = new TestDTO();
      mockPlainToClass.mockReturnValue(dtoInstance);
      mockValidate.mockResolvedValue([]);

      const middleware = validateRequestBody(TestDTO);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidate).toHaveBeenCalledWith(dtoInstance, {
        skipMissingProperties: false,
        whitelist: false,
        forbidNonWhitelisted: false
      });
      expect(mockRequest.body).toBe(dtoInstance);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw AppError when validation fails', async () => {
      const dtoInstance = new TestDTO();
      const validationErrors = [
        {
          property: 'name',
          constraints: {
            isNotEmpty: 'name should not be empty',
            isString: 'name must be a string'
          }
        },
        {
          property: 'email',
          constraints: {
            isEmail: 'email must be an email'
          }
        }
      ];

      mockPlainToClass.mockReturnValue(dtoInstance);
      mockValidate.mockResolvedValue(validationErrors as never[]);

      const middleware = validateRequestBody(TestDTO);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed: name should not be empty, name must be a string; email must be an email',
          statusCode: 400
        })
      );
    });

    it('should handle validation errors without constraints', async () => {
      const dtoInstance = new TestDTO();
      const validationErrors = [
        {
          property: 'name',
          constraints: undefined
        }
      ];

      mockPlainToClass.mockReturnValue(dtoInstance);
      mockValidate.mockResolvedValue(validationErrors as never[]);

      const middleware = validateRequestBody(TestDTO);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed: Validation error',
          statusCode: 400
        })
      );
    });

    it('should handle unexpected errors during validation', async () => {
      const dtoInstance = new TestDTO();
      const unexpectedError = new Error('Unexpected validation error');

      mockPlainToClass.mockReturnValue(dtoInstance);
      mockValidate.mockRejectedValue(unexpectedError);

      const middleware = validateRequestBody(TestDTO);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });

    it('should handle transformation errors', async () => {
      const transformError = new Error('Transform error');
      
      mockPlainToClass.mockImplementation(() => {
        throw transformError;
      });

      const middleware = validateRequestBody(TestDTO);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(transformError);
    });
  });
});
