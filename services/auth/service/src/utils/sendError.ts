export function sendError(errors: Error | Error[]) {
  let err: Error | Error[] = errors;

  if (!Array.isArray(err)) {
    err = [err];
  }

  return {
    data: null as any,
    errors: err.map(err => ({ type: err.constructor.name, message: err.message })),
  };

}
