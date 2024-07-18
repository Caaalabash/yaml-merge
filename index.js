'use strict';

const readFileSync = require('fs').readFileSync;
const jsYaml = require('js-yaml');
const glob = require('glob');
const _ = require('lodash');

function readAsJSON(fileName) {
  const fileBuffer = readFileSync(fileName);
  const fileString = fileBuffer.toString();

  return jsYaml.load(fileString);
}

/**
 * Merges the given YAML file names into a single YAML document.
 *
 * @param {...string|object} from - The file paths to read from, followed optionally by an options object.
 * @param {object} [options] - Options for merging behavior.
 * @param {boolean} [options.overwriteArr=false] - Whether to overwrite arrays instead of concatenating them.
 * @returns {string} The output YAML string.
 */
function yamlMerge(...from) {
  const options = typeof from[from.length - 1] === 'object' ? from.pop() : {};
  const files = from
    .reduce((arr, el) => arr.concat(glob.sync(el)), [])
    .map((path) => readAsJSON(path));

  const outputJSON = _.mergeWith({}, ...files, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      if (options.overwriteArr) {
        return srcValue;
      }
      return [...objValue, ...srcValue];
    }

    // handle it just like with _.merge
    return undefined;
  });

  return jsYaml.dump(outputJSON);
}

module.exports = yamlMerge;
