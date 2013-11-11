$(document).ready(function () {    
    var mouseX = 0, mouseY = 0,

    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,

    SEPARATION = 200,
    AMOUNTX = 10,
    AMOUNTY = 10,

    camera, controls, scene, renderer, projector,
    objects = [];

    init();
    animate();

    function init() {

      var container, separation = 100, amountX = 50, amountY = 50;

      container = document.createElement('div');
      document.body.appendChild(container);

      camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.set(0, 300, 500);
    
      controls = new THREE.OrbitControls(camera);
      controls.addEventListener('change', render);
      
      projector = new THREE.Projector();

      scene = new THREE.Scene();

      scene.add( camera );

      //renderer = new THREE.CanvasRenderer();
      renderer = new THREE.WebGLRenderer();
      //renderer = new THREE.SVGRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild( renderer.domElement );
      
        // light
        scene.add( new THREE.AmbientLight( 0x222222 ) );
                   
        // light
        light = new THREE.PointLight( 0xaaaaaa );
        light.position = camera.position;
        scene.add( light );

      // Nodes
      var geometry = new THREE.SphereGeometry( 60, 20, 20, false );
      var material = new THREE.MeshNormalMaterial();
        
      group = new THREE.Object3D();
            
      for (n in gon.nodes) {
        
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = gon.nodes[n].position_x;
        mesh.position.y = gon.nodes[n].position_y;
        mesh.position.z = gon.nodes[n].position_z;
        mesh.rotation.x = gon.nodes[n].rotation_x;
        mesh.rotation.y = gon.nodes[n].rotation_y;
        mesh.callback = function() { console.log('hai Hal!'); };
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        group.add( mesh );
        objects.push(mesh);

      }

      scene.add( group );
        
      // Edges

      for (n in gon.edges) {
        var line_segment = new THREE.Geometry(),
            source = group.children[gon.edges[n].source - 1].position,
            target = group.children[gon.edges[n].target - 1].position;
        line_segment.vertices.push( new THREE.Vector3( source.x, source.y, source.z ) );
        line_segment.vertices.push( new THREE.Vector3( target.x, target.y, target.z ) );
        var line = new THREE.Line( line_segment, new THREE.LineBasicMaterial( { color: Math.random() * 0xffffff , opacity: 0.5, linewidth: 5 } ) );

        scene.add(line)
      }
     
      //document.addEventListener( 'mousemove',  onDocumentMouseMove,  false );
      //document.addEventListener( 'touchstart', onDocumentTouchStart, false );
      //document.addEventListener( 'touchmove',  onDocumentTouchMove,  false );
      //document.addEventListener( 'keyup', onDocumentKeyUp, false);
      
      document.addEventListener('mousedown', onDocumentMouseDown, false);
    }

    //
    
    function onDocumentMouseDown (e) {
        e.preventDefault();
        
        var vector = new THREE.Vector3( 
            ( event.clientX / window.innerWidth ) * 2 - 1, 
            - ( event.clientY / window.innerHeight ) * 2 + 1, 
            0.5 );
    
        projector.unprojectVector( vector, camera );
        
        var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

        var intersects = ray.intersectObjects( objects );    

        if ( intersects.length > 0 ) {
                    
            intersects[0].object.callback();
        }
        
    }
    
    function onDocumentKeyUp(e) {
        var x = camera.position.x,
            y = camera.position.y,
            z = camera.position.z,
            rotSpeed = 30,
            zoomFactor = 20;

        if (e.which === 37){ //MH - find a way to do this in a switch statement 
            camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
            camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
        } else if (e.which === 39){
            camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
            camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
        } else if(e.which === 38){
            camera.fov *= zoomFactor;
            camera.updateProjectionMatrix();
        } else if (e.which === 40){
            camera.fov /= zoomFactor;
            camera.updateProjectionMatrix();
        }

        camera.lookAt(scene.position);
    }

    function onDocumentMouseMove(event) {

      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
      
    }

    function onDocumentTouchStart( event ) {

      if ( event.touches.length > 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;

      }

    }

    function onDocumentTouchMove( event ) {

      if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;

      }

    }

    //

    function animate() {

      requestAnimationFrame( animate );
      
      controls.update();

    }

    function render() {

      //camera.position.x += ( mouseX - camera.position.x ) * .05;
      //camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
      //camera.lookAt( scene.position );

      renderer.render( scene, camera );

    }
}); 