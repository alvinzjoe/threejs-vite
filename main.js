import './style.css';

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("app")
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z=30;

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: "#ff6347"});
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

const geometryBox = new THREE.BoxGeometry(5, 5);
const materialBox = new THREE.MeshStandardMaterial({color: "green"});
const meshBox = new THREE.Mesh(geometryBox, materialBox);
meshBox.position.set(-20, 10, 0)
meshBox.rotateY(-90);
scene.add(meshBox);

const geometrySphere = new THREE.SphereGeometry( 2, 58, 30 ); 
const materialSphere = new THREE.MeshStandardMaterial( { color: "blue", wireframe: false} ); 
const sphere = new THREE.Mesh( geometrySphere, materialSphere ); 
sphere.position.set(5,0,15)
scene.add( sphere );

const video = document.getElementById( 'video' );
video.play();
const videoTexture = new THREE.VideoTexture( video );
videoTexture.colorSpace = THREE.SRGBColorSpace;
const planeGeometry = new THREE.PlaneGeometry(16, 9);
const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.position.set(25, 4.5, 0)
scene.add(plane);

const pointLight = new THREE.PointLight("#ffffff", 100);
pointLight.position.set(0,0,0)

const pointLightBlack = new THREE.PointLight("yellow", 100);
pointLightBlack.position.set(5,1,20)

const ambientLight = new THREE.AmbientLight("#ffffff");
scene.add(ambientLight, pointLight, pointLightBlack);

const lightHelper = new THREE.PointLightHelper(pointLightBlack);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

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
                                ;(gltf).animations[0].tracks.shift() //delete the specific track that moves the object forward while running
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

  renderer.render(scene, camera);

  // Update the position of the mesh based on its velocity
  meshBox.position.add(velocity);

  if (meshBox.position.x >= 1) {
    velocity.x = -0.02; // Reverse direction
  } else if (meshBox.position.x <= -1) {
    velocity.x = 0.02; // Reverse direction
  }
}

animate();