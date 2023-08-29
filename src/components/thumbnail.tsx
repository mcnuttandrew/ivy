import React, {useEffect, useState} from 'react';
import GALLERY from '../templates/gallery';

import {get, set} from 'idb-keyval';

interface ThumbnailProps {
  templateName: string;
  templateAuthor: string;
  templateInstance?: string;
}

function thumbnailLocation(
  templateName: string | null,
  templateAuthor: string | null,
  templateInstance: string | null,
): string {
  if (templateInstance) {
    return `.netlify/functions/thumbnail/${templateAuthor}/${templateName}/${templateInstance}`;
  }

  return `.netlify/functions/thumbnail/${templateAuthor}/${templateName}`;
}

async function checkImageCache(props: ThumbnailProps): Promise<string | null> {
  const {templateAuthor, templateName, templateInstance} = props;
  if (
    !templateName ||
    templateName === 'BLANK TEMPLATE' ||
    templateName === 'fillter' ||
    templateAuthor === 'filler'
  ) {
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
  const result = await get(`IvyImageCache/${templateAuthor}/${templateName}/${templateInstance}`);
  return (result as string) || null;
}

async function setImageCache(props: ThumbnailProps, img: string) {
  const {templateAuthor, templateName, templateInstance} = props;
  return await set(`IvyImageCache/${templateAuthor}/${templateName}/${templateInstance}`, img);
}

function Thumbnail(props: ThumbnailProps): JSX.Element {
  const {templateName, templateAuthor, templateInstance} = props;
  // const [src, setSrc] = useState('logo.png');
  const [loaded, setLoaded] = useState(false);
  const [image, setImage] = useState('');
  useEffect(() => {
    checkImageCache(props).then((cachedImage) => {
      if (cachedImage) {
        setImage(cachedImage);
        setLoaded(true);
        return;
      } else {
        fetch(thumbnailLocation(templateName, templateAuthor, templateInstance))
          .then((x) => x.text())
          .then((x) => {
            setImage(x);
            setImageCache(props, x);
            setLoaded(true);
          });
      }
    });
    // setSrc(thumbnailLocation(templateName, templateAuthor, templateInstance));
  }, [templateName, templateAuthor]);
  return (
    <img
      alt={`Logo for ${templateName} by ${templateAuthor}`}
      src={loaded ? image : 'logo.png'}
      onError={(): any => setLoaded(false)}
    />
  );
}

export default React.memo(Thumbnail);
