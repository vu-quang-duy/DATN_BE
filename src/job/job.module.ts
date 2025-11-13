import { Module } from '@nestjs/common';
import { CronBackupDatabase } from './cron-backup-db';
import { CronCleanStorage } from './cron-clean-storage';
import { CronUseStatistic } from './cron-use-statistic';

@Module({
  providers: [CronCleanStorage, CronBackupDatabase, CronUseStatistic],
})
export class JobModule {}
