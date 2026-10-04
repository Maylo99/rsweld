/**
 * An error whose message is written for the administrator (Slovak) and may be
 * shown in the UI as-is. Anything else gets a generic message, so internal
 * details (SQL, stack traces) never leak into the admin.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}
