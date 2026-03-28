/**
 * ALCHEMY CLASH: INPUT SYSTEM
 * Single source of truth for drag & drop. Desktop + touch.
 * Communicates only with DuelManager.tryPlayCard().
 */

import * as THREE from 'three';

export class InputSystem {
    constructor(engine, duelMgr) {
        this.engine   = engine;
        this.duelMgr  = duelMgr;
        this.enabled  = false;

        this.raycaster    = new THREE.Raycaster();
        this.mouse        = new THREE.Vector2();
        this.dragPlane    = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.intersection = new THREE.Vector3();
        this.offset       = new THREE.Vector3();
        this.originalPos  = new THREE.Vector3();

        this.selectedCard = null;
        this.isDragging   = false;

        this.initEvents();
    }

    initEvents() {
        const opt = { passive: false };

        // Desktop
        window.addEventListener('mousedown',  e => this.onDown(e), opt);
        window.addEventListener('mousemove',  e => this.onMove(e), opt);
        window.addEventListener('mouseup',    e => this.onUp(e),   opt);

        // Touch
        window.addEventListener('touchstart', e => this.onDown(e.touches[0]),        opt);
        window.addEventListener('touchmove',  e => this.onMove(e.touches[0]),        opt);
        window.addEventListener('touchend',   e => this.onUp(e.changedTouches[0]),   opt);
    }

    updateMouse(e) {
        this.mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    getCardHit() {
        this.raycaster.setFromCamera(this.mouse, this.engine.camera);
        const hits = this.raycaster.intersectObjects(this.engine.scene.children, true);

        for (const hit of hits) {
            const obj = hit.object;
            // Support both direct mesh and parent-group cards
            if (obj.userData?.type === 'CARD')        return obj;
            if (obj.parent?.userData?.type === 'CARD') return obj.parent;
        }
        return null;
    }

    onDown(e) {
        if (!this.enabled || this.duelMgr.isRevealing) return;

        this.updateMouse(e);
        const card = this.getCardHit();

        if (card && card.userData.owner === 'PLAYER' && !card.userData.isPlayed) {
            this.selectedCard = card;
            this.isDragging   = true;

            this.originalPos.copy(card.position);

            if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)) {
                this.offset.copy(this.intersection).sub(card.position);
            }

            card.state = 'dragging';
            if (this.duelMgr.audio) this.duelMgr.audio.play('SNAP', 0.15);
        }
    }

    onMove(e) {
        if (!this.isDragging || !this.selectedCard) return;
        if (e.preventDefault) e.preventDefault();

        this.updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.engine.camera);

        if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)) {
            const newPos = this.intersection.clone().sub(this.offset);
            this.selectedCard.position.x = newPos.x;
            this.selectedCard.position.y = newPos.y;
            this.selectedCard.position.z = 2.5;

            // Organic tilt on drag
            this.selectedCard.rotation.z = (newPos.x - this.originalPos.x) * -0.04;
            this.selectedCard.rotation.x = (newPos.y - this.originalPos.y) *  0.025;
        }

        // Lane proximity highlight
        this.duelMgr.lanes.forEach(lane => {
            const dist = this.selectedCard.position.distanceTo(lane.position);
            const inRange = dist < 2.5 && lane.userData.pCards < 4;
            gsap.to(lane.material, {
                opacity:  inRange ? 0.5 : 0.25,
                duration: 0.2
            });
        });
    }

    onUp(e) {
        if (!this.selectedCard) return;

        const success = this.duelMgr.tryPlayCard(this.selectedCard);

        if (!success) {
            // Return card to hand position
            gsap.to(this.selectedCard.position, {
                x: this.originalPos.x,
                y: this.originalPos.y,
                z: this.originalPos.z,
                duration: 0.35,
                ease: 'power2.out'
            });
            gsap.to(this.selectedCard.rotation, { x: 0, z: 0, duration: 0.3 });
        }

        // Reset lane highlights
        this.duelMgr.lanes.forEach(lane => {
            gsap.to(lane.material, { opacity: 0.25, duration: 0.2 });
        });

        this.selectedCard.state = 'idle';
        this.selectedCard       = null;
        this.isDragging         = false;
    }
}
