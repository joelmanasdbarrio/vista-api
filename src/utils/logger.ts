export default class Logger {
  private static labelToString(labels: LogLabels): string {
    return `[${labels.resource}][${labels.layer}][${labels.method}]`;
  }

  static info(message: string, labels: LogLabels = { resource: '', layer: '', method: '' }) {
    console.info(this.labelToString(labels), message);
  }

  static warn(message: string, labels: LogLabels = { resource: '', layer: '', method: '' }) {
    console.warn(this.labelToString(labels), message);
  }

  static error(error: Error, labels: LogLabels) {
    console.error(this.labelToString(labels), error.message);
    if (error.stack) {
      // console.error(error.stack);
    }
  }

  static debug(object: any) {
    console.debug(JSON.stringify(object));
  }
}

interface LogLabels {
  resource: string;
  layer: string;
  method: string;
}

export type { LogLabels };
