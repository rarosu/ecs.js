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
        
        // Dictionary associating component name to processors.
        this.componentProcessors = {};
        
        // Dictionary associating processor to a list of entities.
        this.processorEntities = {};
        
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
        delete this.components[name];
        delete this.componentEntityTable[name];
        // TODO: Update processors.
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
            
            // TODO: Update processors.
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
        for (var i = 0; i < this.removedEntities.length; ++i)
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
        this.componentEntityTable[componentName][entity] = clone(this.components[componentName]);
        // TODO: Update processors' entity lists.
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
        // TODO: Update processors' entity lists.
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
        // TODO: Add all entities with the right components to this processor.
    }
    
    /**
        Unregisters a processor, removing it from having its update() method called.
        
        @param {object} processor - The processor instance.
    */
    ECS.EntityManager.prototype.unregisterProcessor = function(processor)
    {
        this.processors.splice(this.processors.indexOf(processor), 1);
    }
    
    /**
        Returns all entities having all the components specified by the given processor (components specified when registering).
        
        @param {object} processor - The processor instance.
    */
    ECS.EntityManager.prototype.getEntitiesByProcessor = function(processor)
    {
        
    }
    
    /**
        Calls the update() method of all processors in order.
    */
    ECS.EntityManager.prototype.update = function()
    {
        this._destroyRemovedEntities();
        for (var processor in this.processors)
        {
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