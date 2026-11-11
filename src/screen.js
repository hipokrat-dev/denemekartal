import track from './screen-track.json';
import { screenMatrix } from './screen-projection.js';

export function attachScreen(video) {
  const viewport=document.querySelector('#screen-overlay');
  const plane=document.querySelector('#screen-plane');
  const artwork=plane.querySelector('img');
  let lastFrame=-1, mediaTime=0;
  const positioned = new ResizeObserver(() => {
    const {width,height}=video.getBoundingClientRect();
    const scale=Math.min(width/track.width,height/track.height);
    viewport.style.left=`${(width-track.width*scale)/2}px`;
    viewport.style.top=`${(height-track.height*scale)/2}px`;
    viewport.style.transform=`scale(${scale})`;
  });
  positioned.observe(video);
  function render(time, force=false) {
    mediaTime=time;
    const frame=Math.min(track.lastFrame,Math.max(0,Math.floor(time*track.fps+1e-4)));
    if (frame===lastFrame&&!force) return;
    lastFrame=frame;
    const sample=track.frames[frame];
    const matrix=sample&&screenMatrix(sample.q);
    if (!sample||!matrix||!artwork.complete||!artwork.naturalWidth||sample.clip?.length===0) {
      viewport.hidden=true; return;
    }
    plane.style.transform=`matrix3d(${matrix.join(',')})`;
    // This path follows the wing silhouette only during the landing occlusion.
    viewport.style.clipPath=sample.clip
      ? `path('${sample.clip.map(points=>`M${points.map(p=>p.join(' ')).join(' L')}Z`).join(' ')}')`
      : 'none';
    plane.style.filter=frame<347?'brightness(.9) saturate(.85)':'brightness(.98) saturate(.95)';
    viewport.hidden=false;
  }
  artwork.addEventListener('load',()=>render(mediaTime,true));
  video.addEventListener('seeked',()=>render(video.currentTime,true));
  video.addEventListener('loadeddata',()=>render(video.currentTime,true));
  if ('requestVideoFrameCallback' in video) {
    const onFrame=(_now,metadata)=>{render(metadata.mediaTime);video.requestVideoFrameCallback(onFrame);};
    video.requestVideoFrameCallback(onFrame);
  } else {
    const onFrame=()=>{render(video.currentTime);requestAnimationFrame(onFrame);};
    requestAnimationFrame(onFrame);
  }
}
