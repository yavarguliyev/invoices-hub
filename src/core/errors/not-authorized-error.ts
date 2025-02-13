import { CustomError } from 'core/errors/custom-error';
import { NotAuthorizedDetails } from 'domain/interfaces/not-authorized-details.interface';

class NotAuthorizedError extends CustomError<NotAuthorizedDetails> {
  statusCode = 401;
  reason = 'User not authorized';

  constructor (details?: NotAuthorizedDetails) {
    super('Not authorized!', details);
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors () {
    return [{ message: this.message, reason: this.reason, details: this.details }];
  }
}

export { NotAuthorizedError };
