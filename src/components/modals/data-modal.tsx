import React, {useState} from 'react';
import {GenericAction, LoadDataPayload} from '../../actions/index';
import {IgnoreKeys} from 'react-hotkeys';
import VegaDatasetMeta from '../../constants/vega-datasets-counts';
import GALLERY from '../../templates/gallery';
import {DataType} from '../../types';
import Modal from './modal';
import {countSymbol} from '../program-preview';
import {HoverTooltip} from '../tooltips';
import {classnames} from '../../utils';

interface Props {
  changeSelectedFile: GenericAction<string>;
  chainActions: GenericAction<any>;
  loadCustomDataset: GenericAction<LoadDataPayload>;
  setModalState: GenericAction<string | null>;
  setEncodingMode?: GenericAction<string>;
}

export default function DataModal(props: Props): JSX.Element {
  const {changeSelectedFile, chainActions, setEncodingMode, loadCustomDataset, setModalState} = props;
  const [searchTerm, setSearchTerm] = useState(null);
  const [sortMode, setSortMode] = useState('ALPHA');

  const handleSubmit = (useData: boolean) => (d: any): void => {
    const file = useData ? d.dataTransfer.items[0].getAsFile() : d.target.files[0];
    const reader = new FileReader();
    reader.onload = (event): void => {
      loadCustomDataset({fileName: file.name, data: event.target.result as any});
      setModalState(null);
    };

    reader.readAsText(file);
  };

  return (
    <Modal
      modalToggle={(): any => setModalState(null)}
      className="data-modal"
      modalTitle="Select Dataset"
      bodyDirectionDown={true}
    >
      <div className="flex space-between">
        <h3>Predefined Datasets</h3>
        <div>
          <IgnoreKeys style={{height: '100%'}}>
            <input
              type="text"
              value={searchTerm || ''}
              onChange={(event): any => setSearchTerm(event.target.value)}
              placeholder="Search for dataset"
            />
          </IgnoreKeys>
        </div>
      </div>
      <div className="flex">
        <span>Sort by:</span>
        <div className="flex">
          {[
            {value: 'ALPHA', display: 'Alphabetically'},
            {value: 'length', display: 'Dataset Size'},
            {value: 'DIMENSION', display: 'Dimensions'},
            {value: 'MEASURE', display: 'Measures'},
            {value: 'TIME', display: 'Times'},
          ].map((d, idx) => {
            return (
              <button
                className={classnames({
                  selected: d.value === sortMode,
                  flex: true,
                  center: true,
                })}
                type="button"
                key={d.value}
                onClick={(): any => setSortMode(d.value)}
              >
                {idx >= 2 && countSymbol(d.value)}
                {d.display}
              </button>
            );
          })}
        </div>
      </div>
      <div className="dataset-list">
        {Object.keys(VegaDatasetMeta)
          .filter(key => key.includes(searchTerm || ''))
          .sort((a, b) => {
            if (sortMode === 'ALPHA') {
              return a.localeCompare(b);
            }
            const aVal = Number(VegaDatasetMeta[a][sortMode]) || 0;
            const bVal = Number(VegaDatasetMeta[b][sortMode]) || 0;
            return aVal - bVal;
          })
          .map(datasetName => {
            const datasetMeta = VegaDatasetMeta[datasetName];
            return (
              <div
                onClick={(): any =>
                  chainActions([
                    (): any => changeSelectedFile(datasetName),
                    (): any => setModalState(null),
                    (): any => setEncodingMode(GALLERY.templateName),
                  ])
                }
                className="flex dataset-list-item space-between"
                key={datasetName}
              >
                <div className="flex">
                  <h5>{datasetName}</h5>
                </div>
                <div className="flex">
                  <div className="icon-container">{datasetMeta.length} rows</div>
                  {['DIMENSION', 'MEASURE', 'TIME'].map((dataType: DataType) => {
                    const count = datasetMeta[dataType] || 0;
                    return (
                      <div key={`${datasetName}-${dataType}`} className="flex icon-container">
                        <HoverTooltip
                          message={`This data set has ${count} data columns with inferred type ${dataType}`}
                        >
                          {countSymbol(dataType)}
                        </HoverTooltip>
                        {count}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
      <div className="custom-data">
        <h3>Upload a Custom Dataset</h3>
        <h5>
          We support JSON, CSV, TSV formatted data. We do not support non-tabular data (such as GeoJSON)
        </h5>
        <input type="file" onDrop={handleSubmit(true)} onChange={handleSubmit(false)} />
      </div>
    </Modal>
  );
}
