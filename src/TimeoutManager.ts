let timeoutInstance: ReturnType<typeof setTimeout> | null = null;

export class TimeoutManager {
  static set setTimeoutInstance(timeout: ReturnType<typeof setTimeout>) {
    timeoutInstance = timeout;
  }

  static get getTimeoutInstance() {
    return timeoutInstance;
  }
}
