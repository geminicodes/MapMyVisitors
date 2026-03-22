export type LogMeta = Record<string, unknown>;

function shouldLogDebug(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function safeMeta(meta?: LogMeta): LogMeta | undefined {
  if (!meta) return undefined;
  // Never log huge objects by accident.
  const keys = Object.keys(meta);
  if (keys.length > 50) {
    return { metaKeys: keys.slice(0, 50), metaKeysTruncated: true };
  }
  return meta;
}

export const logger = {
  debug(message: string, meta?: LogMeta) {
    if (!shouldLogDebug()) return;
    // eslint-disable-next-line no-console
    console.debug(message, safeMeta(meta));
  },
  info(message: string, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    console.info(message, safeMeta(meta));
  },
  warn(message: string, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    console.warn(message, safeMeta(meta));
  },
  error(message: string, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    console.error(message, safeMeta(meta));
  },
};

