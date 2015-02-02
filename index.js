function MultitargetFramer(camera, targetPoints, domSize) {
	var camera = camera;
	var targetPoints = targetPoints;
	var frameSize = {
		x: domSize.x,
		y: domSize.y
	};

	var targetAverage = new THREE.Vector3();
	var targetPointsTotal = targetPoints.length;

	this.reframeZoomSpeed = .15;
	this.reframeOffsetSpeed = .25;
	var frameMargin = this.frameMargin = new THREE.Vector2(.5, .5);

	var _fullFrame = new THREE.Vector2();
	var _zoom = 1;
	var _halfFrame = new THREE.Vector2();
	var _offset = new THREE.Vector2();
	var _topLeft = new THREE.Vector2();
	var _size = new THREE.Vector2();
	var _screenspaceBounds = new THREE.Box2();
	var _screenspaceTargetPoint = new THREE.Vector3();
	var _screenspaceSize;
	var _screenspaceOffset;

	var _oldOffsetX;
	var _oldOffsetY;
	var _oldZoom;
	var evalulation;
	function update() {
		_oldOffsetX = _offset.x;
		_oldOffsetY = _offset.y;
		_oldZoom = _zoom;
		targetAverage.set(0, 0, 0);
		for (var i = targetPointsTotal - 1; i >= 0; i--) {
			targetAverage.add(targetPoints[i]);
		};
		targetAverage.multiplyScalar(1 / targetPointsTotal);
		camera.lookAt(targetAverage);

		_screenspaceBounds.makeEmpty();
		for (var i = targetPointsTotal - 1; i >= 0; i--) {
			_screenspaceTargetPoint.copy(targetPoints[i]);
			_screenspaceTargetPoint.project( camera );
			_screenspaceBounds.expandByPoint(_screenspaceTargetPoint);
		}
		_screenspaceBounds.expandByVector(frameMargin);
		_screenspaceSize = _screenspaceBounds.size();
		_screenspaceOffset = _screenspaceBounds.center();
		_offset.x += _screenspaceOffset.x * _fullFrame.x * .5 * this.reframeOffsetSpeed;
		_offset.y -= _screenspaceOffset.y * _fullFrame.y * .5 * this.reframeOffsetSpeed;
		_zoom -= (_zoom - _zoom * (_screenspaceSize.x > _screenspaceSize.y ? _screenspaceSize.x : _screenspaceSize.y) * .5) * this.reframeZoomSpeed;
		_zoom = Math.max(.1, Math.min(5, _zoom));
		_offset.x = Math.max(-1000, Math.min(1000, _offset.x));
		_offset.y = Math.max(-1000, Math.min(1000, _offset.y));

		_fullFrame.copy(frameSize);
		_halfFrame.copy(_fullFrame).multiplyScalar(.5);
		_topLeft.copy(_halfFrame).multiplyScalar(1-_zoom).add(_offset);
		_size.copy(_fullFrame).multiplyScalar(_zoom);
		camera.setViewOffset(
			_fullFrame.x, 
			_fullFrame.y, 
			_topLeft.x,
			_topLeft.y,
			_size.x,
			_size.y
		);
		evalulation = (
			Math.abs(_offset.x - _oldOffsetX) + 
			Math.abs(_offset.y - _oldOffsetY) + 
			Math.abs(_zoom - _oldZoom) * 100
		);
		return evalulation
	}
	function updateSize(w, h){
		frameSize.x = w;
		frameSize.y = h;
	}
	this.update = update;
	this.updateSize = updateSize;
}

module.exports = MultitargetFramer;