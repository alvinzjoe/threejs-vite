import './style.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { InteractionManager } from 'three.interactive';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("app")
});
renderer.xr.enabled = true;

document.body.appendChild(VRButton.createButton(renderer));

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 30;

const interactionManager = new InteractionManager(
    renderer,
    camera,
    renderer.domElement
);


const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: "#ff6347" });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

const geometryBox = new THREE.BoxGeometry(5, 5);
const materialBox = new THREE.MeshStandardMaterial({ color: "green" });
const meshBox = new THREE.Mesh(geometryBox, materialBox);
meshBox.position.set(-20, 10, 0)
meshBox.rotateY(-90);
scene.add(meshBox);
interactionManager.add(meshBox);
meshBox.addEventListener('click', (event) => {
    console.log("box clicked");
});

const geometrySphere = new THREE.SphereGeometry(2, 58, 30);
const materialSphere = new THREE.MeshStandardMaterial({ color: "blue", wireframe: false });
const sphere = new THREE.Mesh(geometrySphere, materialSphere);
sphere.position.set(5, 0, 15)
scene.add(sphere);

const video = document.getElementById('video');
video.play();
const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;
const planeGeometry = new THREE.PlaneGeometry(16, 9);
const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(25, 4.5, 0)
scene.add(plane);

const pointLight = new THREE.PointLight("#ffffff", 100);
pointLight.position.set(0, 0, 0)

const pointLightBlack = new THREE.PointLight("yellow", 100);
pointLightBlack.position.set(5, 1, 20)

const ambientLight = new THREE.AmbientLight("#ffffff");
scene.add(ambientLight, pointLight, pointLightBlack);

const lightHelper = new THREE.PointLightHelper(pointLightBlack);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;




const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove(event) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

//GLTF
const gui = new GUI()
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

let mixer
let modelReady = false
const animationActions = []
let activeAction
let lastAction
const gltfLoader = new GLTFLoader()

gltfLoader.load(
    'models/vanguard.glb',
    (gltf) => {
        // gltf.scene.scale.set(.01, .01, .01)

        mixer = new THREE.AnimationMixer(gltf.scene)

        const animationAction = mixer.clipAction((gltf).animations[0])
        animationActions.push(animationAction)
        animationsFolder.add(animations, 'default')
        activeAction = animationActions[0]

        scene.add(gltf.scene)

        //add an animation from another file
        gltfLoader.load(
            'models/vanguard@samba.glb',
            (gltf) => {
                console.log('loaded samba')
                const animationAction = mixer.clipAction(
                    (gltf).animations[0]
                )
                animationActions.push(animationAction)
                animationsFolder.add(animations, 'samba')

                //add an animation from another file
                gltfLoader.load(
                    'models/vanguard@bellydance.glb',
                    (gltf) => {
                        console.log('loaded bellydance')
                        const animationAction = mixer.clipAction(
                            (gltf).animations[0]
                        )
                        animationActions.push(animationAction)
                        animationsFolder.add(animations, 'bellydance')

                        //add an animation from another file
                        gltfLoader.load(
                            'models/vanguard@goofyrunning.glb',
                            (gltf) => {
                                console.log('loaded goofyrunning')
                                    ; (gltf).animations[0].tracks.shift() //delete the specific track that moves the object forward while running
                                const animationAction = mixer.clipAction(
                                    (gltf).animations[0]
                                )
                                animationActions.push(animationAction)
                                animationsFolder.add(animations, 'goofyrunning')

                                modelReady = true
                            },
                            (xhr) => {
                                console.log(
                                    (xhr.loaded / xhr.total) * 100 + '% loaded'
                                )
                            },
                            (error) => {
                                console.log(error)
                            }
                        )
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },
                    (error) => {
                        console.log(error)
                    }
                )
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const animations = {
    default: function () {
        setAction(animationActions[0])
    },
    samba: function () {
        setAction(animationActions[1])
    },
    bellydance: function () {
        setAction(animationActions[2])
    },
    goofyrunning: function () {
        setAction(animationActions[3])
    },
}

const setAction = (toAction) => {
    if (toAction != activeAction) {
        lastAction = activeAction
        activeAction = toAction
        //lastAction.stop()
        lastAction.fadeOut(1)
        activeAction.reset()
        activeAction.fadeIn(1)
        activeAction.play()
    }
}
const clock = new THREE.Clock()
//GLTF
const velocity = new THREE.Vector3(0.2, 0, 0); // Adjust the values to control the speed and direction.

function animate() {
    requestAnimationFrame(animate);

    torus.rotation.x += 0.005;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.005;

    controls.update();

    if (modelReady) mixer.update(clock.getDelta())

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        // console.log(intersects);
        // intersects[i].object.material.color.set(0xff0000);

    }

    renderer.render(scene, camera);

    // Update the position of the mesh based on its velocity
    meshBox.position.add(velocity);

    if (meshBox.position.x >= 1) {
        velocity.x = -0.02; // Reverse direction
    } else if (meshBox.position.x <= -1) {
        velocity.x = 0.02; // Reverse direction
    }
};

renderer.setAnimationLoop(function () {

    renderer.render(scene, camera);

});

animate();

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        // Move the character forward
        console.log('arrow up')
    }
    // Add more key-based interactions as needed
});

window.addEventListener('pointermove', onPointerMove);

let xrSession = null;
let xrReferenceSpace = null;
let xrButton = document.getElementById('VRButton2');
xrContainer.appendChild(renderer.domElement);

// Function to handle XR session initiation
async function onXRButtonClick() {
    if (!xrSession) {
        try {
            xrSession = await navigator.xr.requestSession('immersive-vr', {
                requiredFeatures: ['local'],
            });

            xrSession.addEventListener('end', onXRSessionEnd);

            xrReferenceSpace = await xrSession.requestReferenceSpace('local');

            // Set up XRWebGLLayer for rendering to the XR device
            const xrLayer = new XRWebGLLayer(xrSession, renderer);
            xrSession.updateRenderState({ baseLayer: xrLayer });

            // Enter the XR session
            await xrSession.requestAnimationFrame(onXRFrame);
            await xrSession.requestReferenceSpace('local');
            await xrSession.end();
        } catch (error) {
            console.error('Failed to start XR session:', error);
        }
    } else {
        xrSession.end();
    }
}

// Function to handle XR frames
function onXRFrame(time, frame) {
    const pose = frame.getViewerPose(xrReferenceSpace);
    if (pose) {
        // Update your Three.js scene based on XR pose and input
        // Render your scene
        renderer.render(scene, camera, pose.views[0].viewMatrix, pose.views[0].projectionMatrix);
    }

    xrSession.requestAnimationFrame(onXRFrame);
}

// Function to handle XR session end
function onXRSessionEnd() {
    xrSession = null;
    xrButton.textContent = 'Enter XR';
}

// Add a click event listener to trigger the XR session
xrButton.addEventListener('click', onXRButtonClick);