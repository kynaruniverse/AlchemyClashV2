/**
 * ALCHEMY CLASH: VFX MANAGER
 * Soft alchemy-themed particles. Dust, sparks, magical glows.
 * No neon — earth tones, golds, pastels only.
 */

import * as THREE from 'three';

export class VFXManager {
    constructor(scene) {
        this.scene       = scene;
        this.particles   = [];
        this.trails      = [];

        this.glowTexture = this.createGlowTexture();
        this.materialPool = new Map();
        this.particleGeo  = new THREE.PlaneGeometry(0.25, 0.25);
    }

    createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0,   'rgba(255,255,255,1)');
        g.addColorStop(0.3, 'rgba(255,255,255,0.6)');
        g.addColorStop(0.7, 'rgba(255,255,255,0.1)');
        g.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }

    getMaterial(color) {
        if (!this.materialPool.has(color)) {
            this.materialPool.set(color, new THREE.MeshBasicMaterial({
                map: this.glowTexture,
                color,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            }));
        }
        return this.materialPool.get(color);
    }

    /**
     * Soft magical impact — dust and sparks
     */
    createImpact(position, color = 0xc9a84c, count = 10) {
        const mat = this.getMaterial(color);

        for (let i = 0; i < count; i++) {
            const p = new THREE.Mesh(this.particleGeo, mat);
            p.position.copy(position);

            const angle = Math.random() * Math.PI * 2;
            const force = 0.04 + Math.random() * 0.08;

            p.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * force,
                Math.sin(angle) * force,
                (Math.random() - 0.5) * 0.05
            );
            p.userData.life  = 1.0;
            p.userData.decay = 0.025 + Math.random() * 0.02;

            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Legendary card trail — warm gold dust
     */
    attachLegendaryTrail(cardMesh, color = 0xc9a84c) {
        const mat   = this.getMaterial(color);
        const trail = new THREE.Mesh(this.particleGeo, mat);

        trail.userData.follow = cardMesh;
        trail.userData.life   = 1.0;
        trail.userData.decay  = 0.015 + Math.random() * 0.01;

        this.scene.add(trail);
        this.trails.push(trail);
    }

    attachEpicGlow(cardMesh, color = 0xa89cc8) {
        this.attachLegendaryTrail(cardMesh, color);
    }

    /**
     * Victory / defeat explosion — layered soft impacts
     */
    createExplosion(position, color = 0xc9a84c) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.createImpact(position, color, 20), i * 180);
        }
    }

    /**
     * Per-frame update driven by Engine3D
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.position.add(p.userData.velocity);
            p.userData.velocity.y      -= 0.001;
            p.userData.velocity.multiplyScalar(0.97);
            p.userData.life            -= p.userData.decay;
            p.scale.setScalar(Math.max(0, p.userData.life));

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.trails.length - 1; i >= 0; i--) {
            const t      = this.trails[i];
            const target = t.userData.follow;
            if (target) t.position.lerp(target.position, 0.2);

            t.userData.life -= t.userData.decay;
            t.scale.setScalar(Math.max(0, t.userData.life));

            if (t.userData.life <= 0) {
                this.scene.remove(t);
                this.trails.splice(i, 1);
            }
        }
    }
}
