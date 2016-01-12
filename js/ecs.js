(function(root)
{
    "use strict";

    var ECS = {};

    /**
        Function for finding the index of an element in an array.

        This function is not implemented in IE8 or below, hence this check.

        From this thread: http://stackoverflow.com/questions/143847
    */
    if (!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function (obj, fromIndex) {
            if (fromIndex === null)
            {
                fromIndex = 0;
            }
            else if (fromIndex < 0)
            {
                fromIndex = Math.max(0, this.length + fromIndex);
            }

            for (var i = fromIndex, j = this.length; i < j; i++)
            {
                if (this[i] === obj)
                {
                    return i;
                }
            }

            return -1;
        };
    }

    /**
        Function for cloning arbirary objects.

        From this thread: http://stackoverflow.com/questions/728360

        @param {object} obj - The object to clone.
        @return {object} - A clone of obj.
    */
    function clone(obj)
	{
		var copy;

		// Handle the 3 simple types, and null or undefined
		if (null === obj || "object" != typeof obj)
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
			copy = Object.create(obj.__proto__);
			for (var attr in obj)
			{
				if (obj.hasOwnProperty(attr))
					copy[attr] = clone(obj[attr]);
			}

			return copy;
		}

		throw new Error("Unable to clone object. Type unsupported.");
	}
	
	ECS.clone = clone;
	
	/**
		@class EntityFilter
		
		Handles a set of entities that will be updated.
	*/
	function EntityFilter() 
	{
		this.componentNames = [];
		this.entities = [];
		this.nextEntity = 0;
		this.isProcessing = false;
	}
	
	/**
		Used to retrieve the first entity in the filter's entity list, and will
		put the entity filter in a iteration mode (where you can call next).
		
		Use as following in your processor:
		
		for (var entity = entityFilter.first(); entity !== undefined; entity = entityFilter.next()) {
			...
		}
		
		Using this instead of manually looping over the entities array makes it more resistant to entities being removed mid-loop (since the loop index is updated automatically).
		
		@return {int} The first entity in the entity list or undefined if there are no entities in the list.
	*/
	EntityFilter.prototype.first = function() {
		this.nextEntity = 0;
		this.isProcessing = true;
		return this.next();
	};
	
	/**
		Used to retrieve the next entity in the filter's entity list. Must be called 
		after first() has been called and put the filter in iteration mode. This function
		returns undefined when reaching past the last element, which puts the filter out of
		iteration mode (so first() needs to be called again before another call to next()).
		
		@return {int} The next entity in the entity list or undefined if the last has been returned.
	*/
	EntityFilter.prototype.next = function() {
		if (this.nextEntity >= this.entities.length) {
			this.isProcessing = false;
			return undefined;
		}
		
		return this.entities[this.nextEntity++];
	};
	
	/**
		Iterators require ES6 and is currently replaced with the first() and next() methods. This syntax will replace
		the above functions once ES6 is officially released and more widely supported.
	*/
	//EntityFilter.prototype[Symbol.iterator] = function() {
	//	var _this = this;
	//	
	//	_this.nextEntity = 0;
	//	_this.isProcessing = true;
	//	return {
	//		/**
	//			Retrieves the next entity in the filter. Can be used in code as following:
	//			
	//			for (var entity of entityFilter) { ... }
	//			
	//			Using this instead of manually looping over entities has the benefit of being resistant to entities being removed mid-process.
	//			
	//			See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of for more info about browser compatibility.
	//			
	//			@return {object} An object containing two properties {done, value} where value is the next entity to process.
	//		*/
	//		next: function() {
	//			// Implements the iterator protocol specified at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
	//			if (_this.nextEntity >= _this.entities.length) 
	//			{
	//				_this.nextEntity = 0;
	//				_this.isProcessing = false;
	//				return { done: true };
	//			}
	//				
	//			return { value: _this.entities[_this.nextEntity++] };
	//		}
	//	};
	//};

    /**
        @class EntityManager

        Manages entities, components and processors.
    */
    ECS.EntityManager = function()
    {
        // The next unique entity ID.
        this.uid = 0;

        // List of all active entity UIDs.
        this.entities = [];

        // A dictionary (accessed by entity UIDs) to lists of child entities.
        this.childEntities = {};

        // Dictionary of all existing component types. Associates name with
        // component object.
        this.components = {};

        // Dictionary of component names to dictionary of entity UIDs to
        // component data.
        this.componentEntityTable = {};

        // List of all processor objects.
        this.processors = [];

        // List of all entity filters.
        this.entityFilters = [];

        // List of observers interested in added/removed components.
        this.componentObservers = [];

        // List of entity observers interested in created/removed entities.
        this.entityObservers = [];

        // Dictionary associating tag names with entity UIDs.
        this.entityTags = {};
    };


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
    };

    /**
        Unregister a component type. This type will be removed from all entities.

        @param {string} name - The name of the component type.
    */
    ECS.EntityManager.prototype.unregisterComponent = function(name)
    {
        // Update entity filters.
        var i;
        for (i = 0; i < this.entityFilters.length; i++)
        {
            // Remove the component from the filter.
            var componentIndex = this.entityFilters[i].componentNames.indexOf(name);
            if (componentIndex != -1)
            {
                this.entityFilters[i].componentNames.splice(componentIndex, 1);

                // If no components remain, remove all entities from this filter since we cannot subscribe to entities without components.
                if (this.entityFilters[i].componentNames.length === 0)
                {
                    this.entityFilters[i].entities = [];
                }
                else
                {
                    // Add all entities that are now matching the aspect.
                    var matchingEntities = this.getEntitiesByComponents(this.entityFilters[i].componentNames);
                    var k;
                    for (k = 0; k < matchingEntities.length; k++)
                    {
                        if (this.entityFilters[i].entities.indexOf(matchingEntities[k]) == -1)
                            this.entityFilters[i].entities.push(matchingEntities[k]);
                    }
                }
            }
        }

        // Notify the component observers.
        for (i = 0; i < this.componentObservers.length; i++)
        {
            if (this.componentObservers[i].observerComponentNames.indexOf(name) != -1)
            {
                for (var entity in this.componentEntityTable[name])
                {
                    this.componentObservers[i].componentRemoved(parseInt(entity, 10), name);
                }
            }

            this.componentObservers[i].observerComponentNames.splice(this.componentObservers[i].observerComponentNames.indexOf(name), 1);
        }

        delete this.components[name];
        delete this.componentEntityTable[name];
    };


    // ENTITY METHODS //
    /**
        Create a new entity with an initial set of components.

        @param {array} componentNames - The names of the component types that should be added to this entity.
        @param {int} parentEntity - An entity that 'owns' this entity. When the parent is destroyed, so is the child entity.
        @return {int} The unique identifier of this entity.
    */
    ECS.EntityManager.prototype.createEntity = function(componentNames, parentEntity)
    {
        var id = this.uid++;
        this.entities.push(id);

        // Add components to the entity.
        var i;
        if (componentNames !== undefined)
        {
            for (i = 0; i < componentNames.length; i++)
            {
                this.addComponent(id, componentNames[i]);
            }
        }

        // If a parent entity is given, add this as a child entity to it.
        if (parentEntity !== undefined)
        {
            if (!(parentEntity in this.childEntities))
                this.childEntities[parentEntity] = [];
            this.childEntities[parentEntity].push(id);
        }

        // Notify entity observers of the new entity.
        for (i = 0; i < this.entityObservers.length; i++)
        {
            this.entityObservers[i].entityCreated(id);
        }

        return id;
    };

    /**
        Create a new message entity. This message will exist until the next update of processorEmitter.

        @param {object} processorEmitter - A registered processor instance. The message will be destroyed just before its next update.
        @param {array} componentNames - The names of the component types that should be added to this message entity.
        @return {int} The unique identifier of this message entity.
    */
    ECS.EntityManager.prototype.createMessage = function(processorEmitter, componentNames)
    {
        var id = this.createEntity(componentNames);
        processorEmitter.emittedMessages.push(id);
        return id;
    };

    /**
        Remove the entity with the given unique identifier. This will immediately destroy the entity and its associated components.

        @param {int} entity - The unique entity ID.
    */
    ECS.EntityManager.prototype.removeEntity = function(entity)
    {
        var index = this.entities.indexOf(entity);
        if (index != -1)
        {
            // If there are any child entities associated with this entity, remove all of them first.
            var i;
            if (entity in this.childEntities)
            {
                for (i = 0; i < this.childEntities[entity].length; i++)
                {
                    this.removeEntity(this.childEntities[entity][i]);
                }

                delete this.childEntities[entity];
            }

            // Remove this entity from all entity filters.
            for (i = 0; i < this.entityFilters.length; i++)
            {
                var filterEntityIndex = this.entityFilters[i].entities.indexOf(entity);
                if (filterEntityIndex != -1)
                {
                    this.entityFilters[i].entities.splice(filterEntityIndex, 1);
					
					// If we are currently looping through entities in an entity filter, make sure the loop index is set correctly.
					if (this.entityFilters[i].isProcessing && filterEntityIndex < this.entityFilters[i].nextEntity)
					{
						this.entityFilters[i].nextEntity--;
					}
                }
            }

            // Notify the component observers.
            var componentName;
            for (componentName in this.componentEntityTable)
            {
                if (entity in this.componentEntityTable[componentName])
                {
                    for (i = 0; i < this.componentObservers.length; i++)
                    {
                        if (this.componentObservers[i].observerComponentNames.indexOf(componentName) != -1)
                        {
                            this.componentObservers[i].componentRemoved(parseInt(entity, 10), componentName);
                        }
                    }
                }
            }

            // Notify the entity observers.
            for (i = 0; i < this.entityObservers.length; i++)
            {
                this.entityObservers[i].entityRemoved(entity);
            }

            // Remove any tags associated with this entity.
            for (var tag in this.entityTags)
            {
                if (this.entityTags[tag] == entity)
                {
                    delete this.entityTags[tag];
                }
            }

            // Destroy the entity.
            this.entities.splice(index, 1);
            for (componentName in this.componentEntityTable)
            {
                if (entity in this.componentEntityTable[componentName])
                {
                    delete this.componentEntityTable[componentName][entity];
                }
            }
        }
    };

    /**
        Returns whether this entity is active, i.e. has been created but not destroyed.

        @param {int} entity - The unique entity ID.
        @return {boolean} - True if active, false if destroyed or not created.
    */
    ECS.EntityManager.prototype.isActiveEntity = function(entity)
    {
        return this.entities.indexOf(entity) != -1;
    };

    /**
        Returns whether this is an entity that has once existed but has been destroyed.

        @param {int} entity - The unique entity ID.
        @return {boolean} - True if destroyed, false if active or not created.
    */
    ECS.EntityManager.prototype.isDestroyedEntity = function(entity)
    {
        return this.entities.indexOf(entity) == -1 && entity < this.uid && entity >= 0;
    };

    /**
        This associates a tag with a specific entity which it can be accessed on later. Several tags can be associated with a single entity.
        If the tag is already associated with another entity, this will rebind it to the new entity.

        @param {int} entity - The unique entity ID.
        @param {string} tag - A name for this particular entity.
    */
    ECS.EntityManager.prototype.addTag = function(entity, tag)
    {
        this.entityTags[tag] = entity;
    };

    /**
        Removes a tag. The specified name will no longer be associated with any entity.

        @param {string} tag - A registered tag name.
    */
    ECS.EntityManager.prototype.removeTag = function(tag)
    {
        delete this.entityTags[tag];
    };

    /**
        Returns an entity by tag name. A tag name must have been associated with the entity before this call.

        @param {string} tag - A registered tag name.
        @return {int} - An entity UID.
    */
    ECS.EntityManager.prototype.getEntityByTag = function(tag)
    {
        return this.entityTags[tag];
    };

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

        // Update filters' entity lists.
        var i;
        for (i = 0; i < this.entityFilters.length; i++)
        {
            // Do not add this entity if it is already in the filter's entity list.
            if (this.entityFilters[i].entities.indexOf(entity) != -1)
                continue;

            // Check whether this entity has all the components required to be part of the processor's entity list.
            var pass = true;
            var k;
            for (k = 0; k < this.entityFilters[i].componentNames.length; k++)
            {
                if (!(entity in this.componentEntityTable[this.entityFilters[i].componentNames[k]]))
                {
                    pass = false;
                    break;
                }
            }

            if (pass)
            {
                this.entityFilters[i].entities.push(entity);
            }
        }

        // Notify component observers.
        for (i = 0; i < this.componentObservers.length; i++)
        {
            if (this.componentObservers[i].observerComponentNames.indexOf(componentName) != -1)
            {
                this.componentObservers[i].componentAdded(entity, componentName);
            }
        }
    };

    /**
        Add a set of components to this entity.

        @param {int} entity - The unique entity ID.
        @param {array} componentNames - The names of the component types.
    */
    ECS.EntityManager.prototype.addComponents = function(entity, componentNames)
    {
        var i;
        for (i = 0; i < componentNames.length; i++)
        {
            this.addComponent(entity, componentNames[i]);
        }
    };

    /**
        Removes a component from an entity.

        @param {int} entity - The unique entity ID.
        @param {string} componentName - The name of the component type.
    */
    ECS.EntityManager.prototype.removeComponent = function(entity, componentName)
    {
        // Update filters' entity lists.
        var i;
        for (i = 0; i < this.entityFilters.length; i++)
        {
            if (this.entityFilters[i].componentNames.indexOf(componentName) != -1)
            {
                var filterEntityIndex = this.entityFilters[i].entities.indexOf(entity);
                this.entityFilters[i].entities.splice(filterEntityIndex, 1);
            }
        }

        // Notify component observers.
        for (i = 0; i < this.componentObservers.length; i++)
        {
            if (this.componentObservers[i].observerComponentNames.indexOf(componentName) != -1)
            {
                this.componentObservers[i].componentRemoved(entity, componentName);
            }
        }

        // Remove the component from the entity.
        delete this.componentEntityTable[componentName][entity];
    };

    /**
        Returns the component of a given type associated with this entity.

        @param {int} entity - The unique entity ID.
        @param {string} componentName - The name of the component type.
        @return {object} - Component object associated with the entity.
    */
    ECS.EntityManager.prototype.getComponent = function(entity, componentName)
    {
        return this.componentEntityTable[componentName][entity];
    };

    /**
        Returns all entities having all the components specified by componentNames.

        @param {array} componentNames - The component types required to exist on the returned entities.
        @return {array} - Array of entities that have all the given components.
    */
    ECS.EntityManager.prototype.getEntitiesByComponents = function(componentNames)
    {
        var entities = [];
        for (var entity in this.componentEntityTable[componentNames[0]])
        {
            var intersecting = true;
            var i;
            for (i = 1; i < componentNames.length; i++)
            {
                if (!(entity in this.componentEntityTable[componentNames[i]]))
                {
                    intersecting = false;
                    break;
                }
            }

            if (intersecting)
                entities.push(parseInt(entity, 10));
        }

        return entities;
    };

    // PROCESSOR METHODS //
    /**
        Registers a processor that subscribes to entities having a specific set of components.

        @param {object} processor - The processor instance. Requires an update() method.
    */
    ECS.EntityManager.prototype.registerProcessor = function(processor)
    {
        this.processors.push(processor);
        processor.emittedMessages = [];
    };

    /**
        Unregisters a processor, removing it from having its update() method called.

        @param {object} processor - The processor instance.
    */
    ECS.EntityManager.prototype.unregisterProcessor = function(processor)
    {
        this.processors.splice(this.processors.indexOf(processor));
        
		var i;
		for (i = 0; i < processor.emittedMessages.length; i++)
		{
			this.removeEntity(processor.emittedMessages[i]);
		}
		
        delete processor.emittedMessages;
    };

    /**
        Calls the update() method of all processors in order.
    */
    ECS.EntityManager.prototype.update = function()
    {
        var i;
        for (i = 0; i < this.processors.length; i++)
        {
            var processor = this.processors[i];
			
			// Remove all messages associated with this processor.
			var k;
			for (k = 0; k < processor.emittedMessages.length; k++)
			{
				this.removeEntity(processor.emittedMessages[k]);
			}
			
			processor.emittedMessages = [];
            
			// Update the processor.
            processor.update();
        }
    };

    // FILTER METHODS //
    /**
        Create a new entity filter subscribing to entities with a minimal set of
        components.

        @param {array} componentNames - A set of component names that should
        exist on filtered entities.
        @return {object} - A new entity filter with componentNames and entities
        attributes.
    */
    ECS.EntityManager.prototype.createEntityFilter = function(componentNames)
    {
		var filter = new EntityFilter();
		filter.componentNames = componentNames;
		filter.entities = this.getEntitiesByComponents(filter.componentNames);
		this.entityFilters.push(filter);
		
        return filter;
    };

    /**
    */
    ECS.EntityManager.prototype.removeEntityFilter = function(filter)
    {
        var index = this.entityFilters.indexOf(filter);
        if (index != -1)
        {
            this.entityFilters.splice(index, 1);
        }
    };

    // OBSERVER METHODS //
    /**
        Registers an entity observer interested in created/removed entities.

        @param {object} observer - The entity observer object. Needs entityCreated(uid) and entityRemoved(uid) methods.
    */
    ECS.EntityManager.prototype.registerEntityObserver = function(observer)
    {
        this.entityObservers.push(observer);
    };

    /**
        Unregisters an entity observer. This observer will no longer have its methods called.

        @param {object} observer - The registered entity observer object.
    */
    ECS.EntityManager.prototype.unregisterEntityObserver = function(observer)
    {
        this.entityObservers.splice(this.entityObservers.indexOf(observer));
    };

    /**
        Registers a component observer interested in added/removed components.

        @param {object} observer - The component observer object. Needs componentAdded(entity, componentName) and componentRemoved(entity, componentName).
        @param {array} componentNames - The component types this observer is interested in. Components of other types added/removed will not call the methods.
    */
    ECS.EntityManager.prototype.registerComponentObserver = function(observer, componentNames)
    {
        observer.observerComponentNames = componentNames;
        this.componentObservers.push(observer);
    };

    /**
        Unregisters a component observer. This observer will no longer have its methods called.

        @param {object} observer - The registered entity observer object.
    */
    ECS.EntityManager.prototype.unregisterComponentObserver = function(observer)
    {
        delete observer.observerComponentNames;
        this.componentObservers.splice(this.componentObservers.indexOf(observer), 1);
    };

    /**
        Add an additional component type of interest to a component observer. It will have its methods called when a
        component of this type is added/removed.

        @param {object} observer - The registered entity observer object.
        @param {string} name - The name of the component type to add.
    */
    ECS.EntityManager.prototype.addComponentObserverComponent = function(observer, componentName)
    {
        observer.observerComponentNames.push(componentName);
    };

    /**
        Remove a component type from the interest of this component observer. It will no longer have its methods called when a
        component of this type is added/removed.

        @param {object} observer - The registered entity observer object.
        @param {string} name - The name of the component type to remove.
    */
    ECS.EntityManager.prototype.removeComponentObserverComponent = function(observer, componentName)
    {
        var index = observer.observerComponentNames.indexOf(componentName);
        if (index != -1)
        {
            observer.observerComponentNames.splice(index, 1);
        }
    };

	// Export the module in a universal manner. Compatible with Node, AMD and browser globals.
	if (typeof define === 'function' && define.amd !== undefined) {
		define([], function() {
			return ECS;
		});
	} else if (typeof module === 'object' && module.exports !== undefined) {
		module.exports = ECS;
	} else {
		root.ECS = ECS;
	}
})(this);
