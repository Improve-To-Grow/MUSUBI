/**
 * `musubi-validate guardrails`: options that say what the checked content is
 *
 * The constitution applies per artifact type, so --constitutional needs --content-type
 * (code | test | requirements | design); --file gives the content's path.
 */

const { CONTENT_TYPES } = require('../orchestration/guardrails');

/**
 * Why --content-type is missing or unknown for a constitutional check, or null
 * @param {string|undefined} contentType - Value of --content-type
 * @returns {string|null}
 */
function contentTypeOptionError(contentType) {
  const types = CONTENT_TYPES.join(', ');
  if (!contentType) {
    return `--constitutional needs --content-type (${types}): the constitution applies per artifact type`;
  }
  if (!CONTENT_TYPES.includes(contentType)) {
    return `Unknown content type '${contentType}': use ${types}`;
  }
  return null;
}

/**
 * Guardrail context from the command options; prints the error and exits with code 1 when
 * --constitutional lacks a valid --content-type
 * @param {Object} options - Command options (type, constitutional, contentType, file)
 * @param {Object} chalk - chalk instance for the error message
 * @returns {Object} { contentType?, filePath? }
 */
function guardrailRunContextOrExit(options, chalk) {
  if (options.type.toLowerCase() === 'safety' && options.constitutional) {
    const error = contentTypeOptionError(options.contentType);
    if (error) {
      console.error(chalk.red(`✗ ${error}`));
      process.exit(1);
    }
  }
  return {
    ...(options.contentType ? { contentType: options.contentType } : {}),
    ...(options.file ? { filePath: options.file } : {}),
  };
}

module.exports = { CONTENT_TYPES, contentTypeOptionError, guardrailRunContextOrExit };
