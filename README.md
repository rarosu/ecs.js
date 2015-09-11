An entity component framework for JavaScript used to organize game objects in game development. This library can be used for other purposes however. The library is designed to be used in browser applications however support for node.js might be considered in the future. For more information about what an entity component system is, please see this write-up: https://github.com/junkdog/artemis-odb/wiki/Introduction-to-Entity-Systems

Main features of this library includes:
- Processors keeping an updated list of the entities they are interested in, for fast access each frame.
- Entity and component observers can be added to know when entities or components are added and removed.
- Safe removal. Removed entities are not destroyed (just flagged) until after a processor is done updating, to avoid invalid references.

## Installation

Copy the file `js/ecs.js` into your document structure for the non-minified version.

Copy the file `build/ecs.min.js` into your document structure for the minified version.

## Usage

A simple usage example:

```JavaScript
var Component = 
{
    some_variable: 10,
    some_data: 'some default value'
};

function ExampleProcessor(entityManager)
{
    this.entityManager = entityManager;
}

ExampleProcessor.prototype.update()
{
    // update is a required function for processors.
    var entities = this.entityManager.getEntitiesByProcessor(this);
    
    for (var i = 0; i < entities.length; i++)
    {
        var component = this.entityManager.getComponent(entities[i], 'Component');
        component.some_variable++;
    }
}

var entityManager = new ECS.EntityManager();
entityManager.registerComponent('Component', Component);

var processor = new ExampleProcessor();
entityManager.registerProcessor(processor, ['Component']);

var entity = entityManager.createEntity(['Component']);
var component = entityManager.getComponent(entity, 'Component');
component.some_data = 11;
component.some_data = 'Hello world';

// This should be done once per frame.
entityManager.update();
```

## Building and compiling the documentation

This project uses grunt for build automation and npm for dependency management. The CLI for grunt will need to be installed:

`npm install -g grunt-cli`

The build dependencies for the project can be installed by executing the following in the project directory:

`npm install --dev`

The project can then be built (linted, tested and minified) by executing:

`grunt`

The documentation can be compiled by executing:

`grunt jsdoc`