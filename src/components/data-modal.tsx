import React from 'react';
import {GenericAction} from '../actions/index';
// import VegaDataPreAlias from 'vega-datasets';
// const VegaData: {[key: string]: any} = VegaDataPreAlias;
import VegaDatasetMeta from '../constants/vega-datasets-counts';
import {getTypeSymbol} from '../utils';
import {DataType} from '../types';

interface DataModalProps {
  toggleDataModal: GenericAction;
  changeSelectedFile: GenericAction;
  chainActions: GenericAction;
}

// TODO add a switch for internet vs local development

export default function DataModal(props: DataModalProps) {
  const {changeSelectedFile, toggleDataModal, chainActions} = props;

  return (
    <div className="modal-container">
      <div className="modal-background" onClick={toggleDataModal} />
      <div className="flex-down data-modal">
        <div className="modal-header">
          <h2>Change Dataset</h2>
        </div>
        <div className="modal-body flex-down">
          <h3>Select A Predefined Dataset</h3>
          <div className="dataset-list">
            {Object.keys(VegaDatasetMeta).map(datasetName => {
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
            <h3> Upload a Custom Dataset</h3>
            <input
              type="file"
              onChange={d => {
                console.log('no yet implemented');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
