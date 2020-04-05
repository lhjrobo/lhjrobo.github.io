/**
 * @author mrdoob / http://mrdoob.com/
 */

function compose( position, quaternion, array, index ) {

	var x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
	var x2 = x + x,	y2 = y + y, z2 = z + z;
	var xx = x * x2, xy = x * y2, xz = x * z2;
	var yy = y * y2, yz = y * z2, zz = z * z2;
	var wx = w * x2, wy = w * y2, wz = w * z2;

	array[ index + 0 ] = ( 1 - ( yy + zz ) );
	array[ index + 1 ] = ( xy + wz );
	array[ index + 2 ] = ( xz - wy );
	array[ index + 3 ] = 0;

	array[ index + 4 ] = ( xy - wz );
	array[ index + 5 ] = ( 1 - ( xx + zz ) );
	array[ index + 6 ] = ( yz + wx );
	array[ index + 7 ] = 0;

	array[ index + 8 ] = ( xz + wy );
	array[ index + 9 ] = ( yz - wx );
	array[ index + 10 ] = ( 1 - ( xx + yy ) );
	array[ index + 11 ] = 0;

	array[ index + 12 ] = position.x;
	array[ index + 13 ] = position.y;
	array[ index + 14 ] = position.z;
	array[ index + 15 ] = 1;

}

