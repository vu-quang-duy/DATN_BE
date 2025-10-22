import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ENV } from 'src/config/environment';
import { User } from 'src/entities/user/user.entity';
import { UserHelper } from 'src/helper/user-helper.service';
import { winstonLogger } from 'src/logger';

@Injectable()
export class CronUseStatistic {
  cronUserStatistic = async () => {
    try {
      console.log('🚀  ~ CronUserStatistic start');

      const users = await User.find();

      await Promise.all(
        users.map(async (user) => {
          return UserHelper.handleUserStatistic(user.userId);
        }),
      );
      console.log('🚀  ~ CronUserStatistic success');
    } catch (error: any) {
      winstonLogger.error(error);
    }
  };

  @Cron(CronExpression.EVERY_10_SECONDS, { timeZone: ENV.TIME_ZONE })
  async updateUseStatistic() {
    await this.cronUserStatistic();
  }
}
