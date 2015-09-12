var expect = chai.expect;

describe('Component', function() {
    describe('registerComponent', function() {
        it('should store registered component types', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            expect('Transform' in entityManager.components).to.equal(true);
            expect('Renderable' in entityManager.components).to.equal(true);
        });
    });
    
    describe('unregisterComponent', function() {
        it('should remove stored component type', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.unregisterComponent('Transform');
            
            expect('Transform' in entityManager.components).to.equal(false);
            expect('Renderable' in entityManager.components).to.equal(true);
        });
    });
    
    describe('addComponent', function() {
        it('should store the entity in the table for the component', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            var entity = entityManager.createEntity();
            entityManager.addComponent(entity, 'Transform');
            
            expect(entity in entityManager.componentEntityTable.Transform).to.equal(true);
        });
        
        it('should store a clone of the component type', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            var entity = entityManager.createEntity();
            entityManager.addComponent(entity, 'Transform');
            
            expect(entity !== Transform).to.equal(true);
            
            var transform = entityManager.getComponent(entity, 'Transform');
            transform.x = 10;
            
            expect(Transform.x === 0).to.equal(true);
        });
    });
    
    describe('addComponents', function() {
        it('should store the entity in the table for the components', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            var entity = entityManager.createEntity();
            entityManager.addComponents(entity, ['Transform', 'Renderable']);
            
            expect(entity in entityManager.componentEntityTable.Transform).to.equal(true);
            expect(entity in entityManager.componentEntityTable.Renderable).to.equal(true);
        });
    });
    
    describe('removeComponent', function() {
        it('should remove the entity from the table for the component', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            var entity = entityManager.createEntity();
            entityManager.addComponents(entity, ['Transform', 'Renderable']);
            
            expect(entity in entityManager.componentEntityTable.Transform).to.equal(true);
            expect(entity in entityManager.componentEntityTable.Renderable).to.equal(true);
            
            entityManager.removeComponent(entity, 'Transform');
            
            expect(entity in entityManager.componentEntityTable.Transform).to.equal(false);
        });
    });
    
    describe('getComponent', function() {
        it('should return a valid instance for existing components', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            
            var entity = entityManager.createEntity(['Transform']);
            var transform = entityManager.getComponent(entity, 'Transform');
            expect(transform).to.not.equal(undefined);
        });
        
        it('should return undefined for entities without component', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            
            var entity = entityManager.createEntity();
            var transform = entityManager.getComponent(entity, 'Transform');
            expect(transform).to.equal(undefined);
        });
    });
    
    describe('getEntitiesDataByComponent', function() {
        it('should return all entities with the specified component', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            var entity1 = entityManager.createEntity();
            var entity2 = entityManager.createEntity(['Transform']);
            var entity3 = entityManager.createEntity(['Renderable']);
            var entity4 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity5 = entityManager.createEntity(['Transform', 'Renderable']);
            
            var transform2 = entityManager.getComponent(entity2, 'Transform');
            transform2.x = 15;
            transform2.y = 10;
            
            var transformEntities = entityManager.getEntitiesDataByComponent('Transform');
            console.log(transformEntities);
            expect(entity2 in transformEntities).to.equal(true);
            expect(entity4 in transformEntities).to.equal(true);
            expect(entity5 in transformEntities).to.equal(true);
            
            expect(transformEntities[entity2].x).to.equal(15);
        });
    });
    
    describe('getEntitiesByComponents', function() {
        it('should return all entities with all the specified components', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            var entity1 = entityManager.createEntity();
            var entity2 = entityManager.createEntity(['Transform']);
            var entity3 = entityManager.createEntity(['Renderable']);
            var entity4 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity5 = entityManager.createEntity(['Transform', 'Renderable']);
            
            console.log(entityManager);
            
            var transformEntities = entityManager.getEntitiesByComponents(['Transform']);
            
            expect(transformEntities).to.include(entity2);
            expect(transformEntities).to.include(entity4);
            expect(transformEntities).to.include(entity5);
            
            var transformRenderableEntities = entityManager.getEntitiesByComponents(['Transform', 'Renderable']);
            
            expect(transformRenderableEntities).to.include(entity4);
            expect(transformRenderableEntities).to.include(entity5);
        });
    });
    
    
});