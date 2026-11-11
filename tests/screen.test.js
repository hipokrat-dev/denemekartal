import test from 'node:test';
import assert from 'node:assert/strict';
import { screenMatrix } from '../src/screen-projection.js';
import { readFileSync } from 'node:fs';
const track=JSON.parse(readFileSync(new URL('../src/screen-track.json',import.meta.url)));
function project(m,x,y) {const w=m[3]*x+m[7]*y+m[15];return [(m[0]*x+m[4]*y+m[12])/w,(m[1]*x+m[5]*y+m[13])/w];}
test('all tracked screen corners project precisely into the video',()=>{
  for(const [frame,sample] of Object.entries(track.frames)) {
    const m=screenMatrix(sample.q); assert.ok(m,frame);
    [[0,0],[1600,0],[1600,1000],[0,1000]].forEach(([x,y],i)=>{
      const actual=project(m,x,y);
      assert.ok(Math.abs(actual[0]-sample.q[i][0])<.001,frame);
      assert.ok(Math.abs(actual[1]-sample.q[i][1])<.001,frame);
    });
  }
});
test('artwork is absent on the back of the laptop and under the full wing',()=>{
  assert.equal(track.frames[270],undefined); assert.equal(track.frames[340],undefined);
  assert.equal(track.frames[219].clip.length,0); assert.equal(track.frames[220].clip.length,0);
  assert.ok(track.frames[228]); assert.ok(track.frames[347]);assert.ok(track.frames[track.lastFrame]);
});
