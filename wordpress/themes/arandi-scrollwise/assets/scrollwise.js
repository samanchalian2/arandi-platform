(() => {
    'use strict';

    const story = document.querySelector('[data-scrollwise-story]');
    const stage = story?.querySelector('[data-scrollwise-stage]');
    const canvas = story?.querySelector('[data-scrollwise-canvas]');
    const veil = story?.querySelector('[data-scrollwise-veil]');
    const scenes = story ? Array.from(story.querySelectorAll('[data-scrollwise-scene]')) : [];

    if (!(story instanceof HTMLElement)
        || !(stage instanceof HTMLElement)
        || !(canvas instanceof HTMLCanvasElement)
        || !(veil instanceof HTMLElement)
        || scenes.length !== 10) {
        return;
    }

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
        return;
    }

    const clamp = (value, minimum = 0, maximum = 1) =>
        Math.min(maximum, Math.max(minimum, value));
    const smoothstep = (value) => {
        const bounded = clamp(value);
        return bounded * bounded * (3 - (2 * bounded));
    };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const directions = {
        gateway: 1,
        discover: -1,
        design: 1,
        'build-secure': -1,
        'oil-gas': 1,
        petrochemical: 1,
        'connected-operations': -1,
        intelligence: 1,
        outcomes: -1,
        finale: 1,
    };
    const sources = scenes.map((scene) => scene.dataset.sceneSrc || '');
    const images = scenes.map((scene, index) => {
        const image = new Image();
        image.decoding = 'async';
        image.dataset.scrollwiseState = 'idle';
        image.dataset.scene = scene.dataset.scrollwiseScene || String(index);
        if (index === 0) {
            image.fetchPriority = 'high';
        }
        return image;
    });

    let animationFrame = 0;
    let lastRenderedIndex = 0;
    let resizeObserver;

    const requestedScenes = () => images
        .filter((image) => image.dataset.scrollwiseState !== 'idle')
        .map((image) => image.dataset.scene)
        .join(',');

    const scheduleRender = () => {
        if (animationFrame === 0) {
            animationFrame = window.requestAnimationFrame(render);
        }
    };

    const ensureImage = (index) => {
        const image = images[index];
        const source = sources[index];
        if (!image || !source || image.dataset.scrollwiseState !== 'idle') {
            return;
        }

        image.dataset.scrollwiseState = 'loading';
        image.addEventListener('load', () => {
            image.dataset.scrollwiseState = 'loaded';
            scheduleRender();
        }, { once: true });
        image.addEventListener('error', () => {
            image.dataset.scrollwiseState = 'error';
            scheduleRender();
        }, { once: true });
        image.src = source;
    };

    const drawCover = (image, width, height, zoom, focusX, focusY, opacity) => {
        const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const scale = baseScale * zoom;
        const renderedWidth = image.naturalWidth * scale;
        const renderedHeight = image.naturalHeight * scale;
        const overflowX = Math.max(0, renderedWidth - width);
        const overflowY = Math.max(0, renderedHeight - height);

        context.save();
        context.globalAlpha = opacity;
        context.drawImage(
            image,
            -overflowX * clamp(focusX),
            -overflowY * clamp(focusY),
            renderedWidth,
            renderedHeight
        );
        context.restore();
    };

    const resolveScene = () => {
        const anchor = window.innerHeight * 0.5;
        let sceneIndex = 0;

        scenes.forEach((scene, index) => {
            if (scene.getBoundingClientRect().top <= anchor) {
                sceneIndex = index;
            }
        });

        const rect = scenes[sceneIndex].getBoundingClientRect();
        return {
            sceneIndex,
            localProgress: clamp((anchor - rect.top) / Math.max(1, rect.height)),
        };
    };

    function render() {
        animationFrame = 0;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width === 0 || height === 0) {
            return;
        }

        const { sceneIndex, localProgress } = resolveScene();
        const nextIndex = Math.min(scenes.length - 1, sceneIndex + 1);
        const isReduced = reducedMotion.matches;
        const travel = isReduced ? 0.5 : smoothstep(localProgress / 0.68);
        const transitionStart = 0.86;
        const transition = isReduced
            ? 0
            : smoothstep((localProgress - transitionStart) / (1 - transitionStart));
        const sceneKey = scenes[sceneIndex].dataset.scrollwiseScene || '';
        const nextKey = scenes[nextIndex].dataset.scrollwiseScene || '';
        const direction = directions[sceneKey] || 1;
        const nextDirection = directions[nextKey] || 1;
        const cameraStart = 0.1;
        const cameraTravel = 0.8;
        const cameraX = direction > 0
            ? cameraStart + (travel * cameraTravel)
            : (1 - cameraStart) - (travel * cameraTravel);
        const cameraY = isReduced ? 0.5 : 0.48 - (Math.sin(travel * Math.PI) * 0.04);
        const cameraZoom = isReduced ? 1.02 : 1.015 + (travel * 0.06);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        const targetWidth = Math.round(width * pixelRatio);
        const targetHeight = Math.round(height * pixelRatio);

        ensureImage(sceneIndex);
        if (!isReduced && nextIndex !== sceneIndex) {
            ensureImage(nextIndex);
        }

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
        }
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.fillStyle = '#fffefa';
        context.fillRect(0, 0, width, height);

        const activeImage = images[sceneIndex];
        const nextImage = images[nextIndex];
        const fallbackImage = images[lastRenderedIndex]?.dataset.scrollwiseState === 'loaded'
            ? images[lastRenderedIndex]
            : images[0];
        let drewImage = false;

        if (activeImage?.dataset.scrollwiseState === 'loaded') {
            drawCover(activeImage, width, height, cameraZoom, cameraX, cameraY, 1);
            lastRenderedIndex = sceneIndex;
            drewImage = true;
        } else if (fallbackImage?.dataset.scrollwiseState === 'loaded') {
            drawCover(fallbackImage, width, height, 1.02, 0.5, 0.5, 1);
            drewImage = true;
        }

        if (transition > 0 && nextImage?.dataset.scrollwiseState === 'loaded') {
            const incomingX = nextDirection > 0 ? cameraStart : 1 - cameraStart;
            drawCover(nextImage, width, height, 1.02, incomingX, 0.48, transition);
        }

        if (drewImage) {
            stage.classList.add('is-canvas-ready');
        }

        let veilOpacity = 0;
        if (!isReduced && localProgress >= 0.62 && localProgress < 0.76) {
            veilOpacity = 0.9 * smoothstep((localProgress - 0.62) / 0.14);
        } else if (!isReduced && localProgress >= 0.76) {
            veilOpacity = 0.9 * (1 - smoothstep((localProgress - 0.76) / 0.24));
        }
        veil.style.opacity = veilOpacity.toFixed(4);

        scenes.forEach((scene, index) => {
            scene.classList.toggle('is-active', index === sceneIndex);
        });

        const visibleIndex = transition > 0.5 ? nextIndex : sceneIndex;
        canvas.dataset.scene = scenes[visibleIndex].dataset.scrollwiseScene || '';
        canvas.dataset.sceneIndex = String(visibleIndex);
        canvas.dataset.currentScene = sceneKey;
        canvas.dataset.nextScene = nextKey;
        canvas.dataset.imageState = activeImage?.dataset.scrollwiseState || 'missing';
        canvas.dataset.nextImageState = nextImage?.dataset.scrollwiseState || 'missing';
        canvas.dataset.requestedScenes = requestedScenes();
        canvas.dataset.phase = localProgress < 0.62
            ? 'story'
            : localProgress < transitionStart ? 'interlude' : 'handoff';
        canvas.dataset.localProgress = localProgress.toFixed(4);
        canvas.dataset.cameraX = cameraX.toFixed(4);
        canvas.dataset.cameraY = cameraY.toFixed(4);
        canvas.dataset.cameraZoom = cameraZoom.toFixed(4);
        canvas.dataset.crossfade = transition.toFixed(4);
        canvas.dataset.reducedMotion = String(isReduced);
        story.dataset.scrollwiseReady = String(drewImage);
        story.dataset.scrollwiseMotion = isReduced ? 'reduced' : 'full';
    }

    const onScroll = () => scheduleRender();
    const onMotionChange = () => scheduleRender();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', scheduleRender, { passive: true });
    reducedMotion.addEventListener('change', onMotionChange);

    if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(scheduleRender);
        resizeObserver.observe(canvas);
    }

    scheduleRender();
})();
