const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth / window.innerHeight), 0.1, 1000);
camera.position.z = 5

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const random = (min, max) => Math.floor((Math.random() * (max - min)) + min);

const stars = []
const addStar = (position={}, color) => {
	// Create the star sphere
	const box   = new THREE.SphereGeometry(0.5, 32, 32)
	const mat = new THREE.MeshBasicMaterial({ color });
	const sphere = new THREE.Mesh(box, mat)
	
	// Assign x, y, and z random numbers between -500 and 500
	sphere.position.x = position.x || random(-500, 500)
	sphere.position.y = position.y || random(-500, 500)
	sphere.position.z = position.z || random(-500, 500)

	scene.add(sphere);
	stars.push(sphere); 
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
addStars(200)

const rotate = (e, camera, clientPosition) => {
	const windowWidth = window.innerWidth
	const windowHeight = window.innerHeight
	const {x, y} = clientPosition
	const {clientX, clientY} = e
	const deltaX = clientX - x
	const percentXMoved = Math.PI * (deltaX / windowHeight)
	const deltaY = clientY - y
	const percentYMoved = Math.PI * (deltaY / windowWidth)

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
addMouseInteractions(camera)

const animate = () => {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate()