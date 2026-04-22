import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** Minimum level to emit in the current environment. */
const MIN_LEVEL: LogLevel = environment.production ? 'warn' : 'debug';

/**
 * Centralized logging service.
 *
 * Usage:
 * ```ts
 * private readonly _logger = inject(LoggerService);
 *
 * this._logger.debug('MyService', 'Initializing…');
 * this._logger.info('MyService', 'User loaded', user);
 * this._logger.warn('MyService', 'Token about to expire');
 * this._logger.error('MyService', 'Failed to refresh token', err);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly _minRank = LEVEL_RANK[MIN_LEVEL];

  debug(context: string, message: string, ...data: unknown[]): void {
    this._emit('debug', context, message, data);
  }

  info(context: string, message: string, ...data: unknown[]): void {
    this._emit('info', context, message, data);
  }

  warn(context: string, message: string, ...data: unknown[]): void {
    this._emit('warn', context, message, data);
  }

  error(context: string, message: string, ...data: unknown[]): void {
    this._emit('error', context, message, data);
  }

  private _emit(level: LogLevel, context: string, message: string, data: unknown[]): void {
    if (LEVEL_RANK[level] < this._minRank) return;

    const label = `[${context}]`;
    // eslint-disable-next-line no-console
    const fn: (...args: unknown[]) => void = console[level] ?? console.log;

    if (data.length) {
      fn(label, message, ...data);
    } else {
      fn(label, message);
    }
  }
}
