"""Extract screen geometry and foreground visibility; the supplied artwork is not edited.
Run with opencv-python-headless and numpy installed. Coordinates are for the 24 fps source.
"""
import json
from pathlib import Path
import cv2
import numpy as np
root=Path(__file__).resolve().parents[1]
# Clockwise LCD corners (not the bezel), anchored to inspected source frames.
local={
186:[[106,240],[115,240],[113,248],[104,248]],
192:[[112,225],[129,225],[124,241],[108,241]],
198:[[117,194],[151,196],[143,226],[109,224]],
203:[[117,164],[172,166],[163,212],[104,209]],
204:[[112,160],[175,162],[165,214],[97,211]],
210:[[125,131],[214,131],[197,212],[106,207]],
216:[[177,102],[284,101],[257,213],[151,207]],
228:[[285,79],[390,76],[344,220],[246,207]],
}
anchors={f:(np.array(q,dtype=float)+[850,270]) for f,q in local.items()}
anchors.update({
240:np.array([[1301,320],[1396,314],[1330,527],[1248,498]],float),
246:np.array([[1401,309],[1477,300],[1391,557],[1331,523]],float),
252:np.array([[1508,300],[1555,289],[1459,589],[1428,550]],float),
256:np.array([[1579,294],[1605,282],[1493,617],[1478,577]],float),
258:np.array([[1623,290],[1633,279],[1519,636],[1515,593]],float),
})
cap=cv2.VideoCapture(str(root/'public/assets/kartal-journey.mp4'))
frames={}; n=0
while True:
 ok,img=cap.read()
 if not ok:break
 if 186<=n<=258 or n>=347:frames[n]=img
 n+=1
keys=sorted(anchors); tracks={}
# Follow the camera's non-linear movement between the manually inspected anchors.
# The final correction pins both endpoints and avoids accumulating tracking drift.
dense={}
for lo,hi in zip(keys,keys[1:]):
 if lo==216 or hi-lo<2:continue  # wing occlusion, or the binocular cut
 q=anchors[lo].astype(np.float32); moving={lo:q.copy()}
 for f in range(lo+1,hi+1):
  a=cv2.cvtColor(frames[f-1],cv2.COLOR_BGR2GRAY)
  b=cv2.cvtColor(frames[f],cv2.COLOR_BGR2GRAY)
  region=np.zeros(a.shape,np.uint8);cv2.fillConvexPoly(region,np.int32(q),255)
  region=cv2.dilate(region,np.ones((9,9),np.uint8))
  pts=cv2.goodFeaturesToTrack(a,90,.008,3,mask=region)
  transform=None
  if pts is not None and len(pts)>=4:
   nxt,ok,_=cv2.calcOpticalFlowPyrLK(a,b,pts,None,winSize=(31,31),maxLevel=3)
   back,backok,_=cv2.calcOpticalFlowPyrLK(b,a,nxt,None,winSize=(31,31),maxLevel=3)
   good=(ok.ravel()==1)&(backok.ravel()==1)&(np.linalg.norm(back-pts,axis=2).ravel()<1.5)
   if good.sum()>=4:transform,_=cv2.estimateAffine2D(pts[good],nxt[good],ransacReprojThreshold=1.5)
  if transform is not None:
   q=cv2.transform(q[None],transform)[0]
  else:q=q+(anchors[hi]-anchors[lo])/(hi-lo)
  moving[f]=q.copy()
 correction=anchors[hi]-moving[hi]
 for f,q in moving.items():dense[f]=q+correction*(f-lo)/(hi-lo)

for f in range(186,259):
 lo=max(k for k in keys if k<=f); hi=min(k for k in keys if k>=f)
 q=anchors[lo] if lo==hi else anchors[lo]+(anchors[hi]-anchors[lo])*(f-lo)/(hi-lo)
 q=dense.get(f,q)
 item={'q':np.round(q,2).tolist()}
 if 217<=f<=227:
  # The neutral LCD is distinguished from the dark, warm foreground feathers.
  hsv=cv2.cvtColor(frames[f],cv2.COLOR_BGR2HSV)
  matte=cv2.inRange(hsv,np.array([0,0,38]),np.array([179,65,255]))
  region=np.zeros(matte.shape,np.uint8);cv2.fillConvexPoly(region,np.int32(q),255)
  matte=cv2.bitwise_and(matte,region)
  matte=cv2.morphologyEx(matte,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
  contours,_=cv2.findContours(matte,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
  polygons=[cv2.approxPolyDP(c,1.1,True).reshape(-1,2).tolist() for c in contours if cv2.contourArea(c)>35]
  item['clip']=polygons
 tracks[str(f)]=item
# The final shot is tracked at native frame rate by feature-based planar motion.
quad=np.array([[307,120],[1629,120],[1656,959],[282,958]],dtype=np.float32)
prev=cv2.cvtColor(frames[347],cv2.COLOR_BGR2GRAY)
for f in range(347,n):
 current=cv2.cvtColor(frames[f],cv2.COLOR_BGR2GRAY)
 if f>347:
  mask=np.zeros(prev.shape,np.uint8);cv2.fillConvexPoly(mask,np.int32(quad),255)
  points=cv2.goodFeaturesToTrack(prev,150,.02,12,mask=mask)
  following,status,_=cv2.calcOpticalFlowPyrLK(prev,current,points,None,winSize=(21,21),maxLevel=3)
  good=status.ravel()==1
  homography,inliers=cv2.findHomography(points[good],following[good],cv2.RANSAC,2)
  if homography is not None:quad=cv2.perspectiveTransform(quad[None],homography)[0]
 tracks[str(f)]={'q':np.round(quad,2).tolist()}
 prev=current
out={'fps':24,'width':1920,'height':1080,'lastFrame':n-1,'frames':tracks}
(root/'src/screen-track.json').write_text(json.dumps(out,separators=(',',':')))
print(f'{len(tracks)} tracked frames, {n} source frames')
print('Occlusion visibility:',[(f,len(tracks[str(f)].get('clip',[]))) for f in range(217,228)])
