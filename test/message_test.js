var expect = chai.expect;

describe('Message', function() {
    describe('createMessage', function() {
		it('should add an emitted message to the processor object', function() {
			var entityManager = new ECS.EntityManager();
			
			var processor = new MessageProcessor(entityManager);
			entityManager.registerProcessor(processor);
			
			var message = entityManager.createMessage(processor, []);
			
			expect(processor.emittedMessages).to.include(message);
		});
	});
	
	describe('unregisterProcessor', function() {
		it('should remove all messages emitted by that processor', function() {
			var entityManager = new ECS.EntityManager();
			var processor = {};
			entityManager.registerProcessor(processor);
			
			var message = entityManager.createMessage(processor, []);
			
			expect(entityManager.isDestroyedEntity(message)).to.equal(false);
			
			entityManager.unregisterProcessor(processor);
			
			expect(entityManager.isDestroyedEntity(message)).to.equal(true);
		});
	});
	
	describe('update', function() {
		it('should remove messages before the emitting processor runs again', function() {
			var entityManager = new ECS.EntityManager();
			entityManager.registerComponent('Transform', Transform);
			
			var processor1 = new MessageProcessor(entityManager);
			entityManager.registerProcessor(processor1);
			var processor2 = new MessageProcessor(entityManager);
			entityManager.registerProcessor(processor2);
			
			var message = entityManager.createMessage(processor2, ['Transform']);
			var transform = entityManager.getComponent(message, 'Transform');
			transform.x = 5;
			
			entityManager.update();
			expect(processor1.controlValue).to.equal(5);
			expect(processor2.controlValue).to.equal(0);
			entityManager.update();
			expect(processor1.controlValue).to.equal(5);
			expect(processor2.controlValue).to.equal(0);
		});
	});
});