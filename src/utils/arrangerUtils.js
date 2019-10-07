import esToSafeJsInt from '@kfarranger/middleware/dist/utils/esToSafeJsInt';
import flatten from 'lodash/flatten';

import { logToFileAndStdOut } from '../debugHelpers';

/**
 * An in-memory cache
 */
class Cache {
  /**
   * Time to live of an item in the cache
   */
  _ttl = 24 * 60 * 60 * 1000; // a day in ms
  _entries = {};

  /**
   * Get an entry from the cache.
   * @param {string} key - the unique identifier of that item
   * @returns {any} the entry matching the `key`, or null if not found.
   */
  get(key) {
    return this._entries[key] || null;
  }

  /**
   * Add an entry to the cache.
   * @param {string} key - the unique identifier of that item.
   * @param {any} entry - the entry to be added to the cache.
   */
  add(key, entry) {
    this._entries[key] = {
      key,
      entry,
      expiry: Date.now() + this._ttl,
    };
    this.clean();
  }

  /**
   * Remove stale entries from the cache
   */
  clean() {
    const now = Date.now();
    this._entries = Object.keys(this._entries).reduce((freshEntries, key) => {
      const entry = this._entries[key];
      if (entry.expiry < now) {
        freshEntries[key] = entry;
      }
      return freshEntries;
    }, {});
  }
}

const _internalCache = new Cache();

/**
 * Get an arranger project's extended configs.
 * @param {object} es - an `elasticsearch.Client` instance.
 * @param {string} projectId - the id of the arranger project.
 * @param {string} indexName - the value of `name` in the arranger project indices. Usually `participant` or `file`.
 * @returns {object} - the arranger project configurations for the given `indexName`.
 */
export const getExtendedConfigs = async (es, projectId, indexName) => {
  console.time('getExtendedConfigs');

  const key = `${es} ${projectId} ${indexName}`;
  let extendedConfigs = _internalCache.get(key);
  if (!extendedConfigs) {
    extendedConfigs = await es
      .search({
        index: `arranger-projects-${projectId}`,
        type: `arranger-projects-${projectId}`,
        q: `name:${indexName}`,
      })
      .then(result => result.hits.hits.map(hit => hit._source))
      .then(sources => sources.map(source => source.config.extended));

    _internalCache.add(key, extendedConfigs);
  }

  if (extendedConfigs.length === 0) {
    throw new Error(
      `Could not find project for "projectId: ${projectId}, indexName: ${indexName}"`,
    );
  }
  if (extendedConfigs.length > 1) {
    console.warn(
      `Found more than one config matching "projectId: ${projectId}, indexName: ${indexName}", picking the first one.`,
    );
  }

  console.timeEnd('getExtendedConfigs');
  return extendedConfigs[0];
};

export const getNestedFields = extendedConfig => {
  return extendedConfig.filter(({ type }) => type === 'nested').map(({ field }) => field);
};

const defaultBoolTransform = value => {
  switch (String(value).toLowerCase()) {
    case 'true':
      return 'Yes';
    case 'false':
      return 'No';
    case 'null':
      return '';
    default:
      return String(value);
  }
};

export const getDefaultTransformPerType = (type, field) => {
  switch (type) {
    case 'boolean':
      return defaultBoolTransform;
    case 'id':
    case 'keyword':
    case 'text':
      return x => (x === null ? '' : String(x));
    case 'float':
    case 'integer':
    case 'long':
      return x => esToSafeJsInt(x);
    // case 'date':
    // case 'nested':
    // case 'object':
    default:
      console.warn(`Unsupported type "${type}" encountered in field "${field}"`);
      return x => x;
  }
};

/**
 * Like `lodash.get`, but supports paths containing arrays.
 * In the case of a path containing one or more array, the results will be flattened.
 * @param {object} source - a row in an ES response
 * @param {String} path - the path to the field
 * @param {String} defaultValue - (optional) the value to be returned if the field is not found or null
 * @returns {any|any[]} a single value, or a flattened array of scalar values if the path contains an array
 */
export const findValueInField = (source, path, defaultValue = null) => {
  const pathSegments = path.split('.');
  const result = pathSegments.reduce((value, segment) => {
    if (Array.isArray(value)) {
      return flatten(value)
        .map(v => v[segment])
        .filter(v => v !== undefined);
    }
    return value && value[segment];
  }, source);
  return result === undefined ? defaultValue : result;
};

/**
 * Return an array of the values of property `path` of `source`,
 * decorated by all the properties of `source`.
 * @param {object} source - any object
 * @param {string} path - the name of a property of `source`
 * @returns {object[]}
 */
export const reduceAndMerge = (source, path) => {
  const pathSegments = path.split('.');
  return deepReduceAndMerge(source, source, pathSegments);
};

const deepReduceAndMerge = (source, currentLevel, segments) => {
  const propName = segments.slice(0, 1);
  const prop = currentLevel[propName];

  if (!Array.isArray(prop)) {
    return [currentLevel];
  }

  return prop.reduce((result, item) => {
    return result.concat(
      deepReduceAndMerge(source, item, segments.slice(1)).map(t => ({
        ...currentLevel,
        [propName]: t,
      })),
    );
  }, []);
};
