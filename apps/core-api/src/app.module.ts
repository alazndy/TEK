import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { AuditModule } from './audit/audit.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { AnalysesModule } from './analyses/analyses.module';
import { RenderJobsModule } from './render-jobs/render-jobs.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => [{
          ttl: config.get('THROTTLE_TTL') || 60000,
          limit: config.get('THROTTLE_LIMIT') || 10,
        }],
      }),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    MarketplaceModule,
    AuditModule,
    AnalysesModule,
    RenderJobsModule,
  ],
  controllers: [],
  providers: [
    {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
    },
    {
        provide: APP_GUARD, // Global Roles Guard
        useClass: RolesGuard,
    }
  ],
})
export class AppModule {}
