import DomToImage from 'dom-to-image';
import {serverPrefix} from './index';

function publishThumbnail(templateName: string, authorKey: string, templateImg: string): void {
  // const thumbnail = thumbnailLocation(templateName, template.templateAuthor);
  fetch(`${serverPrefix()}/save-thumbnail`, {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify({templateName, authorKey, templateImg}), // body data type must match "Content-Type" header
  }).then(x => {
    console.log('finish pub');
    console.log(x);
  });
}

export function updateThumbnail(templateName: string, authorKey: string): Promise<void> {
  const node = document.querySelector('.chart-container div');
  return DomToImage.toJpeg(node, {quality: 0.1}).then(dataurl => {
    return publishThumbnail(templateName, authorKey, dataurl);
  });
}
