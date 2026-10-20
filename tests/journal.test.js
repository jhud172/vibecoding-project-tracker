import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("the shipped Blender journal is self-contained, bounded and contains real cover/page keyframes", () => {
  const bytes = fs.readFileSync(
    new URL("../public/models/relay-journal.glb", import.meta.url),
  );
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.ok(bytes.length < 800000, "Keep the untextured model below 800 KB");
  const length = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.subarray(20, 20 + length).toString());
  assert.match(gltf.asset.generator, /Blender/);
  assert.equal(gltf.animations.length, 1);
  assert.equal(gltf.animations[0].name, "OpenJournal");
  assert.equal(
    gltf.animations[0].channels.length,
    5,
    "Cover plus four page hinges must animate",
  );
  assert.ok(
    gltf.buffers.every((buffer) => !buffer.uri),
    "No external geometry or texture requests",
  );
  const channel = gltf.animations[0].channels.find(
    (c) => gltf.nodes[c.target.node].name === "Cover hinge",
  );
  assert.ok(channel);
  const sampler = gltf.animations[0].samplers[channel.sampler];
  const output = gltf.accessors[sampler.output];
  const view = gltf.bufferViews[output.bufferView];
  const binaryStart = 20 + length + 8;
  const offset =
    binaryStart + (view.byteOffset || 0) + (output.byteOffset || 0);
  const stride = view.byteStride || 16;
  const first = Array.from({ length: 4 }, (_, i) =>
    bytes.readFloatLE(offset + i * 4),
  );
  const last = Array.from({ length: 4 }, (_, i) =>
    bytes.readFloatLE(offset + (output.count - 1) * stride + i * 4),
  );
  assert.notDeepEqual(
    first,
    last,
    "Cover must actually rotate between exported keyframes",
  );
  const poster = fs.readFileSync(
    new URL("../public/models/relay-journal-poster.webp", import.meta.url),
  );
  assert.equal(poster.subarray(8, 12).toString(), "WEBP");
  assert.ok(poster.length < 50000, "Poster fallback must stay lightweight");
});
