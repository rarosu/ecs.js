var ECS = (function() 
{
    "use strict"
    
    var ECS = {};
    
    /**
        Function for cloning arbirary objects.
        
        From this thread: http://stackoverflow.com/questions/728360
        
        @param {object} 
    */
    function clone(obj) 
    {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) 
            return obj;

        // Handle Date
        if (obj instanceof Date) 
        {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) 
        {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) 
            {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) 
        {
            copy = {};
            for (var attr in obj) 
            {
                if (obj.hasOwnProperty(attr)) 
                    copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to clone object. Type unsupported.");
    }
    
    
    /**
        @class EntityManager
        
        Manages entities, components and processors.
    */
    ECS.EntityManager = function() 
    {
        // List of all active entity UIDs.
        this.entities = [];
        
        // List of entities that will get removed next clean up pass.
        this.removedEntities = [];
        
        // Dictionary of all existing component types. Associates name with component object.
        this.components = {};
        
        // Dictionary of component names to dictionary of entity UIDs.
        this.componentEntityTable = {};
        
        // List of all processors.
        this.processors = [];
        
        // List of the names for all processors.
        this.processorNames = [];
        
        // List (accessed by processor index) of lists of component names.
        this.processorComponents = [];
        
        // List (accessed by processor index) of lists of entities.
        this.processorEntities = [];
        
        // The next unique entity ID.
        this.uid = 0;
    }
    
    
    // COMPONENT TYPE METHODS //
    /**
        Register a component type and associate it with a name.
        
        @param {string} name - The name of the component type.
        @param {object} componentType - An object instance that will be cloned for new entities.
    */
    ECS.EntityManager.prototype.registerComponent = function(name, componentType)
    {
        // If name exists, throw an exception.
        if (name in this.components)
            throw Error("Component type " + name + " already registered.");
        
        // Register the component type.
        this.components[name] = componentType;
        this.componentEntityTable[name] = {};
    }
    
    /**
        Unregister a component type. This type will be removed from all entities.
        
        @param {string} name - The name of the component type.
    */
    ECS.EntityManager.prototype.unregisterComponent = function(name)
    {
        // Update processors. Since the component type is removed from both the processors' subscriptions and
        // the entities, nothing will need to be done except if no components remain for the processor, in which case,
        // all entities will be removed from the subscription.
        for (var i = 0; i < this.processors.length; i++)
        {
            // Remove the component from the processor.
            var componentIndex = this.processorComponents[i].indexOf(name);
            if (componentIndex != -1)
            {
                this.processorComponents[i].splice(componentIndex, 1);
            
                // If no components remain, remove all entities from this processor.
                if (this.processorComponents[i].length == 0)
                {
                    this.processorEntities[i] = [];
                }
                else
                {
                    // Add all entities that are now matching the aspect.
                    var matchingEntities = this.getEntitiesByComponents(this.processorComponents[i]);
                    for (var k = 0; k < matchingEntities.length; k++)
                    {
                        if (this.processorEntities[i].indexOf(matchingEntities[k]) == -1)
                            this.processorEntities[i].push(matchingEntities[k]);
                    }
                }
            }
        }
        
        delete this.components[name];
        delete this.componentEntityTable[name];
    }
    
    
    // ENTITY METHODS //
    /**
        Create a new entity with an initial set of components.
        
        @param {array} componentNames - The names of the component types that should be added to this entity.
        @return {int} The unique identifier of this entity.
    */
    ECS.EntityManager.prototype.createEntity = function(componentNames)
    {
        var id = this.uid++;
        this.entities.push(id);
        
        // Add components to the entity.
        if (componentNames)
        {
            for (var i = 0; i < componentNames.length; i++)
            {
                this.addComponent(id, componentNames[i]);
            }
        }
        
        // TODO: Notify entity observers of the new entity.
        
        return id;
    }
    
    /**
        Remove the entity with the given unique identifier. This will not destroy the entity until the current processor has finished or.
        
        @param {int} entity - The unique entity ID.
    */
    ECS.EntityManager.prototype.removeEntity = function(entity)
    {
        var index = this.entities.indexOf(entity);
        if (index != -1)
        {
            this.entities.splice(index, 1);
            this.removedEntities.push(entity);
            
            // Update processors.
            for (var i = 0; i < this.processors.length; i++)
            {
                var processorEntityIndex = this.processorEntities[i].indexOf(entity);
                if (processorEntityIndex != -1)
                {
                    this.processorEntities[i].splice(processorEntityIndex, 1);
                }
            }
        }
    }
    
    /**
        Returns whether this entity is active, i.e. has been created and not removed or destroyed.
        
        @param {int} entity - The unique entity ID.
    */
    ECS.EntityManager.prototype.isActiveEntity = function(entity)
    {
        return this.entities.indexOf(entity) != -1;
    }
    
    /**
        Returns whether this entity has been removed (but not destroyed).
        
        @param {int} entity - The unique entity ID.
    */
    ECS.EntityManager.prototype.isRemovedEntity = function(entity)
    {
        return this.removedEntities.indexOf(entity) != -1;
    }
    
    /**
        Returns whether this is an entity that has once existed but has been destroyed.
        
        @param {int} entity - The unique entity ID.
    */
    ECS.EntityManager.prototype.isDestroyedEntity = function(entity)
    {
        return this.entities.indexOf(entity) == -1 && this.removedEntities.indexOf(entity) == -1 && entity < this.uid && entity >= 0;
    }
    
    /**
        This method destroys all removed entities. This is called automatically before and between processor updates.
    */
    ECS.EntityManager.prototype._destroyRemovedEntities = function()
    {
        for (var i = 0; i < this.removedEntities.length; i++)
        {
            for (var componentName in this.componentEntityTable)
            {
                if (this.removedEntities[i] in this.componentEntityTable[componentName])
                {
                    delete this.componentEntityTable[componentName][this.removedEntities[i]];
                }
            }
        }
        
        this.removedEntities = [];
    }
    
    // COMPONENT METHODS //
    /**
        Add a component to this entity.
        
        @param {int} entity - The unique entity ID.
        @param {string} componentName - The name of the component type. 
    */
    ECS.EntityManager.prototype.addComponent = function(entity, componentName)
    {
        // If this component already exists on the entity, do not add it again.
        if (entity in this.componentEntityTable[componentName])
            return;
        
        // Create a new component associated with this entity.
        this.componentEntityTable[componentName][entity] = clone(this.components[componentName]);
        
        // Update processors' entity lists.
        for (var i = 0; i < this.processors.length; i++)
        {
            // Do not add this entity if it is already in the processor's entity list.
            if (this.processorEntities[i].indexOf(entity) != -1)
                continue;
            
            // Check whether this entity has all the components required to be part of the processor's entity list.
            var pass = true;
            for (var k = 0; k < this.processorComponents[i].length; k++)
            {
                if (!(entity in this.componentEntityTable[this.processorComponents[i][k]]))
                {
                    pass = false;
                    break;
                }
            }
            
            if (pass)
            {
                this.processorEntities[i].push(entity);
            }
        }
        
        // TODO: Notify component observers.
    }
    
    /**
        Add a set of components to this entity.
        
        @param {int} entity - The unique entity ID.
        @param {array} componentNames - The names of the component types.
    */
    ECS.EntityManager.prototype.addComponents = function(entity, componentNames)
    {
        for (var i = 0; i < componentNames.length; i++)
        {
            this.addComponent(entity, componentNames[i]);
        }
    }
    
    /**
        Removes a component from an entity.
        
        @param {int} entity - The unique entity ID.
        @param {string} componentName - The name of the component type.
    */
    ECS.EntityManager.prototype.removeComponent = function(entity, componentName)
    {
        delete this.componentEntityTable[componentName][entity];
        
        // Update processors' entity lists.
        for (var i = 0; i < this.processors.length; i++)
        {
            if (this.processorComponents[i].indexOf(componentName) != -1)
            {
                var processorEntityIndex = this.processorEntities[i].indexOf(entity);
                this.processorEntities[i].splice(processorEntityIndex, 1);
            }
        }
        
        // TODO: Notify component observers.
    }
    
    /**
        Returns the component of a given type associated with this entity.
        
        @param {int} entity - The unique entity ID.
        @param {string} componentName - The name of the component type. 
    */
    ECS.EntityManager.prototype.getComponent = function(entity, componentName)
    {
        // TODO: Handle case of non-existing component type?
        // TODO: Handle case of component not on entity?
        return this.componentEntityTable[componentName][entity];
    }
    
    /**
        Returns all entities and their associated component data having the component type specified by componentName.
        
        @param {string} componentName - The component type required to exist on the returned entities.
    */
    ECS.EntityManager.prototype.getEntitiesDataByComponent = function(componentName)
    {
        return this.componentEntityTable[componentName];
    }
    
    /**
        Returns all entities having all the components specified by componentNames.
        
        @param {array} componentNames - The component types required to exist on the returned entities.
    */
    ECS.EntityManager.prototype.getEntitiesByComponents = function(componentNames)
    {
        var entities = [];
        for (var entity in this.componentEntityTable[componentNames[0]])
        {
            var intersecting = true;
            for (var i = 1; i < componentNames.length; i++)
            {
                if (!(entity in this.componentEntityTable[componentNames[i]]))
                {
                    intersecting = false;
                    break;
                }
            }
            
            if (intersecting)
                entities.push(parseInt(entity));
        }
        
        return entities;
    }
    
    // PROCESSOR METHODS //
    /**
        Registers a processor that subscribes to entities having a specific set of components.
        
        @param {object} processor - The processor instance. Requires an update() method.
        @param {array} componentNames - An array of component names specifying what entities this processor is interested in.
    */
    ECS.EntityManager.prototype.registerProcessor = function(processor, componentNames)
    {
        this.processors.push(processor);
        this.processorComponents.push(componentNames);
        this.processorEntities.push(this.getEntitiesByComponents(this.processorComponents[this.processorComponents.length - 1]));
    }
    
    /**
        Unregisters a processor, removing it from having its update() method called.
        
        @param {object} processor - The processor instance.
    */
    ECS.EntityManager.prototype.unregisterProcessor = function(processor)
    {
        var processorIndex = this.processors.indexOf(processor);
        this.processors.splice(processorIndex, 1);
        this.processorComponents.splice(processorIndex, 1);
        this.processorEntities.splice(processorIndex, 1);
    }
    
    /**
        Returns all entities having all the components specified by the given processor (components specified when registering).
        
        @param {object} processor - The processor instance.
    */
    ECS.EntityManager.prototype.getEntitiesByProcessor = function(processor)
    {
        return this.processorEntities[this.processors.indexOf(processor)];
    }
    
    /**
        Calls the update() method of all processors in order.
    */
    ECS.EntityManager.prototype.update = function()
    {
        this._destroyRemovedEntities();
        for (var i = 0; i < this.processors.length; i++)
        {
            var processor = this.processors[i];
            processor.update();
            this._destroyRemovedEntities();
        }
    }
    
    
    
    /**
        @class MessageManager
        
        Manages messages, components and processors.
    */
    ECS.MessageManager = function()
    {
        
    }
    
    return ECS;
}());