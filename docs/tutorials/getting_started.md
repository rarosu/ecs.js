An entity component system, as the name implies, manages entities and components. Entities are your game objects, however unlike many other architectures, no actual data is stored in the entity abstraction. An entity is a simple integer ID. The data of the game object is instead separated into components, objects that can be associated with entities. Instead of using game object hierarchies via inheritance (which can get clunky), game objects can be composed by adding different combinations of components onto entities.

When game objects have been created, the entity component architecture provides a simple way of performing logic on them as well, via an abstraction called processors. A processor will subscribe to all entities that have a specific set of components and will get a list of them each update. These components are then guaranteed to be on these entities and the data in them can be modified.

This tutorial will show a simple example to get you started and step through the library interface.

In order to get started with ecs.js you will first need to include the file into your project. This module is not yet node.js or require.js compatible and only a script tag has been tested so far. When the module has been included, the first step is to create an entity manager:

```javascript
var entityManager = new ECS.EntityManager();
```

The entity manager is the interface to all functionality in the library. The first thing we need to be able to use this entity manager is a few component objects:

```javascript
var PositionComponent = 
{
    position: [0, 0]
};

var PhysicsComponent = 
{
    velocity: [0, 0],
    acceleration: [0, 0]
};

var RenderComponent = 
{
    vertex_buffer: 0,
    index_buffer: 0,
    vertex_count: 0,
    shader_program: 0
};

entityManager.registerComponent('PositionComponent', PositionComponent);
entityManager.registerComponent('PhysicsComponent', PhysicsComponent);
entityManager.registerComponent('RenderComponent', RenderComponent);
```

Note that these objects need to be registered with the entity manager; the name you choose is your choice, but no two components can have the same name. These components can be arbitrary objects with data you might want to have on game objects. Remember that you can have any combination of components on an entity, so it is usually a good idea to try to reuse components.

Next up, we need to create a few actual entities:

```javascript
var entity1 = entityManager.createEntity(['PositionComponent', 'PhysicsComponent', 'RenderComponent']);
var entity2 = entityManager.createEntity(['PositionComponent', 'RenderComponent']);
var entity3 = entityManager.createEntity(['PositionComponent']);
```

You can specify what components you want initially on the entities in the array parameter, however components can be added and removed from entities at a later point as well (in case, for instance, you don't want an entity to be renderer anymore). Often, we want to initialize the data on these entities. To do so, we first need to access the component we just added to it:

```javascript
var physics = entityManager.getComponent(entity1, 'PhysicsComponent');
physics.velocity[0] = 5.5f;
physics.acceleration[1] = 1.0f;
```

Finally, to be able to perform logic on these entities, we need to create a processor class:

```javascript
function RenderProcessor(entityManager) 
{
    this.entityManager = entityManager;
}

RenderProcessor.prototype.update = function()
{
    var entities = this.entityManager.getEntitiesByProcessor(this);
    for (var i = 0; i < entities.length; i++)
    {
        var entity = entities[i];
        var position = this.entityManager.getComponent(entity, 'PositionComponent');
        var render = this.entityManager.getComponent(entity, 'RenderComponent');
        
        // render the entity using the data in the position and render component objects.
    }
}

entityManager.registerProcessor(new RenderProcessor(entityManager), ['PositionComponent', 'RenderComponent']);
```

The update method is a required method on processors and it will be called every frame by the entity component framework as long as the following method is called every frame:

```
entityManager.update();
```

Every processor has a list of entities associated with them, which is accessed through `getEntitiesByProcessor`. These are guaranteed to have at least the components specified in the array sent to `registerProcessor`. Hence, we can be guaranteed that the entities we loop through in the update method has the `PositionComponent` and the `RenderComponent` which we needed to render the entities. Note that in the above case, the `RenderProcessor` would not process `entity3`, since it does not have a `RenderComponent`. It would, however, process `entity1`, since it has all the required components.

Through this functionality, we can build extensible and decoupled systems for managing game objects and game logic.
