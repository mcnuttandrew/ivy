import React from 'react';
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

interface State {
  searchTerm?: string;
  sortMode: string;
}

export default class DataModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchTerm: null,
      sortMode: 'ALPHA',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event: any): void {
    const {loadCustomDataset, setModalState} = this.props;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event): void => {
      // @ts-ignore
      loadCustomDataset({fileName: file.name, data: event.target.result});
      setModalState(null);
    };

    reader.readAsText(file);
  }
  render(): JSX.Element {
    const {changeSelectedFile, setModalState, chainActions, setEncodingMode} = this.props;
    const {searchTerm, sortMode} = this.state;

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
                onChange={(event): void => {
                  this.setState({searchTerm: event.target.value});
                }}
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
                  onClick={(): any => this.setState({sortMode: d.value})}
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
              console.log(a, b, Number(VegaDatasetMeta[a][sortMode]), Number(VegaDatasetMeta[b][sortMode]));
              return (
                (Number(VegaDatasetMeta[a][sortMode]) || 0) - (Number(VegaDatasetMeta[b][sortMode]) || 0)
              );
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
          <input type="file" onChange={this.handleSubmit} />
        </div>
      </Modal>
    );
  }
}
