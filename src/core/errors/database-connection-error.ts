import { CustomError } from 'core/errors/custom-error';
import { DatabaseConnectionDetails } from 'domain/interfaces/database-connection-details.interface';

class DatabaseConnectionError extends CustomError<DatabaseConnectionDetails> {
  statusCode = 500;
  reason = 'Error connecting to the database';

  constructor (details?: DatabaseConnectionDetails) {
    super('Database connection error', details);
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors () {
    return [{ message: this.message, reason: this.reason, details: this.details }];
  }
}

export { DatabaseConnectionError };
