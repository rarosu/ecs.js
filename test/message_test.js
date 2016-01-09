var expect = chai.expect;

describe('Message', function() {
    describe('createMessage', function() {
		it('should add an emitted message to the processor object', function() {
			var entityManager = new ECS.EntityManager();
			
			var processor = {
				messages: [],
				update: function() {}
			};
			
			entityManager.registerProcessor(processor);
			
			var message = entityManager.createMessage(processor, []);
			
			expect(processor.emittedMessages).to.include(message);
		});
	});
	
	describe('unregisterProcessor', function() {
		it('should remove all messages emitted by that processor', function() {
			var entityManager = new ECS.EntityManager();
			var processor = {
				update: function() {}
			};
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
			entityManager.registerComponent('Transform', {});
			
			var processor1 = {
				doneSendingMessages: false,
				update: function() {
					if (!this.doneSendingMessages) {
						entityManager.createMessage(processor1, ['Transform']);
						this.doneSendingMessages = true;
					}
				}
			};
			entityManager.registerProcessor(processor1);
			
			var processor2 = {
				messagesProcessedCount: 0,
				messageFilter: entityManager.createEntityFilter(['Transform']),
				update: function() {
					for (var message = this.messageFilter.first(); message !== undefined; message = this.messageFilter.next()) {
					//for (var message of this.messageFilter) {
						this.messagesProcessedCount++;
					}
				}
			};
			entityManager.registerProcessor(processor2);
			
			entityManager.update();
			expect(processor2.messagesProcessedCount).to.equal(1);
			entityManager.update();
			expect(processor2.messagesProcessedCount).to.equal(1);
		});
		
		it('should be possible to declare a processor after the emitting processor', function() {
			var entityManager = new ECS.EntityManager();
			entityManager.registerComponent('Transform', {});
			
			var processor1 = {
				update: function() {
					entityManager.createMessage(this, ['Transform']);
				}
			};
			entityManager.registerProcessor(processor1);
			
			var processor2 = {
				messagesProcessedCount: 0,
				messageFilter: entityManager.createEntityFilter(['Transform']),
				update: function() {
					for (var message = this.messageFilter.first(); message !== undefined; message = this.messageFilter.next()) {
					//for (var message of this.messageFilter) {
						this.messagesProcessedCount++;
					}
				}
			};
			entityManager.registerProcessor(processor2);
			
			entityManager.update();
			expect(processor2.messagesProcessedCount).to.equal(1);
		});
		
		it('should be possible to declare a processor before the emitting processor', function() {
			var entityManager = new ECS.EntityManager();
			entityManager.registerComponent('Transform', {});
			
			var processor1 = {
				messagesProcessedCount: 0,
				messageFilter: entityManager.createEntityFilter(['Transform']),
				update: function() {
					for (var message = this.messageFilter.first(); message !== undefined; message = this.messageFilter.next()) {
					//for (var message of this.messageFilter) {
						this.messagesProcessedCount++;
					}
				}
			};
			entityManager.registerProcessor(processor1);
			
			var processor2 = {
				update: function() {
					entityManager.createMessage(this, ['Transform']);
				}
			};
			entityManager.registerProcessor(processor2);
			
			entityManager.update();
			entityManager.update(); // The message will be parsed the second update.
			expect(processor1.messagesProcessedCount).to.equal(1);
		});
	});
});