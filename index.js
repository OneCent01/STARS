const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth / window.innerHeight), 0.1, 1000);
// camera.position.z = 5

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

const random = (min, max) => Math.floor((Math.random() * (max - min)) + min);

const degreesToRadians = degrees => degrees * (Math.PI/180);

const radiansToDegrees = radian => {
	return radian * (180 / Math.PI)
}

const translateCordsToPoint = (longitude, latitude, radius) => {
	longitude = degreesToRadians(longitude)
	latitude = degreesToRadians(latitude)
	return new THREE.Vector3(
		radius * (Math.cos(latitude) * Math.cos(longitude)), // x
		radius * (Math.cos(latitude) * Math.sin(longitude)), // y
		radius * (Math.sin(latitude)) // z
	)
}

const createCurvePath = (start, end, radius) => {
    const cart_start = translateCordsToPoint(start.latitude, start.longitude, radius);
    const cart_end = translateCordsToPoint(end.latitude, end.longitude, radius);
    const mid = {
    	latitude: (start.latitude + end.latitude)/2, 
    	longitude: (start.longitude + end.longitude)/2
    }
    const cart_mid = translateCordsToPoint(mid.latitude, mid.longitude, radius);

    const curveQuad = new THREE.QuadraticBezierCurve3(cart_start, cart_mid, cart_end);
    const curveQuad2 = new THREE.QuadraticBezierCurve3(
    	translateCordsToPoint(start.latitude, start.longitude, radius), 
    	translateCordsToPoint(-mid.latitude, -mid.longitude, -radius), 
    	translateCordsToPoint(end.latitude, end.longitude, radius)
    );
	// const curveCubic = new THREE.CubicBezierCurve3(start, start3_control, end3_control, end);

    const cp = new THREE.CurvePath();
    cp.add(curveQuad);
    cp.add(curveQuad2);
	// cp.add(curveCubic);
    return cp;
}

const curveSphere = () => {
	for(let i = 0; i <= 90; i+=5) {
		const curve = createCurvePath(
			{latitude: 0, longitude: i}, 
			{latitude: 180, longitude: -i}, 
			30
		);
		const curvedLineMaterial = new THREE.LineBasicMaterial({
			color: 0x09B6B8, 
			linewidth: 3
		});
		const geometry = new THREE.Geometry()
		curve.getPoints(20).forEach(point => geometry.vertices.push(point))
		const curvedLine = new THREE.Line(geometry, curvedLineMaterial);
		curvedLine.position.set = (0, 0, 0);

		scene.add(curvedLine);

		const _curve = createCurvePath(
			{latitude: 0, longitude: -i}, 
			{latitude: 180, longitude: i}, 
			30
		);
		const _geometry = new THREE.Geometry()
		_curve.getPoints(20).forEach(point => _geometry.vertices.push(point))
		const _curvedLine = new THREE.Line(_geometry, curvedLineMaterial);
		_curvedLine.position.set = (0, 0, 0);

		scene.add(_curvedLine);

		const curve3 = createCurvePath(
			{latitude: 0, longitude: i}, 
			{latitude: -180, longitude: -i}, 
			30
		);
		const geometry3 = new THREE.Geometry()
		curve3.getPoints(20).forEach(point => geometry3.vertices.push(point))
		const curvedLine3 = new THREE.Line(geometry3, curvedLineMaterial);
		curvedLine3.position.set = (0, 0, 0);

		scene.add(curvedLine3);

		const curve4 = createCurvePath(
			{latitude: 0, longitude: -i}, 
			{latitude: -180, longitude: i}, 
			30
		);
		const geometry4 = new THREE.Geometry()
		curve4.getPoints(20).forEach(point => geometry4.vertices.push(point))
		const curvedLine4 = new THREE.Line(geometry4, curvedLineMaterial);
		curvedLine4.position.set = (0, 0, 0);

		scene.add(curvedLine4);
	}
}

const addGridSphere = () => {
	const ball = new THREE.SphereGeometry(30, 64, 64)
	const material = new THREE.MeshBasicMaterial({
		color: 0x09B6B8,
		wireframe: true
	});
	const sphere = new THREE.Mesh(ball, material)

	sphere.position.set(0,0,0)
	scene.add(sphere);
}


