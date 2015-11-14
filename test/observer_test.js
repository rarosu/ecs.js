var expect = chai.expect;

describe('Observer', function() {
    describe('registerEntityObserver', function() {
        it('should notify after registration', function() {
            var entityManager = new ECS.EntityManager();
            var entity1 = entityManager.createEntity();

            var entityObserver = new EntityObserver();
            entityManager.registerEntityObserver(entityObserver);

            var entity2 = entityManager.createEntity();

            expect(entityObserver.entitiesCreated.length).to.equal(1);
        });
    });

    describe('unregisterEntityObserver', function() {
        it('should not notify after unregistration', function() {
            var entityManager = new ECS.EntityManager();
            var entity1 = entityManager.createEntity();

            var entityObserver = new EntityObserver();
            entityManager.registerEntityObserver(entityObserver);

            var entity2 = entityManager.createEntity();

            expect(entityObserver.entitiesCreated.length).to.equal(1);

            entityManager.unregisterEntityObserver(entityObserver);

            var entity3 = entityManager.createEntity();

            expect(entityObserver.entitiesCreated.length).to.equal(1);
        });
    });

    describe('registerComponentObserver', function() {
        it('should notify after registration', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);

            var entity1 = entityManager.createEntity(['Transform']);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity2 = entityManager.createEntity(['Transform']);

            expect(entity1 in componentObserver.componentsAdded).to.equal(false);
            expect(componentObserver.componentsAdded[entity2].length).to.equal(1);
        });

        it('should add an extra observerComponentNames property on the observer', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);

            var entity1 = entityManager.createEntity(['Transform']);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            expect(componentObserver.observerComponentNames).to.not.equal(undefined);
        });
    });

    describe('unregisterComponentObserver', function() {
        it('should not notify after unregistration', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);

            var entity1 = entityManager.createEntity(['Transform']);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity2 = entityManager.createEntity(['Transform']);

            expect(entity1 in componentObserver.componentsAdded).to.equal(false);
            expect(componentObserver.componentsAdded[entity2].length).to.equal(1);

            entityManager.unregisterComponentObserver(componentObserver);

            var entity3 = entityManager.createEntity(['Transform']);

            expect(entity1 in componentObserver.componentsAdded).to.equal(false);
            expect(componentObserver.componentsAdded[entity2].length).to.equal(1);
            expect(entity3 in componentObserver.componentsAdded).to.equal(false);
        });

        it('should remove the extra observerComponentNames property from the observer', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);

            var entity1 = entityManager.createEntity(['Transform']);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            expect(componentObserver.observerComponentNames).to.not.equal(undefined);

            entityManager.unregisterComponentObserver(componentObserver);

            expect(componentObserver.observerComponentNames).to.equal(undefined);
        });
    });

    describe('addComponentObserverComponent', function() {
        it('should notify about new component types of interest', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity1 = entityManager.createEntity(['Renderable']);

            expect(entity1 in componentObserver.componentsAdded).to.equal(false);

            entityManager.addComponentObserverComponent(componentObserver, 'Renderable');

            var entity2 = entityManager.createEntity(['Renderable']);

            expect(entity2 in componentObserver.componentsAdded).to.equal(true);
        });
    });

    describe('removeComponentObserverComponent', function() {
        it('should not notify about removed component types of interest', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity1 = entityManager.createEntity(['Transform']);

            expect(entity1 in componentObserver.componentsAdded).to.equal(true);

            entityManager.removeComponentObserverComponent(componentObserver, 'Transform');

            var entity2 = entityManager.createEntity(['Transform']);

            expect(entity2 in componentObserver.componentsAdded).to.equal(false);
        });
    });

    describe('unregisterComponent', function() {
        it('should notify component observers about all entities with the unregistered component', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity2 = entityManager.createEntity(['Transform']);
            var entity3 = entityManager.createEntity(['Renderable']);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            entityManager.unregisterComponent('Transform');

            expect(componentObserver.componentsRemoved[entity1].length).to.equal(1);
            expect(componentObserver.componentsRemoved[entity1][0]).to.equal('Transform');
            expect(componentObserver.componentsRemoved[entity2].length).to.equal(1);
            expect(componentObserver.componentsRemoved[entity2][0]).to.equal('Transform');
            expect(entity3 in componentObserver.componentsRemoved).to.equal(false);
        });

        it('should remove the component type from the component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Transform', 'Renderable']);

            expect(componentObserver.observerComponentNames.length).to.equal(2);

            entityManager.unregisterComponent('Transform');

            expect(componentObserver.observerComponentNames.length).to.equal(1);
        });

        it('should have valid components when notifying observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);

            var componentObserver = new ComponentObserverValidity(entityManager);
            entityManager.registerComponentObserver(componentObserver, ['Transform']);

            var entity = entityManager.createEntity();

            entityManager.unregisterComponent('Transform');
        });
    });

    describe('createEntity', function() {
        it('should notify entity observers', function() {
            var entityManager = new ECS.EntityManager();

            var entityObserver = new EntityObserver();
            entityManager.registerEntityObserver(entityObserver);

            var entity = entityManager.createEntity();

            expect(entityObserver.entitiesCreated.length).to.equal(1);
        });

        it('should notify component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Renderable']);

            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Renderable']);

            expect(entity1 in componentObserver.componentsAdded).to.equal(false);
            expect(componentObserver.componentsAdded[entity2].length).to.equal(1);
            expect(componentObserver.componentsAdded[entity3].length).to.equal(1);
        });

        it('should have valid components when notifying observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            entityManager.registerEntityObserver(new EntityObserverValidity(entityManager, ['Transform', 'Renderable']));
            entityManager.registerComponentObserver(new ComponentObserverValidity(entityManager), ['Transform', 'Renderable']);

            var entity = entityManager.createEntity(['Transform', 'Renderable']);
        });
    });

    describe('removeEntity', function() {
        it('should notify entity observers', function() {
            var entityManager = new ECS.EntityManager();

            var entityObserver = new EntityObserver();
            entityManager.registerEntityObserver(entityObserver);

            var entity = entityManager.createEntity();
            entityManager.removeEntity(entity);

            expect(entityObserver.entitiesRemoved.length).to.equal(1);
        });

        it('should notify component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Renderable']);

            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Renderable']);

            entityManager.removeEntity(entity1);
            entityManager.removeEntity(entity2);
            entityManager.removeEntity(entity3);

            expect(entity1 in componentObserver.componentsRemoved).to.equal(false);
            expect(componentObserver.componentsRemoved[entity2].length).to.equal(1);
            expect(componentObserver.componentsRemoved[entity3].length).to.equal(1);
        });

        it('should have valid components when notifying observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            entityManager.registerEntityObserver(new EntityObserverValidity(entityManager, ['Transform', 'Renderable']));
            entityManager.registerComponentObserver(new ComponentObserverValidity(entityManager), ['Transform', 'Renderable']);

            var entity = entityManager.createEntity(['Transform', 'Renderable']);
            entityManager.removeEntity(entity);
        });
    });

    describe('addComponent', function() {
        it('should notify component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Renderable']);

            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Renderable']);

            entityManager.addComponent(entity1, 'Renderable');

            expect(componentObserver.componentsAdded[entity1].length).to.equal(1);
            expect(componentObserver.componentsAdded[entity2].length).to.equal(1);
            expect(componentObserver.componentsAdded[entity3].length).to.equal(1);
        });

        it('should have valid components when notifying observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            entityManager.registerComponentObserver(new ComponentObserverValidity(entityManager), ['Transform']);

            var entity = entityManager.createEntity();
            entityManager.addComponent(entity, 'Transform');
        });
    });

    describe('removeComponent', function() {
        it('should notify component observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            var componentObserver = new ComponentObserver();
            entityManager.registerComponentObserver(componentObserver, ['Renderable']);

            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Renderable']);

            entityManager.removeComponent(entity1, 'Transform');
            entityManager.removeComponent(entity2, 'Transform');
            entityManager.removeComponent(entity2, 'Renderable');
            entityManager.removeComponent(entity3, 'Renderable');

            expect(entity1 in componentObserver.componentsRemoved).to.equal(false);
            expect(componentObserver.componentsRemoved[entity2].length).to.equal(1);
            expect(componentObserver.componentsRemoved[entity3].length).to.equal(1);
        });

        it('should have valid components when notifying observers', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);

            entityManager.registerComponentObserver(new ComponentObserverValidity(entityManager), ['Transform']);

            var entity = entityManager.createEntity(['Transform']);
            entityManager.removeComponent(entity, 'Transform');
        });
    });
});
