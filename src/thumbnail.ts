import DomToImage from 'dom-to-image';
import {set, get} from 'idb-keyval';

// well this is the hackiest file ever
// The thumbnails store lives outside of the redux application in order to prevent the
// redux (also react) application from see that data as much as possible

export function updateThumbnail(templateName: string): Promise<void> {
  const node = document.querySelector('.chart-container div');
  return new Promise(resolve => {
    DomToImage.toJpeg(node, {quality: 0.3}).then(dataurl => {
      /* eslint-disable @typescript-eslint/ban-ts-ignore*/
      // @ts-ignore
      if (!document.imageStore) {
        // @ts-ignore
        document.imageStore = {};
      }
      // @ts-ignore
      document.imageStore[templateName] = dataurl;

      /* eslint-enable @typescript-eslint/ban-ts-ignore*/
      const imgKey = `${templateName}-???!?!??!?!?-image`;
      resolve();
      set(imgKey, dataurl);
      get('image-catalog').then((value: any[] | null) => {
        set('image-catalog', (value || []).concat([imgKey]));
      });
    });
  });
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
  /* eslint-disable @typescript-eslint/ban-ts-ignore*/
  // @ts-ignore
  return (document.imageStore && document.imageStore[templateName]) || 'logo.png';
  /* eslint-enable @typescript-eslint/ban-ts-ignore*/
}
