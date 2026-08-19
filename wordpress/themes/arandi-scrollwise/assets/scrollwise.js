(() => {
	'use strict';

	const story = document.querySelector('[data-scrollwise-story]');
	const canvas = story?.querySelector('[data-scrollwise-canvas]');
	const veil = story?.querySelector('[data-scrollwise-veil]');
	const chapters = story ? [...story.querySelectorAll('[data-scrollwise-chapter]')] : [];

	if (!(canvas instanceof HTMLCanvasElement) || !(veil instanceof HTMLElement) || chapters.length === 0) {
		return;
	}

	const context = canvas.getContext('2d', { alpha: false });
	if (!context) {
		return;
	}

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	if (reducedMotion.matches) {
		story.dataset.reducedMotion = 'true';
		return;
	}

	// Panoramic desktop sources preserve horizontal camera travel on every viewport.
	const images = chapters.map((chapter, index) => {
		const image = new Image();
		image.decoding = 'async';
		image.dataset.state = 'idle';
		if (index === 0) {
			image.fetchPriority = 'high';
		}
		return image;
	});
	const directions = [1, -1, 1, -1, 1, 1, -1, 1, -1, 1];
	let frame = 0;
	let lastSceneIndex = -1;

	const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
	const smoothstep = (value) => {
		const progress = clamp(value);
		return progress * progress * (3 - (2 * progress));
	};

	const ensureImage = (index) => {
		const image = images[index];
		const source = chapters[index]?.dataset.desktopImage;
		if (!image || !source || image.dataset.state !== 'idle') {
			return;
		}
		image.dataset.state = 'loading';
		image.addEventListener('load', () => {
			image.dataset.state = 'loaded';
			scheduleRender();
		}, { once: true });
		image.addEventListener('error', () => {
			image.dataset.state = 'error';
			scheduleRender();
		}, { once: true });
		image.src = source;
	};

	const drawCover = (image, width, height, zoom, focusX, focusY, opacity) => {
		if (!image.complete || image.naturalWidth === 0) {
			return;
		}
		const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
		const renderedWidth = image.naturalWidth * scale;
		const renderedHeight = image.naturalHeight * scale;
		const x = -Math.max(0, renderedWidth - width) * clamp(focusX);
		const y = -Math.max(0, renderedHeight - height) * clamp(focusY);

		context.save();
		context.globalAlpha = opacity;
		context.drawImage(image, x, y, renderedWidth, renderedHeight);
		context.restore();
	};

	const getSceneState = () => {
		const anchor = window.innerHeight * 0.5;
		let sceneIndex = 0;
		for (let index = 0; index < chapters.length; index += 1) {
			if (chapters[index].getBoundingClientRect().top <= anchor) {
				sceneIndex = index;
			}
		}
		const rect = chapters[sceneIndex].getBoundingClientRect();
		return {
			sceneIndex,
			localProgress: clamp((anchor - rect.top) / Math.max(1, rect.height)),
		};
	};

	const render = () => {
		frame = 0;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (width === 0 || height === 0) {
			return;
		}

		const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
		const targetWidth = Math.round(width * pixelRatio);
		const targetHeight = Math.round(height * pixelRatio);
		if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
			canvas.width = targetWidth;
			canvas.height = targetHeight;
		}
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		context.fillStyle = '#fbfcfd';
		context.fillRect(0, 0, width, height);

		const { sceneIndex, localProgress } = getSceneState();
		if (sceneIndex !== lastSceneIndex) {
			lastSceneIndex = sceneIndex;
			ensureImage(sceneIndex);
			ensureImage(sceneIndex + 1);
			ensureImage(sceneIndex + 2);
		}

		const staticMotion = reducedMotion.matches;
		const progress = staticMotion ? 0.38 : localProgress;
		const nextIndex = Math.min(chapters.length - 1, sceneIndex + 1);
		const travel = staticMotion ? 0.5 : smoothstep(progress / 0.68);
		const transitionStart = 0.84;
		const transition = staticMotion ? 0 : smoothstep((progress - transitionStart) / (1 - transitionStart));
		const direction = directions[sceneIndex] || 1;
		const zoom = 1.015 + (travel * 0.065);
		const focusStart = 0.08;
		const focusTravel = 0.84;
		const focusX = direction > 0
			? focusStart + (travel * focusTravel)
			: (1 - focusStart) - (travel * focusTravel);
		const focusY = 0.48 - (Math.sin(travel * Math.PI) * 0.045);

		drawCover(images[sceneIndex], width, height, zoom, focusX, focusY, 1);
		if (transition > 0 && nextIndex !== sceneIndex) {
			const incomingFocus = directions[nextIndex] > 0 ? focusStart : 1 - focusStart;
			drawCover(images[nextIndex], width, height, 1.02, incomingFocus, 0.48, transition);
		}

		const veilRise = smoothstep((progress - 0.62) / 0.12);
		const veilFall = smoothstep((progress - 0.75) / 0.2);
		const veilOpacity = staticMotion || sceneIndex === chapters.length - 1
			? 0
			: 0.92 * veilRise * (1 - veilFall);
		veil.style.opacity = veilOpacity.toFixed(4);
		canvas.dataset.scene = chapters[transition > 0.5 ? nextIndex : sceneIndex].dataset.scrollwiseChapter || '';
		canvas.dataset.imageState = images[sceneIndex].dataset.state || 'missing';
		canvas.dataset.phase = progress < 0.62 ? 'story' : progress < transitionStart ? 'interlude' : 'handoff';
		canvas.dataset.cameraX = focusX.toFixed(4);
		canvas.dataset.cameraY = focusY.toFixed(4);
		canvas.dataset.cameraZoom = zoom.toFixed(4);
		canvas.dataset.transition = transition.toFixed(4);
		story.dataset.reducedMotion = staticMotion ? 'true' : 'false';
	};

	const scheduleRender = () => {
		if (frame === 0) {
			frame = window.requestAnimationFrame(render);
		}
	};

	const resizeObserver = new ResizeObserver(scheduleRender);
	resizeObserver.observe(canvas);
	window.addEventListener('scroll', scheduleRender, { passive: true });
	reducedMotion.addEventListener('change', scheduleRender);
	ensureImage(0);
	ensureImage(1);
	ensureImage(2);
	scheduleRender();
})();