const stars = []
const addStar = (position, color) => {
	// Create the sphere
	const ball = new THREE.SphereGeometry(0.5, 32, 32)
	const material = new THREE.MeshBasicMaterial({ color });
	const sphere = new THREE.Mesh(ball, material)
	
	// Assign x, y, and z random numbers between -500 and 500
	sphere.position.set(
		position.x || random(-500, 500),
		position.y || random(-500, 500),
		position.z || random(-500, 500)
	)

	scene.add(sphere)
	stars.push(sphere)
}

const addStars = (quantity=100) => {	
	let i = 0
	while(i++ < quantity) {
		addStar(
			{
				x: undefined, 
				y: undefined, 
				z: undefined
			}, 
			0xffffff
		)
	}
}

const rotate = (e, camera, clientPosition) => {
	const windowWidth = window.innerWidth
	const windowHeight = window.innerHeight
	const {x, y} = clientPosition
	const {clientX, clientY} = e
	const deltaX = clientX - x
	const percentXMoved = 2 * Math.PI * (deltaX / windowHeight)
	const deltaY = clientY - y
	const percentYMoved = 2 * Math.PI * (deltaY / windowWidth)

	if(deltaX !== 0) camera.rotation.y += percentXMoved
	if(deltaY !== 0) camera.rotation.x += percentYMoved

	clientPosition.x = clientX
	clientPosition.y = clientY
}

const addMouseInteractions = (cam) => {
	let isClicked = false
	const clientPosition = {
		x: undefined, 
		y: undefined
	}

	const boundRotate = e => rotate(e, cam, clientPosition)
	const stopRotate = e => {
		if(isClicked) {
			isClicked = false
			window.removeEventListener('mousemove', boundRotate)
			window.removeEventListener('mouseup', stopRotate)
			window.removeEventListener('mouseleave', stopRotate)
		}	
	}
	const startRotate = e => {
		clientPosition.x = e.clientX
		clientPosition.y = e.clientY
		if(!isClicked) {
			isClicked = true
			window.addEventListener('mousemove', boundRotate)
			window.addEventListener('mouseup', stopRotate)
			window.addEventListener('mouseleave', stopRotate)
		}
	}

	window.addEventListener('mousedown', startRotate)
}

const addKeyboardInteractivity = (movementState) => {
	const movementCodes = {
		87: 'up', // w, up
		38: 'up', // up arrow
		65: 'left', // a, left
		37: 'left', // left arrow
		83: 'down', // s, down
		40: 'down', // down arrow
		68: 'right', // d, right
		39: 'right' // right arrow
	}

	const associatedKeys = {
		87: [38],
		38: [87],
		65: [37],
		37: [65],
		83: [40],
		40: [83],
		68: [39],
		39: [68]
	}

	let activeKeys = []



	window.addEventListener('keydown', e => {
		const pressed = e.which
		const movementDirection = movementCodes[pressed]

		// only keep track of keys also in the movementCodes object
		if(movementDirection) {
			activeKeys.push(pressed)
			movementState[movementDirection] = true
		}

	})

	window.addEventListener('keyup', e => {
		const released = e.which
		const movementDirection = movementCodes[released]

		activeKeys = activeKeys.filter(key => key !== released)

		if(movementState[movementDirection]) {
			// check if all alternates keys for the same 
			// action are also not held down
			const keyAssociatedCodes = associatedKeys[released]
			const shouldStop = keyAssociatedCodes.every(code => !activeKeys.includes(code))

			if(shouldStop) {
				movementState[movementDirection] = false
			}

		}

	})


}

const movementState = {
	up: false,
	down: false,
	left: false,
	right: false
}
const animate = () => {
	const movements = Object.keys(movementState).reduce((active, direction) => {
		if(movementState[direction]) {
			active.push(direction)
		}
		return active
	}, [])
	if(movements.length) {
		movements.forEach(movement => {
			if(movement === 'up') {
				camera.position.z -= 0.1
			} else if(movement === 'down') {
				camera.position.z += 0.1
			} else if(movement === 'left') {
				camera.position.x -= 0.1
			} else if(movement === 'right') {
				camera.position.x += 0.1
			}
		})
	}
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
addStars(200)
// addGridSphere()
curveSphere()
addMouseInteractions(camera)


addKeyboardInteractivity(movementState)
animate()