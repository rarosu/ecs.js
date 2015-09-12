function PhysicsProcessor(entityManager)
{
    this.entityManager = entityManager;
}

PhysicsProcessor.prototype.update = function()
{
    var entities = this.entityManager.getEntitiesByProcessor(this);
    
    for (var i = 0; i < entities.length; ++i)
    {
        var transform = this.entityManager.getComponent(entities[i], 'Transform');
        
        transform.x += 10;
        transform.y += 15;
    }
};