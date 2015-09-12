function EntityObserverValidity(entityManager, expectedComponentNames)
{
    this.entityManager = entityManager;
    this.expectedComponentNames = expectedComponentNames;
}

EntityObserverValidity.prototype.entityCreated = function(entity)
{
    for (var i = 0; i < this.expectedComponentNames; i++)
    {
        expect(entity in this.entityManager.componentEntityTable[this.expectedComponentNames[i]]).to.equal(true);
    }
};

EntityObserverValidity.prototype.entityRemoved = function(entity)
{
    for (var i = 0; i < this.expectedComponentNames; i++)
    {
        expect(entity in this.entityManager.componentEntityTable[this.expectedComponentNames[i]]).to.equal(true);
    }
};