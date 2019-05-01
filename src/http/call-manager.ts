import { DefaultTimestampService, DexxTimestampService } from '..';
import { InMemoryRepository } from '../dependencies/in-memory-repository';

export class CallManager {
  public static readonly DefaultCallInfo: CallInfo = {
    processId: '', complete: false, errorOccurred: false, data: null, validUntil: 0
  };
  public static readonly NoProcessError = 'No process was found with the given ID';
  public static readonly Timeout = 1000;
  public static readonly processPollingTime = 50;
  private timestampService: DexxTimestampService;
  private repository: InMemoryRepository<CallInfo>;

  constructor(timestampService?: DexxTimestampService, repository?: InMemoryRepository<CallInfo>) {
    this.timestampService = timestampService || new DefaultTimestampService();
    this.repository = repository || new InMemoryRepository<CallInfo>();
  }

  public hasProcess(processId: string): boolean {
    return this.repository.hasKey(processId);
  }

  public registerProcess(processId: string): void {
    this.repository.add(processId, {
      ...CallManager.DefaultCallInfo, processId
    });
  }

  public followProcess(processId: string): Promise<any> {
    if (!this.repository.hasKey(processId)) {
      return Promise.reject(new Error(CallManager.NoProcessError));
    }

    return new Promise<any>((resolve, reject) => {
      const interval = setInterval(() => {
        const callInfo = this.repository.get(processId) as CallInfo;
        if (!callInfo.complete) { return; }
        callInfo.errorOccurred ? reject() : resolve(callInfo.data);
        clearInterval(interval);
      }, CallManager.processPollingTime);
    });
  }

  public endProcess(processId: string, data: any, errorOccurred = false): void {
    const validUntil = this.timestampService.getUtcTimestamp() + CallManager.Timeout;
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
