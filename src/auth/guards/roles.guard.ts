import {
  Injectable, CanActivate, ExecutionContext,
  UnauthorizedException, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../decorators/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const userRoles: string[] = Array.isArray(user?.roles)
      ? user.roles
      : (user?.role ? [user.role] : []);

    if (userRoles.length === 0) {
      throw new ForbiddenException('No roles assigned');
    }

    // Super admin barcha amallarga ruxsatga ega
    if (userRoles.includes(Role.SuperAdmin)) return true;

    if (userRoles.includes(Role.Admin)) return true;

    const allowed = required.some(r => userRoles.includes(r));
    if (!allowed) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}