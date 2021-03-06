import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
let container, controls;
let camera, scene, renderer;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let intersects=[];
let intersected={object:null,color:null,point:null};
let clicked={object:null,position:new THREE.Vector3()};
let clicktrigger=false;
let field=undefined;
let bug=undefined;
let stats = Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 50 );
    camera.layers.enable( 1 );
    camera.position.set( 7, 7, -7);
    camera.lookAt(0,0,0);
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x666666 );
    loadgltf('box.glb');
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'mousedown', onMouseDown, false );
    window.addEventListener( 'mouseup', onMouseUp, false );
    window.addEventListener( 'resize', onWindowResize, false );
    controls=new OrbitControls(camera, renderer.domElement );
}

function animate(){
    stats.begin();
    requestAnimationFrame( animate );
    render();
    stats.end();
}
function render() {
    if(scene.children[0]!==undefined&&field===undefined){
        field=scene.getObjectByName("field",true);
    }
    if(scene.children[0]!==undefined&&bug===undefined){
        bug=scene.getObjectByName("bug",true);
    }
    raycaster.setFromCamera( mouse, camera );
    if(scene.children[0]!==undefined){
        intersects = raycaster.intersectObjects(scene.children[0].children);
        //console.log(intersected.object);
    }
    if ( intersects.length > 0 ) {
        if(intersected.object!=null){
            intersected.object.material.color.setHex( intersected.color );
        }
        intersected.object = intersects[0].object;
        intersected.color = intersects[0].object.material.color.getHex();
        intersected.point = intersects[0].point;
    }
    else{
        if(intersected.object!==null){
            intersected.object.material.color.set(intersected.color);
        }
        intersected.object = null;
        intersected.color = null;
        intersected.point = null;
    }
    if(intersected.object!==null){
        if(clicktrigger===true && intersected.object.name==="field"){
            let position=intersected.point;
            bug.lookAt(position);
            let bugposition=bug.position;
            let vector=position.sub(bugposition);
            vector.normalize(vector);
            bug.position.copy(bug.position.add(vector.multiplyScalar(0.01)));
        }
    }
    console.log(controls.enabled);
    renderer.render( scene, camera );
}
function onMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    controls.saveState ();

}
function onMouseDown(event){
    clicktrigger=true;
    if(intersected.object!==null && intersected.object.name==="button")
    {
        clicked.object=intersected.object;
        clicked.position.copy(clicked.object.position);
        console.log(clicked.position);
        clicked.object.position.set(clicked.position.x,clicked.position.y-0.2,clicked.position.z);
        console.log("down_triggered");
    }
    if(intersected.object!==null && intersected.object.name==="field"){
        controls.saveState ();
        controls.enabled=false;
    }
}
function onMouseUp(event){
    controls.reset();
    controls.enabled=true;
    clicktrigger=false;
    if(clicked.object!==null){
        console.log(clicked.position);
        clicked.object.position.copy(clicked.position);
        clicked.object=null;
        clicked.position=new THREE.Vector3();
        console.log("up_triggered");
    }   
}
function onKeyDown(event){
    switch ( event.keyCode ) {
        case 32: // space
            controls.enabled=false;
            break;
    }
}
function onKeyUp(event){
    switch ( event.keyCode ) {
        case 32: // space
            controls.enabled=true;
            controls.update();
            break;
    }
}
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}
function loadgltf(address){
    let loader = new GLTFLoader().setPath( '' );
    loader.load(address,function(gltf){
        scene.add( gltf.scene );
    });
    //field=scene.getObjectByName("field",true);
    console.log("loaded");
}




init();
animate();