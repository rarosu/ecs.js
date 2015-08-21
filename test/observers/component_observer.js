function ComponentObserver()
{
    // Dictionary (accessed on entity UID) to list of component names.
    this.componentsAdded = {};
    
    // Dictionary (accessed on entity UID) to list of component names.
    this.componentsRemoved = {};
}

ComponentObserver.prototype.componentAdded = function(entity, componentName)
{
    if (!(entity in this.componentsAdded))
    {
        this.componentsAdded[entity] = [];
    }
    
    this.componentsAdded[entity].push(componentName);
}

ComponentObserver.prototype.componentRemoved = function(entity, componentName)
{
    if (!(entity in this.componentsRemoved))
    {
        this.componentsRemoved[entity] = [];
    }
    
    this.componentsRemoved[entity].push(componentName);
}