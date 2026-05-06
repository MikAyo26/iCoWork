import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CorreoService } from './correo.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.resend.com',
          port: 465,
          secure: true,
          auth: {
            user: 'resend',
            pass: config.get<string>('RESEND_API_KEY'),
          },
        },
        defaults: {
          from: config.get<string>('MAIL_FROM', 'iCoWork <onboarding@resend.dev>'),
        },
      }),
    }),
  ],
  providers: [CorreoService],
  exports: [CorreoService],
})
export class CorreoModule {}
