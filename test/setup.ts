import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});
// @ts-ignore
HTMLCanvasElement.prototype.getContext = (): void => {
  // return whatever getContext has to return
};
