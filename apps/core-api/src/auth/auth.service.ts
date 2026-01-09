import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AuditService } from "../audit/audit.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(payload: any): Promise<any> {
    // In real implementation, check DB
    // For now, return payload
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.userId,
      roles: user.roles || [],
    };

    this.auditService.log({
      action: "USER_LOGIN",
      resource: "auth",
      userId: user.userId,
      userEmail: user.username,
      status: "SUCCESS",
      details: { roles: user.roles },
    });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
