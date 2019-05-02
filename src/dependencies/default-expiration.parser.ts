import { DexxStringExpirationParser, DexxTimestampService } from '../dexx-types';
import { DefaultTimestampService } from './default-timestamp.service';

import { dexxConfig, DexxConfig } from '../dexx-config';

export class DefaultExpirationParser implements DexxStringExpirationParser {
  private timestampService: DexxTimestampService;
  private config: DexxConfig;

  constructor(timestampService?: DexxTimestampService, config?: DexxConfig) {
    this.timestampService = timestampService || new DefaultTimestampService();
    this.config = config || dexxConfig;
  }

  public getExpirationTimestamp(expiration: string): number {
    expiration = expiration.trim().toLowerCase();
    if(expiration === 'never') { return 0; }

    const regex = /^(\d+)([smhdwny])$/;
    if (!regex.test(expiration)) {
      throw new Error(this.config.ErrorMessages.InvalidExpirationInput);
    }

    const matches = regex.exec(expiration) || [];
    const delta = parseInt(matches[1], 10);
    const unit = matches[2];

    const dtNow = this.timestampService.getLocalDateTime();
    let nowYear = dtNow.getFullYear();
    let nowMonth = dtNow.getMonth();
    let nowDate = dtNow.getDate();
    let nowHours = dtNow.getHours();
    let nowMinutes = dtNow.getMinutes();
    let nowSeconds = dtNow.getSeconds();
    const nowMillis = dtNow.getMilliseconds();

    switch (unit) {
      case 's':
        nowSeconds += delta;
        break;
      case 'm':
        nowMinutes += delta;
        break;
      case 'h':
        nowHours += delta;
        break;
      case 'd':
        nowDate += delta;
        break;
      case 'w':
        nowDate += delta * 7;
        break;
      case 'n':
        nowMonth += delta;
        break;
      case 'y':
        nowYear += delta;
        break;
    }

    const newDateTime = new Date(nowYear, nowMonth, nowDate, nowHours, nowMinutes, nowSeconds, nowMillis);
    return newDateTime.getTime();
  }

}
