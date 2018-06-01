import { valueFromAST } from 'graphql';

/**
 * @public
 * @function
 * @author Stefan Läufle
 * 
 * Function, which creates a specific data format,
 * which should be used by every route of the REST
 * api.
 * 
 * @param data The data to send to the client
 */
export function sendData(data: any) {
  return {
    data: convertDates(data),
  };
}

/**
 * @private
 * @function
 * @author Stefan Läufle
 * 
 * Converts all date instances in any value
 * to a date number, which represents the millisenconds
 * sind the 01/01/1970.
 * 
 * Function is used convert the response format for
 * the REST api to ensure, that a time instance could
 * be parsed by every client.
 * 
 * That time format is specific for every timezone,
 * language, etc.
 * 
 * @param data The data, that should be parsed
 * @returns The parsed value
 */
function convertDates(data: any): any {
  if (typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) {
    return (data as Date).getTime();
  }

  if (Array.isArray(data)) {
    return data.map(d => convertDates(d));
  }

  Object.keys(data).forEach(k => {
    data[k] = convertDates(data[k]);
  });

  return data;
}
