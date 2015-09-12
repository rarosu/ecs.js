function RenderingProcessor(entityManager)
{
    this.entityManager = entityManager;
}

RenderingProcessor.prototype.update = function()
{
    var entities = this.entityManager.getEntitiesByProcessor(this);
    
    for (var i = 0; i < entities.length; ++i)
    {
        var transform = this.entityManager.getComponent(entities[i], 'Transform');
        var renderable = this.entityManager.getComponent(entities[i], 'Renderable');
        
        transform.x += 10;
        transform.y += 15;
        renderable.VAO += 4;
    }
};