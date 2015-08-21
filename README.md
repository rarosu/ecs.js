# ecs.js 1.0.0
==

An entity component framework for JavaScript. Main features include:

- Processors keeping an updated list of the entities they are interested in, for fast access each frame.
- Entity and component observers can be added to know when entities or components are added and removed.
- Remove safety. Entities are not destroyed until after a processor is done updating, to avoid invalid references.

# Installation

Copy the file ecs.js into your document structure.

# Usage

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

# Compiling the documentation

Download and install jsdoc3:

`npm install -g jsdoc`

Compile the documentation:

`jsdoc js/ecs.js --destination docs`