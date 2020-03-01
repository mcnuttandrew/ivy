import Vega from './vega';
import VegaLite from './vega-lite';
import UnitVis from './unit-vis';
import DataTable from './data-table';

const DEFAULT_LANGUAGES = {
  [VegaLite.language]: VegaLite,
  [Vega.language]: Vega,
  [UnitVis.language]: UnitVis,
  [DataTable.language]: DataTable,
};

export default DEFAULT_LANGUAGES;
