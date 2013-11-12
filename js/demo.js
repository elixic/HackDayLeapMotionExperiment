$(document).ready(function () {    
    var mouseX = 0, mouseY = 0,

    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,

    SEPARATION = 200,
    AMOUNTX = 10,
    AMOUNTY = 10,

    camera, scene, renderer, projector,
    objects = [], objectControls = [], leapControls,
    coords1, coords2, coords3,
    selectedNode,
    spriteCanvas, spriteContext, spriteTexture, spriteMaterial, sprite, spriteName, spriteMetrics, spriteGeom,
    cursor = $('#cursor');

    init();

    function init() {

        var container, 
            separation = 100, 
            amountX = 50, 
            amountY = 50,
            origin;
        
        // container
        container = document.createElement('div');
        document.body.appendChild(container);
      
        // renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // camera
        camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, .1, 10000);
        camera.position.set(0, 300, -6000);
        origin = new THREE.Vector3(0, 0, 0);
        camera.lookAt(origin);

        // LEAP controls
        leapControls = new THREE.LeapCameraControls(camera);
        
        leapControls.rotateEnabled  = true;
        leapControls.rotateSpeed    = 8;
        leapControls.rotateHands    = 1;
        leapControls.rotateFingers  = [2, 3];

        leapControls.zoomEnabled    = true;
        leapControls.zoomSpeed      = 8;
        leapControls.zoomHands      = 1;
        leapControls.zoomFingers    = [4, 5];
        leapControls.zoomMin        = -6000;
        leapControls.zoomMax        = 6000;

        // leapControls.panEnabled     = true;
        // leapControls.panSpeed       = 6;
        // leapControls.panHands       = 2;
        // leapControls.panFingers     = [6, 12];
        // leapControls.panRightHanded = false;
      
        // world
        scene = new THREE.Scene();
        
        // projector
        projector = new THREE.Projector();

        //camera coordinate system
        coords1 = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 75, 0xcccccc);
        coords2 = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, 75, 0xcccccc);
        coords3 = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 75, 0xcccccc);
        scene.add(coords1);
        scene.add(coords2);
        scene.add(coords3);
        
        // world coordinate system (thin dashed helping lines)
        var lineGeometry = new THREE.Geometry();
        var vertArray = lineGeometry.vertices;
        vertArray.push(new THREE.Vector3(1000, 0, 0), origin, new THREE.Vector3(0, 1000, 0), origin, new THREE.Vector3(0, 0, 1000));
        lineGeometry.computeLineDistances();
        var lineMaterial = new THREE.LineDashedMaterial({
            color: 0xcccccc, 
            dashSize: 1, 
            gapSize: 2
        });
        var coords = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(coords);
                   
        // light
        light = new THREE.PointLight(0xaaaaaa);
        light.position = camera.position;
        scene.add(light);

        // build graph
        buildGraph();
        
        // tooltip sprites
        // spriteCanvas = document.createElement('canvas');
        // spriteContext = spriteCanvas.getContext('2d');
        // spriteContext.font = "Bold 20px Arial";
        // spriteContext.fillStyle = "rgba(0,0,0,0.95)";
        // spriteTexture = new THREE.Texture(spriteCanvas) 
        // spriteMaterial = new THREE.SpriteMaterial({ 
            // map: spriteTexture, 
            // useScreenCoordinates: true, 
            // alignment: THREE.SpriteAlignment.topLeft 
        // });
        // sprite = new THREE.Sprite(spriteMaterial);
        // sprite.scale.set(200,100,1.0);
        // scene.add(sprite);
      
        Leap.loop(function(frame) {
            showCursor(frame);
            selectedNode = checkCursor(frame);

            if (selectedNode) {
                // spriteName = selectedNode.object.name;
                // spriteGeom = selectedNode.object.geometry;
                // spriteContext.fillText(spriteName, 0, 20);
                // sprite.position.set(spriteGeom.x,spriteGeom.y,spriteGeom.z);
                // spriteTexture.needsUpdate = true;
                cursor.html(selectedNode.object.name);
                cursor.width('200');
                selectedNode.object.material.color.setHex(0xCC0000);
            } else {
                // spriteContext.clearRect(0,0,300,300);
                // spriteTexture.needsUpdate = true;
                
                cursor.html('');
                cursor.width('24');
                resetNodes();
                leapControls.update(frame);

                coords1.position = leapControls.target;
                coords2.position = leapControls.target;
                coords3.position = leapControls.target;
                light.position = camera.position;
            }
            render();
        });
    }
    
    function resetNodes () {
        for (var i = 0; i < objects.length; i++) {
            objects[i].material.color.setHex(0xcccccc);
        }
    }
    
    function buildGraph () {
        var geometry = new THREE.SphereGeometry(60, 20, 20, false),
            group = new THREE.Object3D(),
            mesh,
            line,
            lineSegment,
            source,
            target,
            node;
            
        for (n in gon.nodes) {
            material = new THREE.MeshLambertMaterial({
                vertexColors: THREE.FaceColors
            });
            node = gon.nodes[n];
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = node.position_x;
            mesh.position.y = node.position_y;
            mesh.position.z = node.position_z;
            mesh.rotation.x = node.rotation_x;
            mesh.rotation.y = node.rotation_y;
            mesh.name = node.name;
            //mesh.callback = function() { console.log('hai Hal!'); };
            //mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
            group.add(mesh);
            scene.add(group);
            objects.push(mesh);
        }
        scene.add(group);
        
        // Edges
        for (n in gon.edges) {
            lineSegment = new THREE.Geometry(),
            source = group.children[gon.edges[n].source - 1].position,
            target = group.children[gon.edges[n].target - 1].position;
            lineSegment.vertices.push(new THREE.Vector3( source.x, source.y, source.z ));
            lineSegment.vertices.push(new THREE.Vector3( target.x, target.y, target.z ));
            line = new THREE.Line(lineSegment, new THREE.LineBasicMaterial({ 
                color: Math.random() * 0xffffff, 
                opacity: 0.5, 
                linewidth: 5 
            }));
            scene.add(line)
        }
    }
    
    function checkCursor(frame) {
        var hLen = frame.hands.length,
            pLen = frame.pointables.length,
            pointable,
            container,
            coords,
            vector,
            ray,
            intersects;
        
        if (hLen === 1 && pLen === 1) {
            pointable = frame.pointables[0];
            container = $(renderer.domElement);
            coords = transform(pointable.tipPosition, container.width(), container.height()),
            vector = new THREE.Vector3((coords[0]/container.width()) * 2 - 1, -(coords[1]/container.height()) * 2 + 1, 0.5);
            projector.unprojectVector(vector, camera);
            ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            intersects = ray.intersectObjects(objects);
            if (intersects.length > 0) {
                return intersects[0];
            }
        }
        return null;
    }
    
    function showCursor(frame) {
        var hLen = frame.hands.length,
            pLen = frame.pointables.length,
            pointable,
            container,
            offset,
            coords;

        if (hLen == 1 && pLen == 1) {
            pointable = frame.pointables[0];
            container = $(renderer.domElement);
            offset = container.offset();
            coords = transform(pointable.tipPosition, container.width(), container.height());
            $("#cursor").css('left', offset.left + coords[0] - (($("#cursor").width() - 1)/2 + 1));
            $("#cursor").css('top', offset.top + coords[1] - (($("#cursor").height() - 1)/2 + 1));
        } else {
            $("#cursor").css('left', -1000);
            $("#cursor").css('top', -1000);
        };
    };
      
    function transform(tipPosition, w, h) {
        var width = 150,
            height = 150,
            minHeight = 100,
            ftx = tipPosition[0],
            fty = tipPosition[1],
            x, y;

        ftx = (ftx > width ? width - 1 : (ftx < -width ? -width + 1 : ftx));
        fty = (fty > 2 * height ? 2 * height - 1 : (fty < minHeight ? minHeight + 1 : fty));
        x = THREE.Math.mapLinear(ftx, -width, width, 0, w);
        y = THREE.Math.mapLinear(fty, 2 * height, minHeight, 0, h);
        return [x, y];
    };

    function render() {
      renderer.render( scene, camera );
    }
}); 