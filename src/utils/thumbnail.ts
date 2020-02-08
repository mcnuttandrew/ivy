import DomToImage from 'dom-to-image';
import {set, get} from 'idb-keyval';
import {NONE_TEMPLATE} from '../constants/index';

// well this is the hackiest file ever
// The thumbnails store lives outside of the redux application in order to prevent the
// redux (also react) application from see that data as much as possible

function saveThumbnailToCache(templateName: string, dataurl: string): void {
  const imgKey = `${templateName}-???!?!??!?!?-image`;
  set(imgKey, dataurl);
  get('image-catalog').then((value: any[] | null) => {
    set('image-catalog', (value || []).concat([imgKey]));
  });
}

function setThumbnail(templateName: string, dataurl: string): void {
  /* eslint-disable @typescript-eslint/ban-ts-ignore*/
  // @ts-ignore
  if (!document.imageStore) {
    // @ts-ignore
    document.imageStore = {};
  }
  // @ts-ignore
  document.imageStore[templateName] = dataurl;
  /* eslint-enable @typescript-eslint/ban-ts-ignore*/
}

export function receiveThumbnail(templateName: string, dataurl: string): void {
  setThumbnail(templateName, dataurl);
  saveThumbnailToCache(templateName, dataurl);
}

export function updateThumbnail(templateName: string): Promise<void> {
  const node = document.querySelector('.chart-container div');
  return DomToImage.toJpeg(node, {quality: 0.1}).then(dataurl => receiveThumbnail(templateName, dataurl));
}

export function retrieveThumbnails(): void {
  /* eslint-disable @typescript-eslint/ban-ts-ignore*/
  // @ts-ignore
  if (!document.imageStore) {
    // @ts-ignore
    document.imageStore = {};
  }
  get('image-catalog').then((value: any[] | null) => {
    (value || []).forEach(imgKey => {
      const templateName = imgKey.split('-???!?!??!?!?-image')[0];
      get(imgKey).then(img => {
        // @ts-ignore
        document.imageStore[templateName] = img;
      });
    });
  });
  /* eslint-enable @typescript-eslint/ban-ts-ignore*/
}

export function thumbnailLocation(templateName: string | null): string {
  if (!templateName) {
    return 'logo.png';
  }
  if (templateName === 'Polestar') {
    return 'assets/polestar-logo.png';
  }
  if (templateName === 'AtomExplore') {
    return 'assets/atom-logo.png';
  }
  if (templateName === NONE_TEMPLATE) {
    return 'assets/chart-gallery-logo.png';
  }
  /* eslint-disable @typescript-eslint/ban-ts-ignore*/
  // @ts-ignore
  return (document.imageStore && document.imageStore[templateName]) || 'logo.png';
  /* eslint-enable @typescript-eslint/ban-ts-ignore*/
}
