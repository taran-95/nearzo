import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { USER_TYPES_KEY } from '../decorators/userTypes.decorator.js';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const allowedTypes = this.reflector.getAllAndOverride< ('shop' | 'user')[] >(USER_TYPES_KEY, [ 
        context.getHandler(), 
        context.getClass(),
    ]);

    if (!allowedTypes) { 
        return true; 
    }

    const request = context.switchToHttp().getRequest<Request>();

    const userType = request.session.userType;

    if (!userType || !allowedTypes.includes(userType)) { 
        throw new ForbiddenException('You do not have permission to access this resource'); 
    }
    return true;
  }
}
