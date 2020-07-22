import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

require('jest-fetch-mock').enableMocks();

configure({adapter: new Adapter()});
// @ts-ignore
HTMLCanvasElement.prototype.getContext = (): void => {
  // return whatever getContext has to return
};
