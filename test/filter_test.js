var expect = chai.expect;

describe('Filter', function() {
    describe('createEntityFilter', function() {
        it('should store and return a filter with correct properties', function() {
            var entityManager = new ECS.EntityManager();
			entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);

            expect(entityManager.entityFilters.length).to.equal(1);
            expect(entityManager.entityFilters[0]).to.equal(entityFilter);

            expect(entityFilter.componentNames).to.not.equal(undefined);
            expect(entityFilter.componentNames.length).to.equal(2);

            expect(entityFilter.entities).to.not.equal(undefined);
            expect(entityFilter.entities.length).to.equal(0);
			
			expect(entityFilter.nextEntity).to.not.equal(undefined);
			expect(entityFilter.nextEntity).to.equal(0);
			
			expect(entityFilter.isProcessing).to.not.equal(undefined);
			expect(entityFilter.isProcessing).to.equal(false);
        });

        it('should be given the correct set of entities at creation', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            entityManager.registerComponent('Route', {});

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
			entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
			
			expect(entityManager.entityFilters).to.include(entityFilter);
			
			entityManager.removeEntityFilter(entityFilter);
			
			expect(entityManager.entityFilters).to.not.include(entityFilter);
		});
	});
	
	describe('unregisterComponent', function() {
		it('should have its component list updated when components are unregistered', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
			
			var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
			
			entityManager.unregisterComponent('Transform');
			
			expect(entityFilter.componentNames.length).to.equal(1);
			expect(entityFilter.componentNames).to.include('Renderable');
			expect(entityFilter.componentNames).to.not.include('Transform');
		});
		
		it('should have the same entities after a component is unregistered leaving a filter with more than one component', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
			
			var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
			
			entityManager.unregisterComponent('Transform');
			
			expect(entityFilter.entities.length).to.equal(1);
			expect(entityFilter.entities).to.include(entity1);
		});
		
		it('should have an empty entity set if all component types it is subscribing to are unregistered', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
			
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
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            entityManager.registerComponent('Route', {});

            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);

            expect(entityFilter.entities.length).to.equal(1);
            expect(entityFilter.entities).to.include(entity1);
        });
		
		it('should not add entities not matching the aspect', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            entityManager.registerComponent('Route', {});

            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            var entity1 = entityManager.createEntity(['Transform']);

            expect(entityFilter.entities.length).to.equal(0);
            expect(entityFilter.entities).to.not.include(entity1);
		});
	});
	
	describe('createMessage', function() {
		it('should have its entity list updated when messages are created (messages are also handled by entity filters)', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            entityManager.registerComponent('Route', {});

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
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            entityManager.registerComponent('Route', {});

            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            expect(entityFilter.entities).to.include(entity1);

            entityManager.removeEntity(entity1);
            expect(entityFilter.entities.length).to.equal(0);
        });
		
		it('should be possible to remove the currently processed entity while updating a processor', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
			
			var entity1 = entityManager.createEntity(['Transform']);
			var entity2 = entityManager.createEntity(['Transform']);
			var entity3 = entityManager.createEntity(['Transform']);
			
			var processor = {
				entitiesUpdatedCount: 0,
				entityFilter: entityManager.createEntityFilter(['Transform']),
				update: function() {
					for (var entity of this.entityFilter) {
						if (this.entitiesUpdatedCount == 1) {
							entityManager.removeEntity(entity2);
						}
						
						this.entitiesUpdatedCount++;
					}
				}
			};
			
			entityManager.registerProcessor(processor);
			
			entityManager.update();
			
			expect(entityManager.isDestroyedEntity(entity1)).to.equal(false);
			expect(entityManager.isDestroyedEntity(entity2)).to.equal(true);
			expect(entityManager.isDestroyedEntity(entity3)).to.equal(false);
			expect(processor.entitiesUpdatedCount).to.equal(3);
		});
		
		it('should be possible to remove already processed entities while updating a processor', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
			
			var entity1 = entityManager.createEntity(['Transform']);
			var entity2 = entityManager.createEntity(['Transform']);
			var entity3 = entityManager.createEntity(['Transform']);
			
			var processor = {
				entitiesUpdatedCount: 0,
				entityFilter: entityManager.createEntityFilter(['Transform']),
				update: function() {
					for (var entity of this.entityFilter) {
						if (this.entitiesUpdatedCount == 1) {
							entityManager.removeEntity(entity1);
						}
						
						this.entitiesUpdatedCount++;
					}
				}
			};
			
			entityManager.registerProcessor(processor);
			
			entityManager.update();
			
			expect(entityManager.isDestroyedEntity(entity1)).to.equal(true);
			expect(entityManager.isDestroyedEntity(entity2)).to.equal(false);
			expect(entityManager.isDestroyedEntity(entity3)).to.equal(false);
			expect(processor.entitiesUpdatedCount).to.equal(3);
		});
		
		it('should be possible to remove entities yet to be processed while updating a processor', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
			
			var entity1 = entityManager.createEntity(['Transform']);
			var entity2 = entityManager.createEntity(['Transform']);
			var entity3 = entityManager.createEntity(['Transform']);
			
			var processor = {
				entitiesUpdatedCount: 0,
				entityFilter: entityManager.createEntityFilter(['Transform']),
				update: function() {
					for (var entity of this.entityFilter) {
						if (this.entitiesUpdatedCount == 1) {
							entityManager.removeEntity(entity3);
						}
						
						this.entitiesUpdatedCount++;
					}
				}
			};
			
			entityManager.registerProcessor(processor);
			
			entityManager.update();
			
			expect(entityManager.isDestroyedEntity(entity1)).to.equal(false);
			expect(entityManager.isDestroyedEntity(entity2)).to.equal(false);
			expect(entityManager.isDestroyedEntity(entity3)).to.equal(true);
			expect(processor.entitiesUpdatedCount).to.equal(2);
		});
	});
	
	describe('addComponent', function() {
		it('should process entities that are now matching the aspect', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            entityManager.registerComponent('Route', {});

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
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            entityManager.registerComponent('Route', {});

            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            expect(entityFilter.entities).to.include(entity1);

            entityManager.removeComponent(entity1, 'Renderable');
            expect(entityFilter.entities).to.not.include(entity1);
        });
		
		it('should still process entities that are matching the aspect, even if other components are removed', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});
            entityManager.registerComponent('Route', {});

            var entity1 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            var entityFilter = entityManager.createEntityFilter(['Transform', 'Renderable']);
            expect(entityFilter.entities).to.include(entity1);

            entityManager.removeComponent(entity1, 'Route');
            expect(entityFilter.entities).to.include(entity1);
		});
	});
	
	
});
