import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */

//Texture
const loadingManager = new THREE.LoadingManager();
loadingManager.onError = (e) => {

    console.log("error", e);
}
const textureLoader = new THREE.TextureLoader(loadingManager);
const bakeShadow  = textureLoader.load('/textures/bakedShadow.jpg');
const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg');

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight("white", 0.4)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)


directionalLight.castShadow = false;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
//directionalLight.shadow.radius = 15;

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
//scene.add(directionalLightCameraHelper);

//Spot Light

const spotLight = new THREE.SpotLight("#bda6e7", 2, 6, Math.PI * 0.15);
spotLight.position.set(2.8,3,3);
spotLight.castShadow = false;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.fov = 30;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;

scene.add(spotLight);
spotLight.target.position.set(0,0,0);
scene.add(spotLight.target);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);

//scene.add(spotLightHelper);

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(spotLightCameraHelper);
spotLightCameraHelper.visible = false;

//Point Light

const pointLight = new THREE.PointLight('white', 0.3);
pointLight.castShadow = false;
pointLight.position.set(-1,1,0);

const pointLightHelper = new THREE.PointLightHelper(pointLight);
//scene.add(pointLightHelper);

const pointLightShadowHelper = new THREE.CameraHelper(pointLight.shadow.camera);
scene.add(pointLightShadowHelper);

pointLightShadowHelper.visible = false;

pointLight.shadow.mapSize.width =1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far =  5;




scene.add(pointLight);
/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
material.metalness = 0.;

gui.add(material, 'metalness')
.min(0)
.max(1)
.step(0.001)

gui.add(material, 'roughness')
.min(0)
.max(1)
.step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({
    color: "#bda6e7",
    metalness: 0.2,
    roughness: 0.4,
  })
);
gui
.addColor(sphere.material, 'color')

sphere.castShadow = true;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

plane.receiveShadow = true;

scene.add(sphere, plane)


const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5,1.5),
    new THREE.MeshBasicMaterial({
        color: 'black',
        transparent: true,
        opacity:1,
        alphaMap: simpleShadow
    })
)

sphereShadow.position.y = plane.position.y + 0.01;
sphereShadow.rotation.x = - Math.PI * 0.5;


scene.add(sphereShadow);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap
/**
 * Animate
 */
const clock = new THREE.Clock()


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update Sphere

     sphere.position.z = Math.cos(elapsedTime*0.5)*1.6;
     sphere.position.x = Math.sin(elapsedTime*0.5)*1.6;
    sphereShadow.position.z = sphere.position.z;
    sphereShadow.position.x = sphere.position.x;
    sphere.position.y = Math.abs(Math.cos(elapsedTime*3)*1.3)

    sphere.rotation.x += 3
    sphereShadow.material.opacity = (1 - sphere.position.y)*0.9;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()