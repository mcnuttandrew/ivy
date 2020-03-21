import React, {useEffect, useState} from 'react';
import {serverPrefix} from '../utils';
import GALLERY from '../templates/gallery';

interface ThumbnailProps {
  templateName: string;
  templateAuthor: string;
}

function thumbnailLocation(templateName: string | null, templateAuthor: string | null): string {
  if (!templateName || templateName === 'BLANK TEMPLATE') {
    return 'logo.png';
  }
  if (templateName === 'Polestar') {
    return 'assets/polestar-logo.png';
  }
  if (templateName === 'AtomExplore') {
    return 'assets/atom-logo.png';
  }
  if (templateName === GALLERY.templateName) {
    return 'assets/chart-gallery-logo.png';
  }
  return `${serverPrefix()}/thumbnail/${templateAuthor}/${templateName}`;
}

function Thumbnail(props: ThumbnailProps): JSX.Element {
  const {templateName, templateAuthor} = props;
  const [src, setSrc] = useState('logo.png');
  useEffect(() => {
    setSrc(thumbnailLocation(templateName, templateAuthor));
  }, [templateName, templateAuthor]);
  return (
    <img
      alt={`Logo for ${templateName} by ${templateAuthor}`}
      src={src}
      onError={(): any => setSrc('logo.png')}
    />
  );
}

export default React.memo(Thumbnail);
