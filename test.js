var onReady = function() {
	var View = require('threejs-managed-view').View;
	var MultitargetFramer = require('./');
	var view = new View({
		useRafPolyfill: false
	});
	var scene = view.scene;

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

	var targetBoxGeometry = new THREE.BoxGeometry(30, 6, 6, 1, 1, 1);
	var targetBoxMesh = new THREE.Mesh(targetBoxGeometry);
	var targetPoints = targetBoxGeometry.vertices;
	scene.add(targetBoxMesh);
	var framingController = new MultitargetFramer(camera, targetPoints, view.domSize, margin);

	var camSwayDistance = 100;
	view.renderManager.onEnterFrame.add(function() {
		var time = (new Date()).getTime() * .001 * .25;
		camera.position.set(
			Math.sin(time) * camSwayDistance,
			Math.cos(time * 1.33) * camSwayDistance,
			Math.sin(time * 3) * camSwayDistance + camSwayDistance
		)
		var deltaScore = framingController.update();
		//this metric helps you decide whether things have changed or not. helps in deciding whether its worth a rerender or not.
		console.log(deltaScore);
	})
}

var loadAndRunScripts = require('loadandrunscripts');
loadAndRunScripts(
	[
		'bower_components/three.js/three.js'
	],
	onReady
);