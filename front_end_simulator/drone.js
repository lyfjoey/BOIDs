function Drone(id, x, y, z, r, g, b, size) {
   this.ID;
   this.address;
   this.currentX = x;
   this.currentY = y;
   this.currentZ = z;
   this.newX = 0;
   this.newY = 0;
   this.newZ = 0;
    this.r = r;
    this.g = g;
    this.b = b;
    this.size = size;
   this.dX = 0;
   this.dY = 0;
   this.dZ = 0;
   this.speed = 0.1;
   this.sphere;   
}

Drone.prototype.setCoordinate = function(x,y,z) {
   this.newX = x;
   this.newY = y;
   this.newZ = z;
   this.dX = (this.newX - this.currentX) * this.speed;
   this.dY = (this.newY - this.currentY) * this.speed;
   this.dZ = (this.newZ - this.currentZ) * this.speed;
}