function CannonPhysics() {

	var frameRate = 60;
	var frameTime = 1 / frameRate;
	var k=1000;
	var k2=5;
	var k3=100;
    var c=10	;
	var l=1;
	var globalgravity=10;


	var world = new CANNON.World();
	world.gravity.set( 0,-globalgravity, 0 );
	world.broadphase = new CANNON.SAPBroadphase( world );
	world.solver.iterations = 20;
	world.solver.tolerance = 0.001;
	// world.allowSleep = true;

	//

	function getShape( geometry ) {

		var parameters = geometry.parameters;

		// TODO change type to is*

		switch ( geometry.type ) {

			case 'BoxBufferGeometry':
				var halfExtents = new CANNON.Vec3();
				halfExtents.x = parameters.width !== undefined ? parameters.width / 2 : 0.5;
				halfExtents.y = parameters.height !== undefined ? parameters.height / 2 : 0.5;
				halfExtents.z = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
				return new CANNON.Box( halfExtents );

			case 'PlaneBufferGeometry':
				return new CANNON.Plane();

			case 'SphereBufferGeometry':
				var radius = parameters.radius;
				return new CANNON.Sphere( radius );
				//return new CANNON.Particle();

		}

		return null;

	}

	var meshes = [];
	var meshMap = new WeakMap();
	var indexMap = new WeakMap();
	interaction();
	function interaction()
	{
		for(var mesh of meshes)
		{
			if(indexMap.get(mesh).length==0)
			{
				var body=meshMap.get(mesh);
				body.preStep=function()
				{
					var force=new CANNON.Vec3();
					for(var mesh2 of meshes)
					{
						var body2=meshMap.get(mesh2);
						var distancevec=this.position.vsub(body2.position);
						var distance=distancevec.length();
						if(distance>0)
						{
							//console.log(distance);
							var subforce=distancevec.scale(-g/Math.pow(distance,3));
							//console.log(subforce);
							force.vadd(subforce,force);
							//console.log(force);
						}
					}
				console.log(force);
				this.force=force;
				this.force.vadd(new CANNON.Vec3(0,-globalgravity,0),this.force);
				}
				
			}
		}
	}



	function addMesh( mesh, mass = 0 ) {

		var shape = getShape( mesh.geometry );

		if ( shape !== null ) {

			if ( mesh.isInstancedMesh ) {

				handleInstancedMesh( mesh, mass, shape );

			} else if ( mesh.isMesh ) {

				handleMesh( mesh, mass, shape );

			}

		}

	}
	function addzeroMesh( mesh, mass = 0 ) {

		var shape = getShape( mesh.geometry );

		if ( shape !== null ) {

			if ( mesh.isInstancedMesh ) {

				handleInstancedMesh( mesh, mass, shape );

			} else if ( mesh.isMesh ) {

				handlezeroMesh( mesh, mass, shape );

			}

		}

	}

	function handleMesh( mesh, mass, shape ) {

		var position = new CANNON.Vec3();
		position.copy( mesh.position );

		var quaternion = new CANNON.Quaternion();
		quaternion.copy( mesh.quaternion );

		var body = new CANNON.Body( {
			position: position,
			quaternion: quaternion,
			mass: mass,
			shape: shape
		} );
        world.addBody( body );

		if ( mass > 0 ) {

			meshes.push( mesh );
			meshMap.set( mesh, body );
			var connected=[];
			indexMap.set(mesh,connected);

		}

	}
	function handlezeroMesh( mesh, mass, shape ) {

		var position = new CANNON.Vec3();
		position.copy( mesh.position );

		var quaternion = new CANNON.Quaternion();
		quaternion.copy( mesh.quaternion );

		var body = new CANNON.Body( {
			position: position,
			quaternion: quaternion,
			mass: mass,
			shape: shape
		} );
        world.addBody( body );

		meshes.push( mesh );
		meshMap.set( mesh, body );
		var connected=[];
		indexMap.set(mesh,connected);

		

	}

	function handleInstancedMesh( mesh, mass, shape ) {

		var array = mesh.instanceMatrix.array;

		var bodies = [];

		for ( var i = 0; i < mesh.count; i ++ ) {

			var index = i * 16;

			var position = new CANNON.Vec3();
			position.set( array[ index + 12 ], array[ index + 13 ], array[ index + 14 ] );

			var body = new CANNON.Body( {
				position: position,
				mass: mass,
				shape: shape
			} );
			world.addBody( body );

			bodies.push( body );

		}

		if ( mass > 0 ) {

			mesh.instanceMatrix.setUsage( 35048 ); // THREE.DynamicDrawUsage = 35048
			meshes.push( mesh );

			meshMap.set( mesh, bodies );

		}

	}

	//

	function setMeshPosition( mesh, position, index = 0 ) {

		if ( mesh.isInstancedMesh ) {

			var bodies = meshMap.get( mesh );
			bodies[ index ].position.copy( position );

		} else if ( mesh.isMesh ) {

			var body = meshMap.get( mesh );
			body.position.copy( position );

		}

    }
    function addForce(index)
    {
		var connectivityindex=indexMap.get(meshes[index]);
		//console.log(connectivityindex.length);
		if(connectivityindex.length>0)
		{
			//connectedinteraction(index);
		}
		else
		{
			nonconnectedinteraction(index);
		}
		
	}
		
	
	function connectivitysearch(index)
	{
		for(var i=0; i<meshes.length; i++)
        {
            if(i!=index)
            {
				if(indexMap.get(meshes[index]).indexOf(i)==-1 && meshes[index].position.distanceTo(meshes[i].position)<l /*&& indexMap.get(meshes[index]).length<4*/)
				{
					indexMap.get(meshes[index]).push(i);
				
					var lock= new CANNON.DistanceConstraint(meshMap.get(meshes[index]),meshMap.get(meshes[i]),l);
					world.addConstraint(lock);
				}
            }
        }
	}
	
    function addVec(a,b)
    {
        var sum=new CANNON.Vec3(a.x+b.x,a.y+b.y,a.z+b.z);
        return sum;
    }
    function subVec(a,b)
    {
        var sub=new CANNON.Vec3(a.x-b.x,a.y-b.y,a.z-b.z);
        return sub;
	}
	function connectedinteraction(index)
	{
		var body=meshMap.get(meshes[index]);
		var primaryconnect=indexMap.get(meshes[index]);
		var velocity=new CANNON.Vec3(0,0,0);
		var trees=[];
		for(var i of primaryconnect)
		{
			var secondaryconnect=indexMap.get(meshes[i]);
			for(var j of secondaryconnect)
			{
				if(j!=index)
				{
					var tree=[];
					tree.push(index);
					tree.push(i);
					tree.push(j);
					trees.push(tree);
				}
			}
		}
		for(var triplet of trees)
		{
			var x0=meshMap.get(meshes[triplet[0]]).position;
			var x1=meshMap.get(meshes[triplet[1]]).position;
			var x2=meshMap.get(meshes[triplet[2]]).position;
			var a=subVec(x0,x1);
			var b=subVec(x1,x2);
			var p=a.dot(b)/a.dot(a);
			var c=subVec(b,a.scale(p)).normalize();
			var angle=Math.PI-Math.acos(-a.dot(b)/(a.length()*b.length()));
			console.log(angle*180/Math.PI);
			c.scale(angle*k3);
			velocity.vadd(c);
		}
		//body.applyForce(velocity,body.position);
		body.force=velocity;
	}
	function nonconnectedinteraction(index)
	{
		var body1=meshMap.get(meshes[index]);
		for(var i=0;i<meshes.length;i++)
		{
			if(i!=index)
			{
				var body2=meshMap.get(meshes[i]);
				var force=new CANNON.Vec3(0,0,0);
				var direction=subVec(body1.position,body2.position);
				var velocity=subVec(body1.velocity,body2.velocity);
				var distance=direction.length();
				var attractor=direction.scale(-k2/distance);
				body1.velocity=attractor;
			}
		}
	}
	function limitspeed(maxspeed)
	{
		for( var i = 0, l = meshes.length; i < l; i ++ )
		{
			var speed=meshMap.get(meshes[i]).velocity.length();
			if(speed>maxspeed)
			{
				var speedlimit=meshMap.get(meshes[i]).velocity.scale(maxspeed/speed);
				meshMap.get(meshes[i]).velocity=speedlimit;
			}
		}
	}
	//
	var lastTime = 0;

	function step() {
		//limitspeed(1);
		var time = performance.now();

		if ( lastTime > 0 ) {

			var delta = ( time - lastTime ) / 1000;

			// console.time( 'world.step' );
			world.step( frameTime, delta, frameRate );
			// console.timeEnd( 'world.step' );

		}

		lastTime = time;
		//

		for ( var i = 0, l = meshes.length; i < l; i ++ ) {

			var mesh = meshes[ i ];
			//addForce(i);
			connectivitysearch(i);
			if ( mesh.isInstancedMesh ) {

				var array = mesh.instanceMatrix.array;
				var bodies = meshMap.get( mesh );

				for ( var j = 0; j < bodies.length; j ++ ) {

					var body = bodies[ j ];
					compose( body.position, body.quaternion, array, j * 16 );

				}

				mesh.instanceMatrix.needsUpdate = true;

			} else if ( mesh.isMesh ) {

				var body = meshMap.get( mesh );
				mesh.position.copy( body.position );
				mesh.quaternion.copy( body.quaternion );

			}

		}
        
		//console.log("0="+indexMap.get(meshes[0]));
		//console.log("1="+indexMap.get(meshes[1]));
		//world.clearForces();
	}

	// animate

	setInterval( step, 1000 / frameRate );

	return {
		addMesh: addMesh,
        setMeshPosition: setMeshPosition,
		addForce: addForce,
		addzeroMesh:addzeroMesh
		// addCompoundMesh
	};

}

export { CannonPhysics };
