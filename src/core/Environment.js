/**
 * ALCHEMY CLASH: ENVIRONMENT
 * Alchemy-themed 3D battle arena. Earth tones, parchment, soft glows.
 */

import * as THREE from 'three';

export class Environment {
    constructor(scene, duelMgr) {
        this.scene   = scene;
        this.duelMgr = duelMgr;

        this.particles    = [];
        this.lanePulseMap = new Map();

        this.init();
    }

    init() {
        // Warm foggy atmosphere
        this.scene.fog = new THREE.FogExp2(0x1a1208, 0.035);

        this.setupFloor();
        this.createDustParticles();
        this.createDome();
        this.animate();
    }

    setupFloor() {
        // Parchment-toned grid
        const grid = new THREE.GridHelper(60, 24, 0x8b5e3c, 0x3d2416);
        grid.rotation.x = Math.PI / 2;
        grid.position.z = -1.0;
        grid.material.transparent = true;
        grid.material.opacity = 0.12;
        this.scene.add(grid);
        this.grid = grid;
    }

    createDome() {
        const geo = new THREE.SphereGeometry(100, 32, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x0e0a04,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.95
        });
        this.scene.add(new THREE.Mesh(geo, mat));
    }

    createDustParticles() {
        // Soft floating dust motes — alchemy lab feel
        const geo = new THREE.BufferGeometry();
        const count = 400;
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            pos[i3]     = (Math.random() - 0.5) * 30;
            pos[i3 + 1] = (Math.random() - 0.5) * 20;
            pos[i3 + 2] = -5 - Math.random() * 10;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.06,
            color: 0xd4b896,
            transparent: true,
            opacity: 0.35,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.dustPoints = new THREE.Points(geo, mat);
        this.scene.add(this.dustPoints);
    }

    pulseLane(laneIndex, color = 0xc9a84c) {
        const lane = this.duelMgr?.lanes[laneIndex];
        if (!lane) return;

        if (this.lanePulseMap.has(laneIndex)) {
            this.lanePulseMap.get(laneIndex).kill();
        }

        const mat = lane.material;
        const targetColor = new THREE.Color(color);

        const pulse = gsap.to(mat.emissive, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            duration: 0.4,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut"
        });

        this.lanePulseMap.set(laneIndex, pulse);
    }

    animate() {
        const time = Date.now() * 0.0005;

        if (this.dustPoints) {
            this.dustPoints.rotation.z += 0.00008;
            // Gentle breathing opacity
            this.dustPoints.material.opacity = 0.25 + Math.sin(time) * 0.1;
        }

        if (this.grid) {
            this.grid.material.opacity = 0.08 + Math.sin(time * 0.5) * 0.04;
        }

        if (this.duelMgr?.lanes) {
            this.duelMgr.lanes.forEach((lane, i) => {
                const p = lane.userData.pPower;
                const e = lane.userData.ePower;
                if (p > e && p > 0) this.pulseLane(i, 0xc9a84c);
                if (e > p && e > 0) this.pulseLane(i, 0xc4614a);
            });
        }

        requestAnimationFrame(() => this.animate());
    }
}
