import test from 'node:test';
import assert from 'node:assert/strict';
import { createMotion } from '../src/motion.js';
function tick(motion, from, to) { for (let now=from;now<=to;now+=20) motion.update(.02,now); }
test('a short press advances a small distance and then stops', () => {
  const motion=createMotion({duration:15}); motion.press(1,0); motion.release(60); tick(motion,60,1500);
  assert.equal(motion.time,.75); assert.equal(motion.moving,false);
});
test('holding continues and releasing stops immediately', () => {
  const motion=createMotion({duration:15}); motion.press(1,0); tick(motion,0,3000);
  assert.ok(motion.time>2.9); motion.release(3000); const time=motion.time; tick(motion,3020,4000); assert.equal(motion.time,time);
});
test('both ends clamp, reverse works, and reset cancels movement', () => {
  const motion=createMotion({duration:1}); motion.press(1,0); tick(motion,0,2000); assert.equal(motion.time,1);
  motion.release(2000); motion.press(-1,2100); tick(motion,2100,4000); assert.equal(motion.time,0);
  motion.seek(5); assert.equal(motion.time,1); motion.press(-1,5000); motion.seek(0); assert.equal(motion.moving,false);
});

test('advancing at the final frame never starts playback again', () => {
  const motion=createMotion({duration:15}); motion.sync(15); motion.press(1,100);
  assert.equal(motion.direction,0); assert.equal(motion.moving,false);
  motion.press(-1,200); assert.equal(motion.direction,-1);
});
test('native media time determines the end of a short forward step', () => {
  const motion=createMotion({duration:15}); motion.sync(4); motion.press(1,100); motion.release(130);
  motion.sync(4.5); motion.update(0,500); assert.equal(motion.direction,1);
  motion.sync(4.78); motion.update(0,900); assert.equal(motion.direction,0);
});
