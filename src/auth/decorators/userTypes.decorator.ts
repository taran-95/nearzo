import { SetMetadata } from '@nestjs/common';

export const USER_TYPES_KEY = 'userTypes';

export const UserTypes = (...types: ('shop' | 'user')[]) =>
  SetMetadata(USER_TYPES_KEY, types);
