var expect = chai.expect;

describe('Observer', function() {
    describe('registerEntityObserver', function() {
        it('should notify only after registration', function() {
            var entityManager = new ECS.EntityManager();
            var entity1 = entityManager.createEntity();

            var entityObserver = {
				entitiesCreatedCount: 0,
				entityCreated: function(entity) { this.entitiesCreatedCount++; },
				entityRemoved: function(entity) {}
			};
            entityManager.registerEntityObserver(entityObserver);

            var entity2 = entityManager.createEntity();

            expect(entityObserver.entitiesCreatedCount).to.equal(1);
        });
    });

    describe('unregisterEntityObserver', function() {
        it('should not notify after unregistration', function() {
            var entityManager = new ECS.EntityManager();
            var entity1 = entityManager.createEntity();

            var entityObserver = {
				entitiesCreatedCount: 0,
				entityCreated: function(entity) { this.entitiesCreatedCount++; },
				entityRemoved: function(entity) {}
			};
            entityManager.registerEntityObserver(entityObserver);

            var entity2 = entityManager.createEntity();

            expect(entityObserver.entitiesCreatedCount).to.equal(1);

            entityManager.unregisterEntityObserver(entityObserver);

            var entity3 = entityManager.createEntity();

            expect(entityObserver.entitiesCreatedCount).to.equal(1);
        });
    });

    describe('registerComponentObserver', function() {
        it('should notify after registration', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});

            var entity1 = entityManager.createEntity(['Transform']);

            var componentObserver = {
				componentsAddedCount: 0,
				componentAdded: function(entity, componentName) { this.componentsAddedCount++; },
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity2 = entityManager.createEntity(['Transform']);

            expect(componentObserver.componentsAddedCount).to.equal(1);
        });

        it('should add an extra observerComponentNames property on the observer', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});

            var entity1 = entityManager.createEntity(['Transform']);

            var componentObserver = {
				componentAdded: function(entity, componentName) {},
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            expect(componentObserver.observerComponentNames).to.not.equal(undefined);
        });
    });

    describe('unregisterComponentObserver', function() {
        it('should not notify after unregistration', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});

            var entity1 = entityManager.createEntity(['Transform']);

            var componentObserver = {
				componentsAddedCount: 0,
				componentAdded: function(entity, componentName) { this.componentsAddedCount++; },
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);
			expect(componentObserver.componentsAddedCount).to.equal(0);
			
            var entity2 = entityManager.createEntity(['Transform']);
            expect(componentObserver.componentsAddedCount).to.equal(1);

            entityManager.unregisterComponentObserver(componentObserver);

            var entity3 = entityManager.createEntity(['Transform']);

            expect(componentObserver.componentsAddedCount).to.equal(1);
        });

        it('should remove the extra observerComponentNames property from the observer', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});

            var entity1 = entityManager.createEntity(['Transform']);

            var componentObserver = {
				componentAdded: function(entity, componentName) {},
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            expect(componentObserver.observerComponentNames).to.not.equal(undefined);

            entityManager.unregisterComponentObserver(componentObserver);

            expect(componentObserver.observerComponentNames).to.equal(undefined);
        });
    });

    describe('addComponentObserverComponent', function() {
        it('should notify about new component types of interest', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

            var componentObserver = {
				entitiesNotifiedAbout: [],
				componentAdded: function(entity, componentName) { this.entitiesNotifiedAbout.push(entity); },
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity1 = entityManager.createEntity(['Renderable']);

            expect(componentObserver.entitiesNotifiedAbout).to.not.contain(entity1);

            entityManager.addComponentObserverComponent(componentObserver, 'Renderable');

            var entity2 = entityManager.createEntity(['Renderable']);

            expect(componentObserver.entitiesNotifiedAbout).to.contain(entity2);
        });
    });

    describe('removeComponentObserverComponent', function() {
        it('should not notify about removed component types of interest', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});

            var componentObserver = {
				entitiesNotifiedAbout: [],
				componentAdded: function(entity, componentName) { this.entitiesNotifiedAbout.push(entity); },
				componentRemoved: function(entity, componentName) {}
			};
			
            entityManager.registerComponentObserver(componentObserver, ['Transform']);
            var entity1 = entityManager.createEntity(['Transform']);

            expect(componentObserver.entitiesNotifiedAbout).to.contain(entity1);

            entityManager.removeComponentObserverComponent(componentObserver, 'Transform');
            var entity2 = entityManager.createEntity(['Transform']);

            expect(componentObserver.entitiesNotifiedAbout).to.not.contain(entity2);
        });
    });

    describe('unregisterComponent', function() {
        it('should notify component observers about all entities with the unregistered component', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity2 = entityManager.createEntity(['Transform']);
            var entity3 = entityManager.createEntity(['Renderable']);

            var componentObserver = {
				entitiesNotifiedAbout: [],
				componentAdded: function(entity, componentName) {},
				componentRemoved: function(entity, componentName) { this.entitiesNotifiedAbout.push(entity); }
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            entityManager.unregisterComponent('Transform');

            expect(componentObserver.entitiesNotifiedAbout.length).to.equal(2);
			expect(componentObserver.entitiesNotifiedAbout).to.contain(entity1);
			expect(componentObserver.entitiesNotifiedAbout).to.contain(entity2);
        });

        it('should remove the component type from the component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

            var componentObserver = {
				componentAdded: function(entity, componentName) {},
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform', 'Renderable']);

            expect(componentObserver.observerComponentNames.length).to.equal(2);

            entityManager.unregisterComponent('Transform');

            expect(componentObserver.observerComponentNames.length).to.equal(1);
        });

        it('should have valid components when notifying observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});

            var componentObserver = {
				valid: false,
				componentAdded: function(entity, componentName) {},
				componentRemoved: function(entity, componentName) { this.valid = entity in entityManager.componentEntityTable[componentName]; }
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity = entityManager.createEntity(['Transform']);
            entityManager.unregisterComponent('Transform');
			
			expect(componentObserver.valid).to.equal(true);
        });
    });

    describe('createEntity', function() {
        it('should notify entity observers', function() {
            var entityManager = new ECS.EntityManager();

            var entityObserver = {
				entitiesCreatedCount: 0,
				entityCreated: function(entity) { this.entitiesCreatedCount++; },
				entityRemoved: function(entity) {}
			};
            entityManager.registerEntityObserver(entityObserver);

            var entity = entityManager.createEntity();

            expect(entityObserver.entitiesCreatedCount).to.equal(1);
        });

        it('should notify component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

            var componentObserver = {
				componentsAddedCount: 0,
				componentAdded: function(entity, componentName) { this.componentsAddedCount++; },
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Renderable']);

            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Renderable']);

			expect(componentObserver.componentsAddedCount).to.equal(2);
        });

        it('should have valid components when notifying entity observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

			var entityObserver = {
				valid: false,
				entityCreated: function(entity) {
					this.valid = true;
					this.valid = this.valid && (entity in entityManager.componentEntityTable.Transform);
					this.valid = this.valid && (entity in entityManager.componentEntityTable.Renderable);
				},
				entityRemoved: function(entity) {}
			};
			entityManager.registerEntityObserver(entityObserver);
			
			var entity = entityManager.createEntity(['Transform', 'Renderable']);
			
			expect(entityObserver.valid).to.equal(true);
        });
		
		it('should have valid components when notifying component observers', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
			
			var componentObserver = {
				valid: false,
				componentAdded: function(entity, componentName) { this.valid = entity in entityManager.componentEntityTable[componentName]; },
				componentRemoved: function(entity, componentName) {}
			};
			entityManager.registerComponentObserver(componentObserver, ['Transform']);
			
			var entity = entityManager.createEntity(['Transform']);
			
			expect(componentObserver.valid).to.equal(true);
		});
    });

    describe('removeEntity', function() {
        it('should notify entity observers', function() {
            var entityManager = new ECS.EntityManager();

            var entityObserver = {
				entitiesRemovedCount: 0,
				entityCreated: function(entity) {},
				entityRemoved: function(entity) { this.entitiesRemovedCount++; }
			};
            entityManager.registerEntityObserver(entityObserver);

            var entity = entityManager.createEntity();
            entityManager.removeEntity(entity);

            expect(entityObserver.entitiesRemovedCount).to.equal(1);
        });

        it('should notify component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

            var componentObserver = {
				componentsRemovedCount: 0,
				componentAdded: function(entity, componentName) {},
				componentRemoved: function(entity, componentName) { this.componentsRemovedCount++; }
			};
            entityManager.registerComponentObserver(componentObserver, ['Renderable']);

            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Renderable']);

            entityManager.removeEntity(entity1);
            entityManager.removeEntity(entity2);
            entityManager.removeEntity(entity3);

			expect(componentObserver.componentsRemovedCount).to.equal(2);
        });

        it('should have valid components when notifying entity observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

			var entityObserver = {
				valid: false,
				entityCreated: function(entity) {},
				entityRemoved: function(entity) {
					this.valid = true;
					this.valid = this.valid && (entity in entityManager.componentEntityTable.Transform);
					this.valid = this.valid && (entity in entityManager.componentEntityTable.Renderable);
				}
			};
			entityManager.registerEntityObserver(entityObserver);
			
			var entity = entityManager.createEntity(['Transform', 'Renderable']);
			entityManager.removeEntity(entity);
			
			expect(entityObserver.valid).to.equal(true);
        });
		
		it('should have valid components when notifying component observers', function() {
			var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
			
			var componentObserver = {
				valid: false,
				componentAdded: function(entity, componentName) {  },
				componentRemoved: function(entity, componentName) { this.valid = entity in entityManager.componentEntityTable[componentName]; }
			};
			entityManager.registerComponentObserver(componentObserver, ['Transform']);
			
			var entity = entityManager.createEntity(['Transform']);
			entityManager.removeEntity(entity);
			
			expect(componentObserver.valid).to.equal(true);
		});
		
		it('should notify about destroyed child entities before parent entities', function() {
			var entityManager = new ECS.EntityManager();
            var root = entityManager.createEntity();
            var child = entityManager.createEntity([], root);
			
			var entityObserver = {
				entitiesRemoved: [],
				entityCreated: function(entity) {},
				entityRemoved: function(entity) { this.entitiesRemoved.push(entity); }
			};
			entityManager.registerEntityObserver(entityObserver);
			
			entityManager.removeEntity(root);
			
			expect(entityObserver.entitiesRemoved[0]).to.equal(child);
			expect(entityObserver.entitiesRemoved[1]).to.equal(root);
		});
    });

    describe('addComponent', function() {
        it('should notify component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

            var componentObserver = {
				componentsAddedCount: 0,
				componentAdded: function(entity, componentName) { this.componentsAddedCount++; },
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Renderable']);

            var entity1 = entityManager.createEntity(['Transform']);

            entityManager.addComponent(entity1, 'Renderable');

            expect(componentObserver.componentsAddedCount).to.equal(1);
        });

        it('should have valid components when notifying observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});

			var componentObserver = {
				valid: false,
				componentAdded: function(entity, componentName) { valid = entity in entityManager.componentEntityTable[componentName]; },
				componentRemoved: function(entity, componentName) {}
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity = entityManager.createEntity();
            entityManager.addComponent(entity, 'Transform');
        });
    });

    describe('removeComponent', function() {
        it('should notify component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

            var componentObserver = {
				componentsRemovedCount: 0,
				componentAdded: function(entity, componentName) {},
				componentRemoved: function(entity, componentName) { this.componentsRemovedCount++; }
			};
            entityManager.registerComponentObserver(componentObserver, ['Renderable']);

            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Renderable']);

            entityManager.removeComponent(entity1, 'Transform');
            entityManager.removeComponent(entity2, 'Transform');
            entityManager.removeComponent(entity2, 'Renderable');
            entityManager.removeComponent(entity3, 'Renderable');

			expect(componentObserver.componentsRemovedCount).to.equal(2);
        });

        it('should have valid components when notifying observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', {});
            entityManager.registerComponent('Renderable', {});

			var componentObserver = {
				valid: false,
				componentAdded: function(entity, componentName) {},
				componentRemoved: function(entity, componentName) { this.valid = entity in entityManager.componentEntityTable[componentName]; }
			};
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity = entityManager.createEntity(['Transform']);
            entityManager.removeComponent(entity, 'Transform');
			
			expect(componentObserver.valid).to.equal(true);
        });
    });
});
