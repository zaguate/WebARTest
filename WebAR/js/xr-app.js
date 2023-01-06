import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton'

let hitTestSource = null;
let hitTestSourceRequested = false;

function handleHitTest(renderer, frame, onHitTestResultReady, onHitTestResultEmpty) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    let xrHitPoseMatrix = null;

    if (session && hitTestSourceRequested === false) {
        //If no hit test has been requested so far
        session.requestReferenceSpace("viewer").then((referenceSpace) => {
          if (session) {
            session.requestHitTestSource({space: referenceSpace}).then((source) => {
                hitTestSource = source;
              });
          }
        });
    
        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length) {
            const hit = hitTestResults[0];
      
            if (hit && hit !== null && referenceSpace) {
              const xrHitPose = hit.getPose(referenceSpace);
      
              if (xrHitPose) {
                xrHitPoseMatrix = xrHitPose.transform.matrix;
                onHitTestResultReady(xrHitPoseMatrix);
              }
            }
          } else {
            onHitTestResultEmpty();
          }
      }
}

function createPlaneMarker() {
    const planeMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const planeMarkerGeometry = new THREE.RingGeometry(0.14, 0.15, 16).rotateX(
      -Math.PI / 2,
    );
  
    const planeMarker = new THREE.Mesh(planeMarkerGeometry, planeMarkerMaterial);
  
    planeMarker.matrixAutoUpdate = false;
  
    return planeMarker;
  };

function createScene(renderer) {
    console.log(renderer);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.02, 200);

    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    // scene.add(ambientLight)
    // const light = new THREE.PointLight(0xff0000, 1, 100);
    // light.position.set(0, 0, 0);
    // scene.add(light);

    // const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    // const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    // const box = new THREE.Mesh(boxGeometry, boxMaterial);
    // box.position.z = -3;

    // scene.add(box);

    const planeMarker = createPlaneMarker();
    scene.add(planeMarker);

    function render(timestamp, frame) {
        // box.rotation.y += 0.01;
        // box.rotation.x += 0.01;

        if(renderer.xr.isPresenting) {            
            if (frame) {
                handleHitTest(renderer, frame, (hitPoseTransformed) => {
                    if (hitPoseTransformed) {
                        planeMarker.visible = true;
                        planeMarker.matrix.fromArray(hitPoseTransformed);
                    }
                }, () => {planeMarker.visible = false;} )
            }
            renderer.render(scene, cam);            
        }
    }

    renderer.setAnimationLoop(render);
}


const { devicePixelRatio, innerHeight, innerWidth } = window;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

renderer.xr.enabled = true;
document.body.appendChild( renderer.domElement );

document.body.appendChild(ARButton.createButton(
    renderer,
    { requiredFeatures: ["hit-test"] },
  ));

createScene(renderer);