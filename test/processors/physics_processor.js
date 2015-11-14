function RenderingProcessor(entityManager)
{
    this.entityManager = entityManager;
	this.entityFilter = this.entityManager.createEntityFilter(['Transform']);
}

RenderingProcessor.prototype.update = function()
{
    for (var i = 0; i < this.entityFilter.entities.length; ++i)
    {
        var transform = this.entityFilter.entities[i].getComponent(entities[i], 'Transform');
        
        transform.x += 10;
        transform.y += 15;
    }
};