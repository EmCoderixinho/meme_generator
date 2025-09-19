import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemeModule } from './meme/meme.module';
import { Config } from './config/config.entity';
import { ConfigurationModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: 'mysql_db',
        port: 3306,
        username: 'root',
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: 'meme_creator_db',
        entities: [Config],
        synchronize: true,
      }),
    }),
    MemeModule,
    ConfigurationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}