function EntityObserver()
{
    this.entitiesCreated = [];
    this.entitiesRemoved = [];
}

EntityObserver.prototype.entityCreated = function(entity)
{
    this.entitiesCreated.push(entity);
}

EntityObserver.prototype.entityRemoved = function(entity)
{
    this.entitiesRemoved.push(entity);
}