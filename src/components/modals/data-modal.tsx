import React from 'react';
import {GenericAction, LoadDataPayload} from '../../actions/index';
import {IgnoreKeys} from 'react-hotkeys';
import VegaDatasetMeta from '../../constants/vega-datasets-counts';
import NONE from '../../templates/example-templates/none';
import DataSymbol from '../data-symbol';
import {DataType} from '../../templates/types';
import Modal from './modal';

interface Props {
  changeSelectedFile: GenericAction<string>;
  chainActions: GenericAction<any>;
  loadCustomDataset: GenericAction<LoadDataPayload>;
  toggleDataModal: GenericAction<void>;
  setEncodingMode?: GenericAction<string>;
}

interface State {
  searchTerm?: string;
}

export default class DataModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchTerm: null,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event: any): void {
    const {loadCustomDataset, toggleDataModal} = this.props;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event): void => {
      /* eslint-disable @typescript-eslint/ban-ts-ignore*/
      // @ts-ignore
      loadCustomDataset({fileName: file.name, data: event.target.result});
      /* eslint-enable @typescript-eslint/ban-ts-ignore*/
      toggleDataModal();
    };

    reader.readAsText(file);
  }
  render(): JSX.Element {
    const {changeSelectedFile, toggleDataModal, chainActions, setEncodingMode} = this.props;
    const {searchTerm} = this.state;

    return (
      <Modal
        modalToggle={toggleDataModal}
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

        <div className="dataset-list">
          {Object.keys(VegaDatasetMeta)
            .filter((key: string) => {
              return key.includes(searchTerm || '');
            })
            .sort()
            .map(datasetName => {
              const datasetMeta = VegaDatasetMeta[datasetName];
              return (
                <div
                  onClick={(): any =>
                    chainActions([
                      (): any => changeSelectedFile(datasetName),
                      (): any => toggleDataModal(),
                      (): any => setEncodingMode(NONE.templateName),
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
                    {['MEASURE', 'DIMENSION', 'TIME'].map((dataType: DataType) => {
                      return (
                        <div key={`${datasetName}-${dataType}`} className="flex icon-container">
                          <div className="icon">
                            <DataSymbol type={dataType} />
                          </div>
                          {datasetMeta[dataType] || 0}
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
          <h5>We support JSON and CSV formatted data</h5>
          <input type="file" onChange={this.handleSubmit} />
        </div>
      </Modal>
    );
  }
}
