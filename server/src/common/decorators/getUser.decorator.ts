import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type {
  AuthenticatedRequest,
  RequestUser,
} from '../types/authenticatedRequest';

export const GetUser = createParamDecorator(
  (propertyName: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    return propertyName ? user[propertyName] : user;
  },
);
