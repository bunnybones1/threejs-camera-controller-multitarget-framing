var onReady = function() {
	var View = require('threejs-managed-view').View;
	var MultitargetFramer = require('./');
	var view = new View({
		useRafPolyfill: false
	});
	view.renderManager.skipFrames = 10;
	var scene = view.scene;
	view.renderer.setClearColor(0xafffaf);

	var sphereGeometry = new THREE.SphereGeometry(1.5);
	var size = 500;
	var sizeHalf = size * .5;
	var bounds = new THREE.Box3(
		new THREE.Vector3(-sizeHalf, -sizeHalf, -sizeHalf),
		new THREE.Vector3(sizeHalf, sizeHalf, sizeHalf)
	)
	var random = new THREE.Vector3();
	var boundSize = bounds.size();
	for (var i = 0; i < 1200; i++) {
		var ball = new THREE.Mesh(sphereGeometry);
		scene.add(ball);
		random.set(
			Math.random(),
			Math.random(),
			Math.random()
		);
		ball.position.copy(bounds.min).add(random.multiply(boundSize));
	};

	var camera = view.camera;
	var margin = 1;

	var targetBoxGeometry = new THREE.BoxGeometry(40, 2, 30, 1, 1, 1);
	var targetBoxMesh = new THREE.Mesh(targetBoxGeometry);
	var targetPoints = targetBoxGeometry.vertices;
	var helperGeometry = new THREE.SphereGeometry(1, 32, 16);
	var helperMaterial = new THREE.MeshBasicMaterial({
		color: 0x2f2f00,
		transparent: true,
		depthTest: false,
		blending: THREE.AdditiveBlending
	});
	targetPoints.forEach(function(vertex){
		vertex.r = .1;
		var scale = vertex.r * 10;
		var helper = new THREE.Mesh(helperGeometry, helperMaterial);
		helper.scale.set(scale, scale, scale);
		helper.position.copy(vertex);
		scene.add(helper);
	});
	scene.add(targetBoxMesh);
	var framingController = new MultitargetFramer(
		camera, 
		targetPoints,
		view.domSize
	);

	// framingController.setState(true);

	view.onResizeSignal.add(framingController.updateSize);
	var size = view.getSize();
	framingController.updateSize(size.width, size.height);
	framingController.frameMargin.set(.1, .1);

	var camSwayDistance = 60;
	view.renderManager.onEnterFrame.add(function() {
		var time = (new Date()).getTime() * .001 * .25;
		camera.position.set(
			Math.sin(time) * camSwayDistance,
			Math.cos(time * .13) * camSwayDistance * .25,
			Math.cos(time) * camSwayDistance
		)
		var deltaScore = framingController.update();
		//this metric helps you decide whether things have changed or not. helps in deciding whether its worth a rerender or not.
		// console.log(deltaScore);
	})
}

var loadAndRunScripts = require('loadandrunscripts');
loadAndRunScripts(
	[
		'bower_components/three.js/three.js'
	],
	onReady
);