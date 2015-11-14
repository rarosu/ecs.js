var expect = chai.expect;

describe('Filter', function() {
    describe('createEntityFilter', function() {
        it('should store and return a filter with correct properties', function() {
            var entityManager = new ECS.EntityManager();
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);

            expect(entityManager.entityFilters.length).to.equal(1);
            expect(entityManager.entityFilters[0]).to.equal(entityFilter);

            expect(entityFilter.componentNames).to.not.equal(undefined);
            expect(entityFilter.componentNames.length).to.equal(2);

            expect(entityFilter.entities).to.not.equal(undefined);
            expect(entityFilter.entities.length).to.equal(0);
        });

        it('should be given the correct set of entities at creation', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);

            var entity1 = entityManager.createEntity();
            var entity2 = entityManager.createEntity(['Transform']);
            var entity3 = entityManager.createEntity(['Renderable']);
            var entity4 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity5 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);

            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);

            expect(entityFilter.entities.length).to.equal(2);
            expect(entityFilter.entities).to.not.include(entity1);
            expect(entityFilter.entities).to.not.include(entity2);
            expect(entityFilter.entities).to.not.include(entity3);
            expect(entityFilter.entities).to.include(entity4);
            expect(entityFilter.entities).to.include(entity5);
        });
    });
	
	describe('removeEntityFilter', function() {
		it('should remove the internal reference to this filter', function() {
			var entityManager = new ECS.EntityManager();
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
			expect(entityManager.entityFilters).to.include(entityFilter);
			
			entityManager.removeEntityFilter(entityFilter);
			
			expect(entityManager.entityFilters).to.not.include(entityFilter);
		});
	});
	
	describe('unregisterComponent', function() {
		it('should have its component list updated when components are unregistered', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
			
			var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
			
			entityManager.unregisterComponent('Transform');
			
			expect(entityFilter.componentNames.length).to.equal(1);
			expect(entityFilter.componentNames).to.include('Renderable');
			expect(entityFilter.componentNames).to.not.include('Transform');
		});
		
		it('should have the same entities after a component is unregistered leaving a filter with more than one component', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
			
			var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
			
			entityManager.unregisterComponent('Transform');
			
			expect(entityFilter.entities.length).to.equal(1);
			expect(entityFilter.entities).to.include(entity1);
		});
		
		it('should have an empty entity set if all component types it is subscribing to are unregistered', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
			
			var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
			
			entityManager.unregisterComponent('Transform');
			entityManager.unregisterComponent('Renderable');
			
			expect(entityFilter.entities.length).to.equal(0);
		});
	});
	
	describe('createEntity', function() {
		it('should have its entity list updated when entities are created', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);

            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);

            expect(entityFilter.entities.length).to.equal(1);
            expect(entityFilter.entities).to.include(entity1);
        });
		
		it('should not add entities not matching the aspect', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);

            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            var entity1 = entityManager.createEntity(['Transform']);

            expect(entityFilter.entities.length).to.equal(0);
            expect(entityFilter.entities).to.not.include(entity1);
		});
	});
	
	describe('createMessage', function() {
		it('should have its entity list updated when messages are created (messages are also handled by entity filters)', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);

            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
			var processor = {};
			entityManager.registerProcessor(processor);
            var entity1 = entityManager.createMessage(processor, ['Transform', 'Renderable']);

            expect(entityFilter.entities.length).to.equal(1);
            expect(entityFilter.entities).to.include(entity1);
		});
	});
	
	describe('removeEntity', function() {
		it('should have its entity list updated when entities are removed', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);

            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            expect(entityFilter.entities).to.include(entity1);

            entityManager.removeEntity(entity1);
            expect(entityFilter.entities.length).to.equal(0);
        });
	});
	
	describe('addComponent', function() {
		it('should process entities that are now matching the aspect', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);

            var entity1 = entityManager.createEntity(['Transform']);
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            expect(entityFilter.entities).to.not.include(entity1);

            entityManager.addComponent(entity1, 'Renderable');
            expect(entityFilter.entities).to.include(entity1);
        });
	});
	
	describe('removeComponent', function() {
		it('should not process entities that are no longer matching the aspect', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);

            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            expect(entityFilter.entities).to.include(entity1);

            entityManager.removeComponent(entity1, 'Renderable');
            expect(entityFilter.entities).to.not.include(entity1);
        });
		
		it('should still process entities that are matching the aspect, even if other components are removed', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);

            var entity1 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            expect(entityFilter.entities).to.include(entity1);

            entityManager.removeComponent(entity1, 'Route');
            expect(entityFilter.entities).to.include(entity1);
		});
	});
	
	
});
