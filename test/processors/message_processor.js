function MessageProcessor(entityManager)
{
	this.controlValue = 0;
    this.entityManager = entityManager;
	this.messageFilter = this.entityManager.createEntityFilter(['Transform']);
}

MessageProcessor.prototype.update = function()
{
    for (var i = 0; i < this.messageFilter.entities.length; ++i)
    {
		var messages = this.messageFilter.entities;
        var transform = this.entityManager.getComponent(messages[i], 'Transform');
        
        this.controlValue += transform.x;
    }
};