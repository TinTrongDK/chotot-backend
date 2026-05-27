import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ header Authorization theo chuẩn Bearer
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      secretOrKey: 'SECRET_KEY_CUA_TIN_2026',
    });
  }

  // Hàm này sẽ tự động chạy nếu Token hợp lệ. Nó giải mã payload và nhét vào request
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, roleId: payload.roleId };
  }
}
