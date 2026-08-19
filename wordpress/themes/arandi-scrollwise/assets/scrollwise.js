(() => {
	'use strict';

	const story = document.querySelector('[data-scrollwise-story]');
	const canvas = story?.querySelector('[data-scrollwise-canvas]');
	const veil = story?.querySelector('[data-scrollwise-veil]');
	const chapters = story ? [...story.querySelectorAll('[data-scrollwise-chapter]')] : [];
	const motionToggle = story?.querySelector('[data-scrollwise-motion-toggle]');
	const menuToggle = story?.querySelector('[data-scrollwise-menu-toggle]');
	const mobileMenu = story?.querySelector('#scrollwise-mobile-menu');
	const motionKey = 'arandi-scrollwise-motion';
	const motionEvent = 'arandi-scrollwise-motion';

	if (!(canvas instanceof HTMLCanvasElement) || !(veil instanceof HTMLElement) || chapters.length !== 10) return;

	const context = canvas.getContext('2d', { alpha: false });
	if (!context) return;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const directions = [1, -1, 1, -1, 1, 1, -1, 1, -1, 1];
	const images = chapters.map((chapter, index) => {
		const image = new Image();
		image.decoding = 'async';
		image.dataset.state = 'idle';
		if (index === 0) image.fetchPriority = 'high';
		return image;
	});
	let frame = 0;
	let lastSceneIndex = -1;

	const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
	const smoothstep = (value) => {
		const progress = clamp(value);
		return progress * progress * (3 - (2 * progress));
	};
	const isPaused = () => window.localStorage.getItem(motionKey) === 'paused';
	const isStatic = () => reducedMotion.matches || isPaused();
	const updateMotionControl = () => {
		if (!(motionToggle instanceof HTMLButtonElement)) return;
		const paused = isPaused();
		motionToggle.setAttribute('aria-pressed', String(paused));
		motionToggle.textContent = paused ? '▶' : 'II';
		motionToggle.setAttribute('aria-label', paused ? 'Enable motion' : 'Pause motion');
		story.dataset.motionPaused = String(paused);
	};

	const ensureImage = (index) => {
		const image = images[index];
		const source = chapters[index]?.dataset.desktopImage;
		if (!image || !source || image.dataset.state !== 'idle') return;
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
		if (!image.complete || image.naturalWidth === 0) return;
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
			if (chapters[index].getBoundingClientRect().top <= anchor) sceneIndex = index;
		}
		const rect = chapters[sceneIndex].getBoundingClientRect();
		return { sceneIndex, localProgress: clamp((anchor - rect.top) / Math.max(1, rect.height)) };
	};
	const getVeilOpacity = (sceneIndex, localProgress, staticMotion) => {
		if (staticMotion || sceneIndex === chapters.length - 1 || chapters[sceneIndex + 1]?.dataset.scrollwiseRole === 'episode') return 0;
		const scene = chapters[sceneIndex].querySelector('.scrollwise-scene');
		const sceneHeight = scene instanceof HTMLElement ? scene.offsetHeight : 1;
		const chapterHeight = Math.max(1, chapters[sceneIndex].offsetHeight);
		const storyEnd = sceneHeight / chapterHeight;
		const riseStart = storyEnd * 0.84;
		const fallStart = Math.max(storyEnd, 0.88);
		if (localProgress < riseStart) return 0;
		if (localProgress < storyEnd) return 0.94 * smoothstep((localProgress - riseStart) / Math.max(0.01, storyEnd - riseStart));
		if (localProgress < fallStart) return 0.94;
		return 0.94 * (1 - smoothstep((localProgress - fallStart) / Math.max(0.01, 1 - fallStart)));
	};
	const render = () => {
		frame = 0;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (width === 0 || height === 0) return;
		const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
		if (canvas.width !== Math.round(width * pixelRatio) || canvas.height !== Math.round(height * pixelRatio)) {
			canvas.width = Math.round(width * pixelRatio);
			canvas.height = Math.round(height * pixelRatio);
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
		const staticMotion = isStatic();
		const progress = staticMotion ? 0.38 : localProgress;
		const nextIndex = Math.min(chapters.length - 1, sceneIndex + 1);
		const travel = staticMotion ? 0.5 : smoothstep(progress / 0.66);
		const transitionStart = chapters[nextIndex]?.dataset.scrollwiseRole === 'episode' ? 0.93 : 0.86;
		const transition = staticMotion ? 0 : smoothstep((progress - transitionStart) / (1 - transitionStart));
		const direction = directions[sceneIndex] || 1;
		const focusStart = 0.08;
		const focusTravel = 0.84;
		const zoom = 1.015 + (travel * 0.075);
		const focusX = direction > 0 ? focusStart + (travel * focusTravel) : (1 - focusStart) - (travel * focusTravel);
		const focusY = 0.48 - (Math.sin(travel * Math.PI) * 0.045);
		drawCover(images[sceneIndex], width, height, zoom, focusX, focusY, 1);
		if (transition > 0 && nextIndex !== sceneIndex) {
			drawCover(images[nextIndex], width, height, 1.02, directions[nextIndex] > 0 ? focusStart : 1 - focusStart, 0.48, transition);
		}
		veil.style.opacity = getVeilOpacity(sceneIndex, localProgress, staticMotion).toFixed(4);
		canvas.dataset.scene = chapters[transition > 0.5 ? nextIndex : sceneIndex].dataset.scrollwiseChapter || '';
		canvas.dataset.imageState = images[sceneIndex].dataset.state || 'missing';
		canvas.dataset.phase = progress < 0.66 ? 'story' : progress < transitionStart ? 'interlude' : 'handoff';
		canvas.dataset.cameraX = focusX.toFixed(4);
		canvas.dataset.cameraY = focusY.toFixed(4);
		canvas.dataset.cameraZoom = zoom.toFixed(4);
		canvas.dataset.transition = transition.toFixed(4);
		story.dataset.reducedMotion = String(reducedMotion.matches);
	};
	const scheduleRender = () => {
		if (frame === 0) frame = window.requestAnimationFrame(render);
	};

	if (reducedMotion.matches) {
		story.dataset.reducedMotion = 'true';
		return;
	}
	if (motionToggle instanceof HTMLButtonElement) {
		motionToggle.hidden = story.dataset.motionControl !== 'true';
		motionToggle.addEventListener('click', () => {
			window.localStorage.setItem(motionKey, isPaused() ? 'playing' : 'paused');
			window.dispatchEvent(new Event(motionEvent));
		});
	}
	if (menuToggle instanceof HTMLButtonElement && mobileMenu instanceof HTMLElement) {
		menuToggle.addEventListener('click', () => {
			const open = mobileMenu.hidden;
			mobileMenu.hidden = !open;
			menuToggle.setAttribute('aria-expanded', String(open));
		});
		mobileMenu.addEventListener('click', () => {
			mobileMenu.hidden = true;
			menuToggle.setAttribute('aria-expanded', 'false');
		});
	}
	window.addEventListener(motionEvent, () => {
		updateMotionControl();
		scheduleRender();
	});
	window.addEventListener('storage', updateMotionControl);
	window.addEventListener('scroll', scheduleRender, { passive: true });
	reducedMotion.addEventListener('change', () => window.location.reload());
	const resizeObserver = new ResizeObserver(scheduleRender);
	resizeObserver.observe(canvas);
	updateMotionControl();
	ensureImage(0);
	ensureImage(1);
	ensureImage(2);
	scheduleRender();
})();
