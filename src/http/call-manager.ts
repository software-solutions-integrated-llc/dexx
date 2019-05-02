import { DefaultTimestampService } from '../dependencies/default-timestamp.service';
import { InMemoryRepository } from '../dependencies/in-memory-repository';
import { dexxConfig, DexxConfig } from '../dexx-config';
import { DexxTimestampService } from '../dexx-types';

export class CallManager {
  private timestampService: DexxTimestampService;
  private repository: InMemoryRepository<CallInfo>;
  private config: DexxConfig;

  constructor(timestampService?: DexxTimestampService,
              repository?: InMemoryRepository<CallInfo>,
              config?: DexxConfig) {
    this.timestampService = timestampService || new DefaultTimestampService();
    this.repository = repository || new InMemoryRepository<CallInfo>();
    this.config = config || dexxConfig;
  }

  public hasProcess(processId: string): boolean {
    return this.repository.hasKey(processId);
  }

  public registerProcess(processId: string): void {
    this.repository.add(processId, {
      ...this.config.CallManagerDefaultInfo, processId
    });
  }

  public followProcess(processId: string): Promise<any> {
    if (!this.repository.hasKey(processId)) {
      return Promise.reject(new Error(this.config.ErrorMessages.CallManagerNoProcess));
    }

    return new Promise<any>((resolve, reject) => {
      const interval = setInterval(() => {
        const callInfo = this.repository.get(processId) as CallInfo;
        if (!callInfo.complete) { return; }
        callInfo.errorOccurred ? reject() : resolve(callInfo.data);
        clearInterval(interval);
      }, this.config.CallManagerPollingTime);
    });
  }

  public endProcess(processId: string, data: any, errorOccurred = false): void {
    const validUntil = this.timestampService.getUtcTimestamp() + this.config.CallManagerTimeout;
    this.repository.add(processId, {
       processId, data, validUntil, complete: true, errorOccurred
    });
  }

  public removeExpired(): void {
    const keyList: string[] = [];

    const now = this.timestampService.getUtcTimestamp();
    this.repository.getKeys().forEach(key => {
      const info = this.repository.get(key) as CallInfo;
      if (info.validUntil > 0 && info.validUntil < now) { keyList.push(key); }
    });

    keyList.forEach(key => {
      this.repository.remove(key);
    });
  }
}

export interface CallInfo {
  processId: string;
  complete: boolean;
  errorOccurred: boolean;
  data: any;
  validUntil: number;
}
