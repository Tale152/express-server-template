const extraSpaces: string = '\t  \t';

/**
 * Adds spaces and tabs both at the beginning and at the end
 * of the provided string
 * @param {string} str the string to add extra spaces to
 * @return {string} the newly created string with extra spaces
 */
export function addExtraSpaces(str: string): string {
  return extraSpaces + str + extraSpaces;
}
