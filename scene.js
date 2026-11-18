'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const mint = '#9ef4dc';
const amber = '#ffcb7d';
const ink = '#152129';
const duration = 8;
const controls = [...document.querySelectorAll('#settings input')];
const settings = Object.fromEntries(controls.map(input => [
  input.id, input.type === 'number' ? Number(input.value) : input.value
]));
controls.forEach(input => input.addEventListener('input', () => {
  if (input.type === 'number' && (input.value === '' || !input.validity.valid)) return;
  settings[input.id] = input.type === 'number' ? input.valueAsNumber : input.value;
  draw();
}));

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function label(value, x, y, size = 24, color = mint) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px system-ui`;
  ctx.fillText(value, x, y);
}

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => clamp(value) ** 2 * (3 - 2 * clamp(value));

function render(t) {
  [...settings.text].forEach((letter, i) => {
    const p = smooth((t - i * settings.delay) / .9);
    ctx.globalAlpha = p;
    label(letter, 52 + Math.min(77, 610 / Math.max(1, [...settings.text].length)) * i, 223 + 80 * (1 - p), Math.min(70, 900 / Math.max(1, [...settings.text].length)));
  });
  ctx.globalAlpha = 1;
}

const seek = document.querySelector('#seek');
const play = document.querySelector('#play');
const time = document.querySelector('#time');
let position = 0;
let playing = false;
let previous = null;
let animationId = null;

function draw() {
  rect(0, 0, canvas.width, canvas.height, ink);
  render(position);
  seek.value = position;
  time.value = `${position.toFixed(2)} sn`;
}

function frame(timestamp) {
  if (!playing) return;
  if (previous !== null) position = (position + (timestamp - previous) / 1000) % duration;
  previous = timestamp;
  draw();
  animationId = requestAnimationFrame(frame);
}

play.addEventListener('click', () => {
  playing = !playing;
  play.textContent = playing ? 'Duraklat' : 'Oynat';
  if (playing) {
    previous = null;
    animationId = requestAnimationFrame(frame);
  } else {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
});

seek.addEventListener('input', () => {
  position = Number(seek.value);
  draw();
});

document.querySelector('#save').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'staggered-flow-type.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

draw();
