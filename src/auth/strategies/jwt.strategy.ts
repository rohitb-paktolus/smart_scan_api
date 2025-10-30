import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // Using the same hardcoded secret as in auth.module.ts
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Validating payload:', payload);
    
    const user = await this.userRepository.findOne({
      where: { id: payload.sub }
    });

    if (!user) {
      console.log('JWT Strategy - User not found for id:', payload.sub);
      throw new UnauthorizedException('User not found');
    }

    console.log('JWT Strategy - User found:', { id: user.id, email: user.email });
    return user;
  }
}