import { getExtendedConfigs } from './arrangerUtils';
import { getDefaultTransformPerType } from './esUtils';

/**
 * Decorates the raw reports configs with default values, values from arranger's project, etc...
 * @param {object} es - an `elasticsearch.Client` instance
 * @param {string} projectId - the id of the arranger project
 * @param {object} reportConfigs - the raw report configurations
 * @returns {ReportConfigs}
 */
export const normalizeConfigs = async (es, projectId, reportConfigs) => {
  return await Promise.all(
    reportConfigs.sheetConfigs.map(async sheetConfigs => {
      const extendedConfigs = await getExtendedConfigs(
        es,
        projectId,
        reportConfigs.queryConfigs.indexName,
      );
      return new ReportSheetConfigs(sheetConfigs, extendedConfigs);
    }),
  ).then(sheets => new ReportConfigs(reportConfigs, sheets));
};

class ReportConfigs {
  constructor(reportConfigs, sheets) {
    this._query = reportConfigs.queryConfigs;
    this._sheets = sheets;
  }

  /**
   * The configuration of each sheet of the report
   * @returns {Array<ReportSheetConfigs>} - an array of `ReportSheetConfigs`
   */
  get sheets() {
    return this._sheets;
  }

  /**
   * @returns {string} the 'name' field in the arranger project document
   */
  get indexName() {
    return this._query.indexName;
  }

  /**
   * @returns {string} the alias of the indices containing relevant data
   */
  get alias() {
    return this._query.alias;
  }
}

class ReportSheetConfigs {
  constructor(sheetConfigs, extendedConfigs) {
    this._sheetConfigs = sheetConfigs;
    this._normalizedColumns = [];
    this.initialize(extendedConfigs);
  }

  initialize(extendedConfigs) {
    this._normalizedColumns = this._sheetConfigs.columns
      .map(rawColumn => {
        const extendedFieldInfo = extendedConfigs.find(ec => rawColumn.field === ec.field);
        if (!extendedFieldInfo) {
          console.warn(
            `Missing extended field information for field "${rawColumn.field}" in sheet configs "${this.sheetName}", the field will be excluded.`,
          );
          return null;
        }

        return new ReportColumnConfigs(rawColumn, extendedFieldInfo);
      })
      .filter(col => col !== null);
  }

  /**
   * @returns {string} the 'name' field in the arranger project document
   */
  get indexName() {
    throw new Error('"indexName" has been moved');
  }

  /**
   * @returns {string} the alias of the indices containing relevant data
   */
  get alias() {
    throw new Error('"alias" has been moved');
  }

  /**
   * @returns {string} The display name of the worksheet in the report
   */
  get sheetName() {
    return this._sheetConfigs.sheetName;
  }

  /**
   * @returns {string} One line per entry in this field will end up as individual lines in the report.
   * @example Given `participant.phenotype` being a nested field, `root: 'phenotype'`
   * will put each phenotype on a separate line and duplicate the fields not under `phenotype`.
   */
  get root() {
    return this._sheetConfigs.root;
  }

  /**
   * @returns {Array<object>} the sort to be passed in the ES query, e.g. `[{ kf_id: 'asc' }]`
   */
  get sort() {
    return this._sheetConfigs.sort;
  }

  /**
   * @returns {Array<ReportColumnConfigs>}
   */
  get columns() {
    return this._normalizedColumns;
  }
}

class ReportColumnConfigs {
  constructor(rawColumn, extendedFieldInfo) {
    this._rawColumn = rawColumn;
    this._extendedFieldInfo = extendedFieldInfo;
  }

  static _defaultHeader = '';

  get field() {
    return this._rawColumn.field;
  }

  /**
   * @returns {[]}
   */
  get additionalFields() {
    return this._rawColumn.additionalFields || [];
  }

  // Display value in the header of this column
  get header() {
    return (
      this._rawColumn.header ||
      this._extendedFieldInfo.displayName ||
      ReportColumnConfigs._defaultHeader
    );
  }

  // The `type` of the field in qraphql
  get type() {
    return this._extendedFieldInfo.type;
  }

  // Transform value that every value will go through
  transform(value, row) {
    const transform =
      this._rawColumn.transform || getDefaultTransformPerType(this.type, this.field);
    return transform(value, row);
  }
}
