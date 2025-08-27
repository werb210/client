// Production console filter - suppress development logs in production
if (import.meta.env.PROD) {
  const originalLog = console.log;
  const originalWarn = console.warn;
  
  console.log = (...args: any[]) => {
    // Allow error logs and critical messages
    if (args.some((arg: any) => 
      typeof arg === 'string' && (
        arg.includes('ERROR') || 
        arg.includes('CRITICAL') || 
        arg.includes('FAIL')
      )
    )) {
      originalLog(...args);
    }
  };
  
  console.warn = (...args: any[]) => {
    // Allow warnings about real issues
    if (args.some((arg: any) => 
      typeof arg === 'string' && (
        arg.includes('security') || 
        arg.includes('performance') || 
        arg.includes('deprecated')
      )
    )) {
      originalWarn(...args);
    }
  };
}