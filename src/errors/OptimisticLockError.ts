/**
 * Error thrown when optimistic locking fails
 * This occurs when trying to update a record that has been modified by another user
 */
export class OptimisticLockError extends Error {
  public readonly entityName: string;
  public readonly entityId: number | string;
  public readonly expectedVersion: number;
  public readonly actualVersion: number;

  constructor(
    entityName: string,
    entityId: number | string,
    expectedVersion: number,
    actualVersion: number
  ) {
    super(
      `Optimistic lock failed for ${entityName} with ID ${entityId}. ` +
        `Expected version ${expectedVersion}, but found version ${actualVersion}. ` +
        `The data has been modified by another user. Please refresh and try again.`
    );
    this.name = "OptimisticLockError";
    this.entityName = entityName;
    this.entityId = entityId;
    this.expectedVersion = expectedVersion;
    this.actualVersion = actualVersion;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OptimisticLockError);
    }
  }

  /**
   * Returns a user-friendly error message in Thai
   */
  getUserMessage(): string {
    return `ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณาโหลดข้อมูลใหม่และลองอีกครั้ง`;
  }

  /**
   * Returns error details as JSON
   */
  toJSON() {
    return {
      error: "OPTIMISTIC_LOCK_FAILED",
      message: this.message,
      userMessage: this.getUserMessage(),
      entityName: this.entityName,
      entityId: this.entityId,
      expectedVersion: this.expectedVersion,
      actualVersion: this.actualVersion,
      requiresRefresh: true,
    };
  }
}
