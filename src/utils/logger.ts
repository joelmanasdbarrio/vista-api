const labelToString = (labels: LogLabels): string => {
  return `[${labels.resource}][${labels.layer}][${labels.method}]`
}

const Logger = {
  info (message: string, labels: LogLabels = { resource: '', layer: '', method: '' }) {
    console.info(labelToString(labels), message)
  },

  warn (message: string, labels: LogLabels = { resource: '', layer: '', method: '' }) {
    console.warn(labelToString(labels), message)
  },

  error (error: Error, labels: LogLabels) {
    console.error(labelToString(labels), error.message)
    if (error.stack) {
      // console.error(error.stack);
    }
  },

  debug (object: any) {
    console.debug(JSON.stringify(object))
  }
}

export default Logger

interface LogLabels {
  resource: string
  layer: string
  method: string
}

export type { LogLabels }
