#!/usr/bin/env node

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

const argv = yargs.argv;

const input =
	argv.input[0] !== "~" && argv.input[0] !== "/"
		? path.resolve(process.cwd(), argv.input)
		: path.resolve(argv.input);
const output =
	argv.output[0] !== "~" && argv.output[0] !== "/"
		? path.resolve(process.cwd(), argv.output)
		: path.resolve(argv.output);
console.log(input);
console.log(output);

(async () => {
	const image = await loadImage(input);
	const width = image.width;
	const height = image.height;
	const scanvas = createCanvas(width, height);
	const scontext = scanvas.getContext("2d");
	const canvas = createCanvas(width, height);
	const context = canvas.getContext("2d");

	scontext.fillStyle = "white";
	scontext.fillRect(0, 0, width, height);
	scontext.drawImage(image, 0, 0, width, height);

	const current = scontext.getImageData(0, 0, width, height);
	let amount = Math.floor(Math.random() * argv.factor * 4) + argv.factor;
	const bins = [{ amount: amount, values: [] }];
	let meter = 0;
	for (let i = 0; i < current.data.length; i += 4) {
		bins[bins.length - 1].values.push([
			current.data[i],
			current.data[i + 1],
			current.data[i + 2],
		]);
		meter++;
		if (meter >= amount) {
			meter = 0;
			amount = Math.floor(Math.random() * argv.factor * 4) + argv.factor;
			bins.push({ amount: amount, values: [] });
		}
	}
	const next = context.createImageData(width, height);
	const values = [];
	bins.forEach((bin) => {
		let red = 0;
		let green = 0;
		let blue = 0;
		bin.values.forEach((value) => {
			red += value[0];
			green += value[1];
			blue += value[2];
		});
		for (let i = 0; i < bin.amount; i++) {
			values.push(red / bin.amount);
			values.push(green / bin.amount);
			values.push(blue / bin.amount);
			values.push(255);
		}
	});
	for (let i = 0; i < next.data.length; i++) {
		next.data[i] = Math.floor(values[i]);
	}
	context.putImageData(next, 0, 0);
	const buffer = canvas.toBuffer("image/png");
	fs.writeFileSync(output, buffer);
})();
