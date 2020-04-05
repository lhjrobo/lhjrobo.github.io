var framerate=60;
var dt=1/framerate;
var particles=[];
var planes=[];
var meshMap=new WeakMap;
class particle
{
    constructor() 
    {
        this.position=new THREE.Vector3();
        this.velocity=new THREE.Vector3();
        this.force=new THREE.Vector3();
        this.mass=1;
        this.accel=this.force.divideScalar(this.mass);
        this.connectivity=[];
    }
    setPosition(a)
    {
        this.position=a;
    }
    setVelocity(a)
    {
        this.velocity=a;
    }
    setForce(a)
    {
        this.force=a;
    }
    addPosition(a)
    {
        var positionbuffer=this.position;
        this.force=positionbuffer.add(a);
    }
    addVelocity(a)
    {
        var velocitybuffer=this.velocity;
        this.force=velocitybuffer.add(a);
    }
    addForce(a)
    {
        var forcebuffer=this.force;
        this.force=forcebuffer.add(a);
    }
    addConnectivity(index)
    {
        if( this.connectivity.indexOf(index) == -1)
        {
            this.connectivity.push(index);
        }
    }
    removeConnectivity(index)
    {
        if( this.connectivity.indexOf(index) != -1)
        {
            this.connectivity.splice(this.connectivity.indexOf(index), 1);
        }
    }
}
class plane
{
    constructor()
    {
        this.position=new THREE.Vector3();
        this.normal=new THREE.Vector3();
    }
}

function step()
{
    for(var p of particles)
    {
        p.addVelocity(p.accel.multiplyScalar(dt));
        p.addPosition(p.velocity.multiplyScalar(dt));
    }
}
