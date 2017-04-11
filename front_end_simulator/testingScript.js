var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame || window.msRequestAnimationFrame || 
                       function(c) {window.setTimeout(c, 15)};
/**
   Phoria
   pho·ri·a (fôr-)
   n. The relative directions of The Eyes during binocular fixation on a given object
*/

// bind to window onload event
window.addEventListener('load', onloadHandler, false);
var bitmaps = [];
var scene = new Phoria.Scene();
var sphereList = [];

var currentX = 0;
var currentY = 2;
var currentZ = 0;
var newX = 0;
var newY = 2;
var newZ = 0;
var dX = 0;
var dY = 0;
var dZ = 0;

var speed = 0.01;
var pause = true;

function createSphere(size, x, y, z) {

   var s = Phoria.Util.generateSphere(size, 24, 48);

   var offsetPoints = [];

   for(var pointNumber = 0; pointNumber < s.points.length; pointNumber++) {
       offsetPoints.push({
           x: s.points[pointNumber].x + x,
           y: s.points[pointNumber].y + y,
           z: s.points[pointNumber].z + z
       });
   }

   return Phoria.Entity.create({
       points: offsetPoints,
       edges: s.edges,
       polygons: s.polygons,
       style: {
           diffuse: 1,
           specular: 128
       }
   });
}

