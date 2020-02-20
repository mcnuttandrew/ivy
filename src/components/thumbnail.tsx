import React, {useEffect, useState} from 'react';
import {serverPrefix} from '../utils';
import GALLERY from '../templates/gallery';

interface ThumbnailProps {
  templateName: string;
  templateAuthor: string;
}

function thumbnailLocation(
  templateName: string | null,
  templateAuthor: string | null,
): {url: string; local: boolean} {
  if (!templateName) {
    return {url: 'logo.png', local: true};
  }
  if (templateName === 'Polestar') {
    return {url: 'assets/polestar-logo.png', local: true};
  }
  if (templateName === 'AtomExplore') {
    return {url: 'assets/atom-logo.png', local: true};
  }
  if (templateName === GALLERY.templateName) {
    return {url: 'assets/chart-gallery-logo.png', local: true};
  }
  return {url: `${serverPrefix()}/thumbnail?author=${templateAuthor}&template=${templateName}`, local: false};
}

export default function Thumbnail(props: ThumbnailProps): JSX.Element {
  const {templateName, templateAuthor} = props;
  const [src, setSrc] = useState('logo.png');
  useEffect(() => {
    const {url, local} = thumbnailLocation(templateName, templateAuthor);
    if (local) {
      setSrc(url);
      return;
    }
    fetch(url)
      .then(x => x.text())
      .then(x => setSrc(x));
  }, [templateName, templateAuthor]);
  return <img src={src} onError={(): any => setSrc('logo.png')} />;
}
