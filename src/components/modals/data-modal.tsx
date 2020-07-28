import React, {useState, useCallback, useEffect} from 'react';
import {TiStar} from 'react-icons/ti';
import {useDropzone} from 'react-dropzone';
import {GenericAction, LoadDataPayload} from '../../actions/index';
import {IgnoreKeys} from 'react-hotkeys';
import VegaDatasetMeta from '../../constants/vega-datasets-counts.json';
import {DataType} from '../../types';
import Modal from './modal';
import {countSymbol} from '../template-card';
import {HoverTooltip} from '../tooltips';
import {classnames} from '../../utils';
import {getFavoriteDatasets, setFavoriteDatasets} from '../../utils/local-storage';

interface Props {
  changeSelectedFile: GenericAction<{filename: string; dumpTemplateMap: boolean}>;
  loadCustomDataset: GenericAction<LoadDataPayload>;
  setModalState: GenericAction<string | null>;
}

export default function DataModal(props: Props): JSX.Element {
  const {changeSelectedFile, loadCustomDataset, setModalState} = props;
  const [searchTerm, setSearchTerm] = useState(null);
  const [sortMode, setSortMode] = useState('FAVORITES');
  const [favs, setFavs] = useState(new Set([]));
  useEffect(() => {
    getFavoriteDatasets().then(x => {
      const entries = x && x.length ? x : ['cars.json', 'penguins.json'];
      setFavs(new Set(entries as string[]));
    });
  }, []);

  const onDrop = useCallback((acceptedFiles: any) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (event): void => {
      loadCustomDataset({fileName: file.name, data: event.target.result as any});
      setModalState(null);
    };

    reader.readAsText(file);
  }, []);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

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
              onChange={(event): any => setSearchTerm(event.target.value.toLowerCase())}
              placeholder="Search for dataset"
            />
          </IgnoreKeys>
        </div>
      </div>
      <div className="flex">
        <span>Sort by:</span>
        <div className="flex">
          {[
            {value: 'FAVORITES', display: 'Favorites'},
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
          .filter(
            key =>
              key.toLowerCase().includes(searchTerm || '') ||
              VegaDatasetMeta[key].columns.some((col: any) => col.toLowerCase().includes(searchTerm || '')),
          )
          .sort((a, b) => {
            if (sortMode === 'ALPHA') {
              return a.localeCompare(b);
            }
            if (sortMode === 'FAVORITES') {
              if ((favs.has(a) && favs.has(b)) || (!favs.has(a) && !favs.has(b))) {
                return a.localeCompare(b);
              }
              if (favs.has(a) && !favs.has(b)) {
                return -1;
              }
              if (favs.has(b) && !favs.has(a)) {
                return 1;
              }
              return 0;
            }
            const aVal = Number(VegaDatasetMeta[a][sortMode]) || 0;
            const bVal = Number(VegaDatasetMeta[b][sortMode]) || 0;
            return aVal - bVal;
          })
          .map(datasetName => {
            const datasetMeta = VegaDatasetMeta[datasetName];
            return (
              <div className="dataset-list-item flex" key={datasetName}>
                <div className="full-height flex center">
                  <div
                    onClick={(): void => {
                      const newSet = new Set(Array.from(favs));
                      favs.has(datasetName) ? newSet.delete(datasetName) : newSet.add(datasetName);
                      setFavs(newSet);
                      setFavoriteDatasets(Array.from(newSet));
                    }}
                    className={classnames({
                      'dataset-list-favorite': true,
                      'dataset-list-favorited': favs.has(datasetName),
                    })}
                  >
                    <TiStar />
                  </div>
                </div>
                <div
                  className="flex-down"
                  onClick={(): any => {
                    changeSelectedFile({filename: datasetName, dumpTemplateMap: true});
                    setModalState(null);
                  }}
                >
                  <div className="flex space-between">
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
                  <div className="flex dataset-list-item-col-names">{datasetMeta.columns.join(', ')}</div>
                </div>
              </div>
            );
          })}
      </div>
      <hr className="full-width" />
      <div className="custom-data" {...getRootProps()}>
        <h3>Upload a Custom Dataset</h3>
        <h5>
          We support JSON, CSV, TSV formatted data. We do not support non-tabular data (such as GeoJSON)
        </h5>
        <input {...getInputProps()} />
        {isDragActive ? (
          <h5>Drop the files here ...</h5>
        ) : (
          <h5>
            <b>Drag and drop</b> some files here, or click to select files
          </h5>
        )}
        {/* <input type="file" onDrop={handleSubmit(true)} onChange={handleSubmit(false)} /> */}
      </div>
    </Modal>
  );
}