function makeSphereWithValue() {
      var input = document.getElementById('values');
      var data = input.value.split(",");
      console.log("making sphere at " +  data[0] + "," + data[1] + "," + data[2]);
      newX = data[0];
      newY = data[1];
      newZ = data[2];
      dX = (newX - currentX) * speed;
      dY = (newY - currentY) * speed;
      dZ = (newZ - currentZ) * speed;
      pause = false;
      //var sphere = createSphere(parseFloat(data[0]), parseInt(data[1]), parseInt(data[2]), parseInt(data[3]));
      //sphereList.push(sphereList);
      //scene.graph.push(sphere);
}
function onloadHandler()
{
   console.log("onloadHandler");
   // get the images loading
   var loader = new Phoria.Preloader();
   for (var i=0; i<6; i++)
   {
      bitmaps.push(new Image());
      loader.addImage(bitmaps[i], 'images/texture'+i+'.png');
   }
   loader.onLoadCallback(init);
}
function init()
{
   console.log("init()");
   // get the canvas DOM element and the 2D drawing context
   var canvas = document.getElementById('canvas');
   
   // create the scene and setup camera, perspective and viewport
   scene.camera.position = {x:0.0, y:5.0, z:-15.0};
   scene.perspective.aspect = canvas.width / canvas.height;
   scene.viewport.width = canvas.width;
   scene.viewport.height = canvas.height;
   
   // create a canvas renderer
   var renderer = new Phoria.CanvasRenderer(canvas);
   
   // add a grid to help visualise camera position etc.
   var plane = Phoria.Util.generateTesselatedPlane(8,8,0,20);
   scene.graph.push(Phoria.Entity.create({
      points: plane.points,
      edges: plane.edges,
      polygons: plane.polygons,
      style: {
         drawmode: "wireframe",
         shademode: "plain",
         linewidth: 0.5,
         objectsortmode: "back"
      }
   }));


   var c = Phoria.Util.generateUnitCube();
   var cube = Phoria.Entity.create({
      points: c.points,
      edges: c.edges,
      polygons: c.polygons
   });
   for (var i=0; i<6; i++)
   {
      cube.textures.push(bitmaps[i]);
      cube.polygons[i].texture = i;
   }
   //scene.graph.push(cube);
   scene.graph.push(Phoria.DistantLight.create({
      direction: {x:0, y:-0.5, z:1}
   }));

   // added sphere
   var sphere = createSphere(0.5, 0, 2, 0);
   scene.graph.push(sphere);

   var animateX = 0.0;
   var animateY = 0.0;
   var fnAnimate = function() {
      if (!pause)
      {
         sphere.translateX(dX);
         sphere.translateY(dY);
         sphere.translateZ(dZ);

         currentX += dX;
         currentY += dY;
         currentZ += dZ;

         console.log(currentX + ", " + currentY + ", " + currentZ);
         console.log(newX + ", " + newY + ", " + newZ);
         console.log((currentX - newX) + ", " + (currentY - newY) + ", " + (currentZ - newZ));

         if ((Math.abs(currentX - newX) < 0.001) && (Math.abs(currentY - newY) < 0.001) && (Math.abs(currentZ - newZ) < 0.001)) {
            pause = true;
         } else {
            pause = false;
         }
         //sphere.translateY(0.01);
         // rotate local matrix of the cube
         // cube.rotateY(0.5*Phoria.RADIANS);
         /**
         for (var i = 0; i < sphereList.length; i++) {
            var sphereL = sphereList[i];
            sphereL.translateY(0.01);
         }
         **/
         //childCube.identity().translateY(Math.sin(Date.now() / 1000) + 3);
         
         // execute the model view 3D pipeline and render the scene
      }
               scene.modelView();
         renderer.render(scene);
      requestAnimFrame(fnAnimate);
   };
   
   // keep track of heading to generate position
   var heading = 0.0;
   var lookAt = vec3.fromValues(0,-5,15);

   /**
    * @param forward {vec3}   Forward movement offset
    * @param heading {float}  Heading in Phoria.RADIANS
    * @param lookAt {vec3}    Lookat projection offset from updated position
    */
   var fnPositionLookAt = function positionLookAt(forward, heading, lookAt) {
      // recalculate camera position based on heading and forward offset
      var pos = vec3.fromValues(
         scene.camera.position.x,
         scene.camera.position.y,
         scene.camera.position.z);
      var ca = Math.cos(heading), sa = Math.sin(heading);
      var rx = forward[0]*ca - forward[2]*sa,
          rz = forward[0]*sa + forward[2]*ca;
      forward[0] = rx;
      forward[2] = rz;
      vec3.add(pos, pos, forward);
      scene.camera.position.x = pos[0];
      scene.camera.position.y = pos[1];
      scene.camera.position.z = pos[2];

      // calcuate rotation based on heading - apply to lookAt offset vector
      rx = lookAt[0]*ca - lookAt[2]*sa,
      rz = lookAt[0]*sa + lookAt[2]*ca;
      vec3.add(pos, pos, vec3.fromValues(rx, lookAt[1], rz));

      // set new camera look at
      scene.camera.lookat.x = pos[0];
      scene.camera.lookat.y = pos[1];
      scene.camera.lookat.z = pos[2];
   }
   
   // key binding
   document.addEventListener('keydown', function(e) {
      switch (e.keyCode)
      {
          /**
         case 32: // spacebar 
            var sphere = createSphere(0.5,newX,0,0);
            newX-=1;
            scene.graph.push(sphere);
            console.log("making sphere of size 0.5 at " +  newX + ",0,0");
            break;
            **/
         case 27: // ESC
            console.log("pausing");
            pause = !pause;
            break;
           /**
         case 87: // W
            // move forward along current heading
            fnPositionLookAt(vec3.fromValues(0,0,1), heading, lookAt);
            break;
         case 83: // S
            // move back along current heading
            fnPositionLookAt(vec3.fromValues(0,0,-1), heading, lookAt);
            break;
         case 65: // A
            // strafe left from current heading
            fnPositionLookAt(vec3.fromValues(-1,0,0), heading, lookAt);
            break;
         case 68: // D
            // strafe right from current heading
            fnPositionLookAt(vec3.fromValues(1,0,0), heading, lookAt);
            break;
            
         case 37: // LEFT
            // turn left
            heading += Phoria.RADIANS*4;
            // recalculate lookAt
            // given current camera position, project a lookAt vector along current heading for N units
            fnPositionLookAt(vec3.fromValues(0,0,0), heading, lookAt);
            break;
         case 39: // RIGHT
            // turn right
            heading -= Phoria.RADIANS*4;
            // recalculate lookAt
            // given current camera position, project a lookAt vector along current heading for N units
            fnPositionLookAt(vec3.fromValues(0,0,0), heading, lookAt);
            break;
         case 38: // UP
            lookAt[1]++;
            fnPositionLookAt(vec3.fromValues(0,0,0), heading, lookAt);
            break;
         case 40: // DOWN
            lookAt[1]--;
            fnPositionLookAt(vec3.fromValues(0,0,0), heading, lookAt);
            break;
            **/
      }
   }, false);

   /*
   KEY:
   {
      SHIFT:16, CTRL:17, ESC:27, RIGHT:39, UP:38, LEFT:37, DOWN:40, SPACE:32,
      A:65, E:69, G:71, L:76, P:80, R:82, S:83, Z:90
   },
   */

   // add GUI controls
   var gui = new dat.GUI();
   var f = gui.addFolder('Perspective');
   f.add(scene.perspective, "fov").min(5).max(175);
   f.add(scene.perspective, "near").min(1).max(100);
   f.add(scene.perspective, "far").min(1).max(1000);
   f = gui.addFolder('Camera LookAt');
   f.add(scene.camera.lookat, "x").min(-100).max(100);
   f.add(scene.camera.lookat, "y").min(-100).max(100);
   f.add(scene.camera.lookat, "z").min(-100).max(100);
   f = gui.addFolder('Camera Position');
   f.add(scene.camera.position, "x").min(-100).max(100);
   f.add(scene.camera.position, "y").min(-100).max(100);
   f.add(scene.camera.position, "z").min(-100).max(100);
   f = gui.addFolder('Camera Up');
   f.add(scene.camera.up, "x").min(-10).max(10).step(0.1);
   f.add(scene.camera.up, "y").min(-10).max(10).step(0.1);
   f.add(scene.camera.up, "z").min(-10).max(10).step(0.1);

   // start animation
   requestAnimFrame(fnAnimate);
}