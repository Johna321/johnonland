const fig = document.getElementById('random_diagram')!;

let isDown = false;
let offset = [0, 0];
let mousePosition = { x: 0, y: 0 };

// Variables for physics
let isPhysicsEnabled = false; // Enables physics after mouseup
let velocity = 0; // Vertical velocity
let gravity = 0.75; // Gravity constant
let animationFrame : number;

fig.addEventListener('dragstart', (e) => {
    e.preventDefault()
});

// Mouse down: Start dragging
fig.addEventListener(
  'mousedown',
  (e) => {
    console.log('MOUSE DOWN');
    fig.style.zIndex = '9999';
    isDown = true;
    isPhysicsEnabled = false; // Disable physics while dragging
    velocity = 0; // Reset velocity
    cancelAnimationFrame(animationFrame); // Stop any ongoing animation
    fig.style.position = 'absolute';
    offset = [
        (e.clientX - fig.getBoundingClientRect().left) / 2, 
        (e.clientY - fig.getBoundingClientRect().top) / 2
    ];
  },
  true
);

// Mouse up: Release the element and enable physics
document.addEventListener(
  'mouseup',
  () => {
    console.log('MOUSE UP');
    isDown = false;
    isPhysicsEnabled = true; // Enable physics after releasing the mouse
    startPhysics(); // Start falling
  },
  true
);

// Mouse move: Drag the element
document.addEventListener(
  'mousemove',
  (e) => {
    e.preventDefault();
    if (isDown) {
      mousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
      fig.style.left = mousePosition.x + offset[0] + 'px';
      fig.style.top = mousePosition.y + offset[1] + 'px';
    }
  },
  true
);

// Physics: Falling motion
function startPhysics() {
  function physicsStep() {
    if (isPhysicsEnabled) {
      const currentY = parseInt(fig.style.top) || 0;

      // Update position and velocity
      velocity += gravity; // Apply gravity
      const newY = currentY + velocity;

      // Check for ground collision
      const windowHeight = window.innerHeight;
      const elementHeight = fig.offsetHeight;
      if (newY + elementHeight >= windowHeight) {
        fig.style.top = windowHeight - elementHeight + 'px'; // Stop at ground
        isPhysicsEnabled = false; // Disable physics after collision
        velocity = 0; // Reset velocity
      } else {
        fig.style.top = newY + 'px';
        animationFrame = requestAnimationFrame(physicsStep); // Continue animation
      }
    }
  }

  // Start the physics animation
  animationFrame = requestAnimationFrame(physicsStep);
}
