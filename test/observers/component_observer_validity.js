function ComponentObserverValidity(entityManager)
{
    this.entityManager = entityManager;
}

ComponentObserverValidity.prototype.componentAdded = function(entity, componentName)
{
    expect(entity in this.entityManager.componentEntityTable[componentName]).to.equal(true);
}

ComponentObserverValidity.prototype.componentRemoved = function(entity, componentName)
{
    expect(entity in this.entityManager.componentEntityTable[componentName]).to.equal(true);
}