var expect = chai.expect;

describe('Processor', function() {
    describe('registerProcessor', function() {
        it('should store the processors in order', function() {
            var entityManager = new ECS.EntityManager();
            var processor1 = new RenderingProcessor(entityManager);
            var processor2 = new RenderingProcessor(entityManager);

            entityManager.registerProcessor(processor1);
            entityManager.registerProcessor(processor2);

            expect(entityManager.processors.length).to.equal(2);
            expect(entityManager.processors[0]).to.equal(processor1);
            expect(entityManager.processors[1]).to.equal(processor2);
        });

        it('should add an extra emittedMessages property to the processors', function() {
            var entityManager = new ECS.EntityManager();
            var processor = new RenderingProcessor(entityManager);

            expect(processor.emittedMessages).to.equal(undefined);

            entityManager.registerProcessor(processor);

            expect(processor.emittedMessages).to.not.equal(undefined);
        });
    });

    describe('unregisterProcessor', function() {
        it('should no longer be stored after removal', function() {
            var entityManager = new ECS.EntityManager();
            var processor = new RenderingProcessor(entityManager);
            entityManager.registerProcessor(processor);
            expect(entityManager.processors.length).to.equal(1);
            entityManager.unregisterProcessor(processor);
            expect(entityManager.processors.length).to.equal(0);
        });
		
		it('should remove the emittedMessages property', function() {
			var entityManager = new ECS.EntityManager();
            var processor = new RenderingProcessor(entityManager);
			entityManager.registerProcessor(processor);
			expect(processor.emittedMessages).to.not.equal(undefined);
			entityManager.unregisterProcessor(processor);
			expect(processor.emittedMessages).to.equal(undefined);
		});
    });
	
	describe('update', function() {
		it('should be updated once per frame', function() {
			var processor = {
				count: 0,
				update: function() {
					this.count++;
				}
			};
			
			var entityManager = new ECS.EntityManager();
			entityManager.registerProcessor(processor);
			entityManager.update();
			expect(processor.count).to.equal(1);
			entityManager.update();
			expect(processor.count).to.equal(2);
		});
	});
});
