import React from 'react';
import {GenericAction} from '../actions/index';
// import VegaDataPreAlias from 'vega-datasets';
// const VegaData: {[key: string]: any} = VegaDataPreAlias;
import VegaDatasetMeta from '../constants/vega-datasets-counts';
import {getTypeSymbol} from '../utils';
import {DataType} from '../types';
import Modal from './modal';

interface Props {
  changeSelectedFile: GenericAction;
  chainActions: GenericAction;
  loadCustomDataset: GenericAction;
  toggleDataModal: GenericAction;
}

interface State {
  searchTerm?: string;
}

// TODO add a switch for internet vs local development
export default class DataModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchTerm: null,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event: any) {
    const {loadCustomDataset, toggleDataModal} = this.props;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = event => {
      loadCustomDataset({fileName: file.name, data: event.target.result});
      toggleDataModal();
    };

    reader.readAsText(file);
  }
  render() {
    const {changeSelectedFile, toggleDataModal, chainActions} = this.props;
    const {searchTerm} = this.state;

    return (
      <Modal
        modalToggle={toggleDataModal}
        className="data-modal"
        modalTitle="Select Dataset"
        bodyDirectionDown={true}
        modalDetails="Users will create more effective charts (i.e. answer the base
        questions more clearly) when they are asked any type of questions
        (Placebo and Experiment). Users will be more confi- dent in their
        final charts, but more distrustful of their initial data in
        Placebo and Experiment."
      >
        <div className="flex space-between">
          <h3>Predefined Datasets</h3>
          <div>
            <input
              value={searchTerm || ''}
              onChange={event => {
                this.setState({searchTerm: event.target.value});
              }}
              placeholder="Search for dataset"
            />
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
                  onClick={() =>
                    chainActions([
                      () => changeSelectedFile(datasetName),
                      () => toggleDataModal(),
                    ])
                  }
                  className="flex dataset-list-item space-between"
                  key={datasetName}
                >
                  <div className="flex">
                    <h5>{datasetName}</h5>
                  </div>
                  <div className="flex">
                    <div className="icon-container">
                      {datasetMeta.length} rows
                    </div>
                    {['MEASURE', 'DIMENSION', 'TIME'].map(
                      (dataType: DataType) => {
                        return (
                          <div
                            key={`${datasetName}-${dataType}`}
                            className="flex icon-container"
                          >
                            <div className="icon">
                              {getTypeSymbol(dataType)}
                            </div>
                            {datasetMeta[dataType] || 0}
                          </div>
                        );
                      },
                    )}
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
    //
    // return (
    //   <div className="modal-container">
    //     <div className="modal-background" onClick={toggleDataModal} />
    //     <div className="flex-down data-modal">
    //       <div className="modal-header">
    //         <h2>Select Dataset</h2>
    //         <p>
    //           Users will create more effective charts (i.e. answer the base
    //           questions more clearly) when they are asked any type of questions
    //           (Placebo and Experiment). Users will be more confi- dent in their
    //           final charts, but more distrustful of their initial data in
    //           Placebo and Experiment.
    //         </p>
    //       </div>
    //       <div className="modal-body flex-down">
    //         <div className="flex space-between">
    //           <h3>Predefined Datasets</h3>
    //           <div>
    //             <input
    //               value={searchTerm || ''}
    //               onChange={event => {
    //                 this.setState({searchTerm: event.target.value});
    //               }}
    //               placeholder="Search for dataset"
    //             />
    //           </div>
    //         </div>
    //         <div className="dataset-list">
    //           {Object.keys(VegaDatasetMeta)
    //             .filter((key: string) => {
    //               return key.includes(searchTerm || '');
    //             })
    //             .sort()
    //             .map(datasetName => {
    //               const datasetMeta = VegaDatasetMeta[datasetName];
    //               return (
    //                 <div
    //                   onClick={() =>
    //                     chainActions([
    //                       () => changeSelectedFile(datasetName),
    //                       () => toggleDataModal(),
    //                     ])
    //                   }
    //                   className="flex dataset-list-item space-between"
    //                   key={datasetName}
    //                 >
    //                   <div className="flex">
    //                     <h5>{datasetName}</h5>
    //                   </div>
    //                   <div className="flex">
    //                     <div className="icon-container">
    //                       {datasetMeta.length} rows
    //                     </div>
    //                     {['MEASURE', 'DIMENSION', 'TIME'].map(
    //                       (dataType: DataType) => {
    //                         return (
    //                           <div
    //                             key={`${datasetName}-${dataType}`}
    //                             className="flex icon-container"
    //                           >
    //                             <div className="icon">
    //                               {getTypeSymbol(dataType)}
    //                             </div>
    //                             {datasetMeta[dataType] || 0}
    //                           </div>
    //                         );
    //                       },
    //                     )}
    //                   </div>
    //                 </div>
    //               );
    //             })}
    //         </div>
    //         <div className="custom-data">
    //           <h3>Upload a Custom Dataset</h3>
    //           <h5>We support JSON and CSV formatted data</h5>
    //           <input type="file" onChange={this.handleSubmit} />
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // );
  }
}
