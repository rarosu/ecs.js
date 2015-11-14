function RenderingProcessor(entityManager)
{
    this.entityManager = entityManager;
	this.entityFilter = this.entityManager.createEntityFilter(['Transform', 'Renderable']);
}

RenderingProcessor.prototype.update = function()
{
    for (var i = 0; i < this.entityFilter.entities.length; ++i)
    {
		var entity = this.entityFilter.entities[i];
        var transform = this.entityManager.getComponent(entity, 'Transform');
        
		transform.x += 10;
        transform.y += 15;
        renderable.VAO += 4;
    }
};