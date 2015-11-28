An entity component framework for JavaScript used to organize game objects in game development. This library can be used for other purposes however. The library is designed to be used in browser applications however support for node.js might be considered in the future. For more information about what an entity component system is, please see this write-up: https://github.com/junkdog/artemis-odb/wiki/Introduction-to-Entity-Systems

Main features of this library includes:
- Processors can have several entity filters that keep an updated list of the entities they are interested in, for fast access each frame.
- Entity and component observers can be added to know when entities or components are added and removed.
- Messages between processors can be handled in the same way as other entities.
- Entities can be composed in a tree-like fashion (by specifying parent entities) and easily destroyed.

## Installation

Copy the file `js/ecs.js` into your document structure for the non-minified version.

Copy the file `build/ecs.min.js` into your document structure for the minified version.

## Usage

A simple usage example:

```JavaScript
// Components are specified as simple javascript objects.
var Physics = 
{
    position: [0, 0],
	velocity: [0, 0]
};

// Processors are specified as a javascript object with an update method.
function ExampleProcessor(entityManager)
{
    this.entityManager = entityManager;
	this.entityFilter = entityManager.createEntityFilter(['Physics']);
}

ExampleProcessor.prototype.update()
{
	// All entities that have the Physics component will be present in the entity filter.
	for (var entity of this.entityFilter)
	{
		var component = this.entityManager.getComponent(entity, 'Physics');
		component.position[0] += component.velocity[0];
		component.position[1] += component.velocity[1];
	}
}

// Create the global entity manager, register components, processors and create initial entities.
var entityManager = new ECS.EntityManager();
entityManager.registerComponent('Physics', Physics);

var processor = new ExampleProcessor();
entityManager.registerProcessor(processor);

var entity = entityManager.createEntity(['Physics']);
var component = entityManager.getComponent(entity, 'Physics');
component.velocity[0] = 1;
component.velocity[1] = 1;

// Update the entity manager (and with it the processors) once per frame.
entityManager.update();
```

## Building and compiling the documentation

This project uses grunt for build automation and npm for dependency management. The CLI for grunt will need to be installed:

`npm install -g grunt-cli`

The build dependencies for the project can be installed by executing the following in the project directory:

`npm install`

The project can then be built (linted, tested and minified) by executing:

`grunt`

The documentation can be compiled by executing:

`grunt jsdoc`