import * as THREE from 'three';
import { Mesh } from 'three';
import { Vector2 } from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';

const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshStandardMaterial({color: 0xffffff * Math.random()});
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, -2);
scene.add(cube);

const cam = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, 0.1, 1000);
cam.position.set(0, 2, 5);
cam.lookAt(new THREE.Vector3(0, 0, 0));

scene.add(cam);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true;

document.body.appendChild(renderer.domElement);
document.body.appendChild(ARButton.createButton(renderer));

renderer.setAnimationLoop(render);

function render(){
    cube.rotation.y += 0.025;
    renderer.render(scene, cam)
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    cam.aspect = sizes.width/sizes.height;
    cam.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
});