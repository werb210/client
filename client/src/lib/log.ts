export const PROD: boolean = typeof import.meta !== 'undefined'
  ? (import.meta as any).env?.PROD ?? false
  : (process.env.NODE_ENV === 'production');

function noOp(..._args:any[]){}

export const log = {
  debug: PROD ? noOp : (...a:any[]) => console.debug('[D]', ...a),
  info:  PROD ? noOp : (...a:any[]) => console.info('[I]',  ...a),
  warn:  (...a:any[]) => console.warn('[W]', ...a),
  error: (...a:any[]) => console.error('[E]', ...a),
};
export default log;