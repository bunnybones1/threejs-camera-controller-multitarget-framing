var modes = {
	CROP_TO_FIT: 1,
	SCALE_TO_FIT: 2,
}

function MultitargetFramer(camera, targetPoints, domSize, mode) {
	var camera = camera;
	camera.setViewOffset(1, 1, 0, 0, 1, 1);
	var targetPoints = targetPoints;
	var frameSize = {
		x: domSize.x,
		y: domSize.y
	};

	var _mode = mode || modes.SCALE_TO_FIT;
	var _aspect = frameSize.x / frameSize.y;

	var targetAverage = new THREE.Vector3();
	var targetPointsTotal = targetPoints.length;

	var frameMargin = this.frameMargin = new THREE.Vector2(.25, .25);

	var _screenspaceBounds = new THREE.Box2();
	var _screenspaceTargetPoint = new THREE.Vector3();
	var _screenspaceSize;
	var _screenspaceOffset;

	var _oldX, _oldY, _oldWidth, _oldHeight;
	var evalulation;
	function update() {
		_oldX = camera.x;
		_oldY = camera.y;
		_oldWidth = camera.width;
		_oldHeight = camera.height;
		targetAverage.set(0, 0, 0);
		for (var i = targetPointsTotal - 1; i >= 0; i--) {
			targetAverage.add(targetPoints[i]);
		};
		targetAverage.multiplyScalar(1 / targetPointsTotal);
		// camera.updateMatrix();
		// camera.updateMatrixWorld();
		// camera.updateProjectionMatrix();
		camera.lookAt(targetAverage);
		camera.updateMatrix();
		camera.updateMatrixWorld();

		_screenspaceBounds.makeEmpty();
		for (var i = targetPointsTotal - 1; i >= 0; i--) {
			_screenspaceTargetPoint.copy(targetPoints[i]);
			_screenspaceTargetPoint.project( camera );
			_screenspaceBounds.expandByPoint(_screenspaceTargetPoint);
		}
		// _screenspaceBounds.expandByVector(frameMargin);
		_screenspaceSize = _screenspaceBounds.size();
		// _screenspaceSize = _screenspaceBounds.size();
		var aspect = camera.width / camera.height;
		aspect /= _aspect;
		aspect *= _screenspaceSize.x / _screenspaceSize.y;
		_screenspaceOffset = _screenspaceBounds.center();
		_screenspaceBounds.min.sub(_screenspaceOffset);
		_screenspaceBounds.max.sub(_screenspaceOffset);
		_screenspaceSize.multiply(frameMargin);
		_screenspaceBounds.min.sub(_screenspaceSize);
		_screenspaceBounds.max.add(_screenspaceSize);
		switch(_mode) {
			case modes.CROP_TO_FIT:
				if(1 > aspect) {
					_screenspaceBounds.min.y /= aspect;
					_screenspaceBounds.max.y /= aspect;
				} else {
					_screenspaceBounds.min.x *= aspect;
					_screenspaceBounds.max.x *= aspect;
				}
				break;
			case modes.SCALE_TO_FIT:
				if(1 > aspect) {
					_screenspaceBounds.min.x /= aspect;
					_screenspaceBounds.max.x /= aspect;
				} else {
					_screenspaceBounds.min.y *= aspect;
					_screenspaceBounds.max.y *= aspect;
				}
				break;
		}
		_screenspaceBounds.min.add(_screenspaceOffset);
		_screenspaceBounds.max.add(_screenspaceOffset);
		_screenspaceSize = _screenspaceBounds.size();
		camera.setViewOffset(
			1, 
			1, 
			camera.x + (_screenspaceBounds.min.x * .5 + .5) * camera.width,
			1 - (camera.y + (camera.height - (_screenspaceBounds.min.y * .5 + .5) * camera.height)),
			camera.width * (_screenspaceSize.x * .5),
			camera.height * (_screenspaceSize.y * .5)
		);
		evalulation = (
			Math.abs(camera.x - _oldX) + 
			Math.abs(camera.y - _oldY) + 
			Math.abs(camera.width - _oldWidth) * 10 +
			Math.abs(camera.height - _oldHeight) * 10
		);
		return evalulation
	}
	function updateSize(w, h){
		frameSize.x = w;
		frameSize.y = h;
		_aspect = w / h;
	}
	this.update = update;
	this.updateSize = updateSize;
}

MultitargetFramer.modes = modes;
module.exports = MultitargetFramer;