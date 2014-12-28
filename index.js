function MultitargetFramer(camera, targetPoints, domSize) {
	this.camera = camera;
	this.targetPoints = targetPoints;
	this.domSize = domSize;

	this.targetAverage = new THREE.Vector3();
	this.targetPointsTotal = this.targetPoints.length;

	//
	this.reframeZoomSpeed = .15,
	this.reframeOffsetSpeed = .25,
	this.frameMargin = new THREE.Vector2(.5, .5), 
	
	this._fullFrame = new THREE.Vector2(), 
	this._zoom = 1,
	this._halfFrame = new THREE.Vector2(), 
	this._offset = new THREE.Vector2(), 
	this._topLeft = new THREE.Vector2(), 
	this._size = new THREE.Vector2(),
	this._screenspaceBounds = new THREE.Box2(),
	this._screenspaceTargetPoint = new THREE.Vector3(),
	this._screenspaceSize,
	this._screenspaceOffset;
}

MultitargetFramer.prototype = {
	update: function() {
		this.targetAverage.set(0, 0, 0);
		for (var i = this.targetPointsTotal - 1; i >= 0; i--) {
			this.targetAverage.add(this.targetPoints[i]);
		};
		this.targetAverage.multiplyScalar(1 / this.targetPointsTotal);
		this.camera.lookAt(this.targetAverage);

		this._screenspaceBounds.makeEmpty();
		for (var i = this.targetPointsTotal - 1; i >= 0; i--) {
			this._screenspaceTargetPoint.copy(this.targetPoints[i]);
			this._screenspaceTargetPoint.project( this.camera );
			this._screenspaceBounds.expandByPoint(this._screenspaceTargetPoint);
		}
		this._screenspaceBounds.expandByVector(this.frameMargin);
		this._screenspaceSize = this._screenspaceBounds.size();
		this._screenspaceOffset = this._screenspaceBounds.center();
		this._offset.x += this._screenspaceOffset.x * this._fullFrame.x * .5 * this.reframeOffsetSpeed;
		this._offset.y -= this._screenspaceOffset.y * this._fullFrame.y * .5 * this.reframeOffsetSpeed;
		this._zoom -= (this._zoom - this._zoom * (this._screenspaceSize.x > this._screenspaceSize.y ? this._screenspaceSize.x : this._screenspaceSize.y) * .5) * this.reframeZoomSpeed;
		this._zoom = Math.max(.1, Math.min(2, this._zoom));
		this._offset.x = Math.max(-1000, Math.min(1000, this._offset.x));
		this._offset.y = Math.max(-1000, Math.min(1000, this._offset.y));

		this._fullFrame.copy(this.domSize);
		this._halfFrame.copy(this._fullFrame).multiplyScalar(.5);
		this._topLeft.copy(this._halfFrame).multiplyScalar(1-this._zoom).add(this._offset);
		this._size.copy(this._fullFrame).multiplyScalar(this._zoom);
		this.camera.setViewOffset(
			this._fullFrame.x, 
			this._fullFrame.y, 
			this._topLeft.x,
			this._topLeft.y,
			this._size.x,
			this._size.y
		);
	}
}

module.exports = MultitargetFramer;