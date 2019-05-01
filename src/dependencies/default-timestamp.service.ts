import { DexxTimestampService } from '../dexx-types';

export class DefaultTimestampService implements DexxTimestampService {
  public getUtcTimestamp(): number {
    return (this.getLocalDateTime()).getTime();
  }

  public getLocalDateTime(): Date {
    return new Date();
  }
}
