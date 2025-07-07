import type { Context } from 'hono'
import { createLogger, format as _format, transports as _transports } from 'winston'
import LokiTransport from 'winston-loki'

class Logger {
  private baseTransports: any[];
  private format: any;

  constructor() {
    const date = new Date();
    const folder = date.toISOString().split('T')[0];
    this.format = _format.combine(
      _format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      _format.printf(({ level, message, timestamp, labels }) => {
        return `${timestamp} - ${level}: ${message}`;
      })
    );
    this.baseTransports = [
      new _transports.Console({ format: this.format }),
      new _transports.File({ filename: `./logs/${folder}/common.log`, format: this.format }),
      new _transports.File({ filename: `./logs/${folder}/debug.log`, format: this.format, level: 'debug' })
    ];
  }

  private getLoggerWithContext(c: Context) {
    const env = c.env as Record<string, string | undefined>;
    const transports = [...this.baseTransports];
    if (env.GRAFANA_ENABLED === 'true') {
      transports.push(
        new (LokiTransport as any)({
          host: env.GRAFANA_HOST || '',
          basicAuth: env.GRAFANA_AUTH || '',
          json: true,
          format: _format.json(),
          level: 'debug',
        })
      );
    }
    return createLogger({ transports });
  }

  info(c: Context, message: string, labels: LogLabels) {
    const env = c.env as Record<string, string | undefined>;
    const logger = this.getLoggerWithContext(c);
    logger.info({
      message,
      labels: {
        host: env.GRAFANA_LABELS_HOSTNAME,
        ...labels
      }
    });
  }

  error(c: Context, error: Error, labels: LogLabels) {
    const env = c.env as Record<string, string | undefined>;
    const logger = this.getLoggerWithContext(c);
    logger.error({
      message: error.message,
      labels: {
        host: env.GRAFANA_LABELS_HOSTNAME,
        ...labels
      }
    });
  }

  debug(c: Context, object: any) {
    const logger = this.getLoggerWithContext(c);
    logger.debug(JSON.stringify(object));
  }
}

interface LogLabels {
  resource: string;
  layer: string;
  method: string;
}

const logger = new Logger();
export default logger;
export type { LogLabels };
