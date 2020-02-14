import React, {useEffect, useState} from 'react';
import {serverPrefix} from '../utils';
import {NONE_TEMPLATE} from '../constants/index';

interface ThumbnailProps {
  templateName: string;
  templateAuthor: string;
}

function thumbnailLocation(
  templateName: string | null,
  templateAuthor: string | null,
): {url: string; local: boolean} {
  // TODO NULL CASE
  if (!templateName) {
    return {url: 'logo.png', local: true};
  }
  if (templateName === 'Polestar') {
    return {url: 'assets/polestar-logo.png', local: true};
  }
  if (templateName === 'AtomExplore') {
    return {url: 'assets/atom-logo.png', local: true};
  }
  if (templateName === NONE_TEMPLATE) {
    return {url: 'assets/chart-gallery-logo.png', local: true};
  }
  return {url: `${serverPrefix()}/thumbnail?author=${templateAuthor}&template=${templateName}`, local: false};
  // /* eslint-disable @typescript-eslint/ban-ts-ignore*/
  // // @ts-ignore
  // return (document.imageStore && document.imageStore[templateName]) || 'logo.png';
  // /* eslint-enable @typescript-eslint/ban-ts-ignore*/
}

export default function Thumbnail(props: ThumbnailProps): JSX.Element {
  const {templateName, templateAuthor} = props;
  //   let src = '';
  const [src, setSrc] = useState('logo.png');
  useEffect(() => {
    const {url, local} = thumbnailLocation(templateName, templateAuthor);
    if (local) {
      setSrc(url);
      return;
    }
    new Promise(() => {
      fetch(url)
        .then(x => x.text())
        .then(x => {
          setSrc(x);
          //   console.log(src);
        });
    });
    // src;
  }, [templateName, templateAuthor]);
  //   console.log(src);
  return (
    <img
      src={src}
      onError={(): void => {
        setSrc('logo.png');
      }}
    />
  );
}
