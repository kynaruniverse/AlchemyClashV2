/**
 * ALCHEMY CLASH: 3D ENGINE
 * Three.js renderer, lerp-based card motion, warm alchemy lighting, main loop.
 */

import * as THREE from 'three';

export class Engine3D {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene     = new THREE.Scene();
        this.camera    = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer  = new THREE.WebGLRenderer({
            antialias:        true,
            alpha:            true,
            powerPreference:  "high-performance",
            precision:        "highp"
        });

        this.vfx     = null;
        this.pLight  = null;
        this.cards   = new Set();
        this.clock   = new THREE.Clock();
        this.pointer = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
        this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);

        this.setupLighting();

        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('pointermove', e => {
            this.pointer.x = (e.clientX / window.innerWidth)  - 0.5;
            this.pointer.y = (e.clientY / window.innerHeight) - 0.5;
        });

        this.animate();
    }

    setupLighting() {
        // Warm ambient — alchemy lab candle-light feel
        const ambient = new THREE.AmbientLight(0xd4b896, 0.6);
        this.scene.add(ambient);

        // Hemisphere: warm top, dark earth bottom
        const hemi = new THREE.HemisphereLight(0xc9a84c, 0x1a1208, 0.5);
        this.scene.add(hemi);

        // Key light — warm lantern
        this.pLight = new THREE.PointLight(0xc9a84c, 2.5, 35);
        this.pLight.position.set(0, 5, 8);
        this.scene.add(this.pLight);

        // Subtle cool fill from below
        const fillLight = new THREE.DirectionalLight(0x7a9bb5, 0.25);
        fillLight.position.set(0, -5, 5);
        this.scene.add(fillLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    registerCard(card) {
        this.cards.add(card);
        card.x = card.mesh?.position.x ?? 0;
        card.y = card.mesh?.position.y ?? 0;
        card.z = 0;
        card.targetX = 0;
        card.targetY = 0;
        card.targetZ = 0;
        card.scale   = 1;
        card.targetScale = 1;
        card.rot     = 0;
        card.targetRot = 0;
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    updateCards() {
        this.cards.forEach(card => {
            // Only drive cards still in hand (not yet played)
            if (card.userData?.isPlayed) return;

            if (card.state === 'dragging') {
                card.targetZ     = 4;
                card.targetScale = 1.12;
            } else if (card.state === 'hover') {
                card.targetZ     = 2;
                card.targetScale = 1.05;
            } else {
                card.targetZ     = 0;
                card.targetScale = 1;
            }

            card.x     = this.lerp(card.x,     card.targetX,     0.14);
            card.y     = this.lerp(card.y,     card.targetY,     0.14);
            card.z     = this.lerp(card.z,     card.targetZ,     0.14);
            card.scale = this.lerp(card.scale, card.targetScale, 0.14);
            card.rot   = this.lerp(card.rot,   card.targetRot,   0.14);

            card.mesh.position.set(card.x, card.y, card.z);
            card.mesh.rotation.z = card.rot * 0.0175;
            card.mesh.scale.setScalar(card.scale);
        });
    }

    updateCamera() {
        // Subtle parallax — gentler than before, alchemy calm
        const targetY = -8.5 + this.pointer.y * 0.8;
        const targetX = this.pointer.x * 0.8;

        this.camera.position.x = this.lerp(this.camera.position.x, targetX, 0.04);
        this.camera.position.y = this.lerp(this.camera.position.y, targetY, 0.04);
        this.camera.lookAt(0, 0, 0);
    }

    transitionToBattle() {
        gsap.to(this.camera.position, {
            x: 0, y: -8.5, z: 14.5,
            duration: 2.5,
            ease: "expo.inOut"
        });
        gsap.to(this.camera.rotation, {
            x: 0.62,
            duration: 2.5,
            ease: "expo.inOut"
        });

        if (this.pLight) {
            gsap.to(this.pLight.position, {
                x: 0, y: 3, z: 8,
                duration: 2,
                ease: "power2.out"
            });
            gsap.to(this.pLight, { intensity: 3, duration: 2 });
        }
    }

    setVFX(vfx) {
        this.vfx = vfx;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        this.updateCards(delta);
        this.updateCamera();

        if (this.vfx?.update) this.vfx.update(delta);

        this.renderer.render(this.scene, this.camera);
    }
}
