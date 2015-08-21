var expect = chai.expect;

function RenderingProcessor(entityManager)
{
    this.entityManager = entityManager;
}

RenderingProcessor.prototype.update = function()
{
    var entities = this.entityManager.getEntitiesByProcessor(this);
    
    for (var i = 0; i < entities.length; ++i)
    {
        var transform = this.entityManager.getComponent(entities[i], 'Transform');
        var renderable = this.entityManager.getComponent(entities[i], 'Renderable');
        
        transform.x += 10;
        transform.y += 15;
        renderable.VAO += 4;
    }
}

function PhysicsProcessor(entityManager)
{
    this.entityManager = entityManager;
}

PhysicsProcessor.prototype.update = function()
{
    var entities = this.entityManager.getEntitiesByProcessor(this);
    
    for (var i = 0; i < entities.length; ++i)
    {
        var transform = this.entityManager.getComponent(entities[i], 'Transform');
        
        transform.x += 10;
        transform.y += 15;
    }
}

describe('Processor', function() {
    describe('registerProcessor', function() {
        it('should add and process entities having all the specified components', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);
            
            var entity1 = entityManager.createEntity();
            var entity2 = entityManager.createEntity(['Transform']);
            var entity3 = entityManager.createEntity(['Renderable']);
            var entity4 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity5 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            
            entityManager.registerProcessor(new RenderingProcessor(entityManager), ['Transform', 'Renderable']);
            entityManager.update();
            
            expect(entity1 in entityManager.componentEntityTable['Transform']).to.equal(false);
            expect(entity1 in entityManager.componentEntityTable['Transform']).to.equal(false);
            expect(entity1 in entityManager.componentEntityTable['Renderable']).to.equal(false);
            
            expect(entityManager.componentEntityTable['Transform'][entity2].x).to.equal(0);
            expect(entityManager.componentEntityTable['Transform'][entity2].y).to.equal(0);
            
            expect(entityManager.componentEntityTable['Renderable'][entity3].VAO).to.equal(0);
            
            expect(entityManager.componentEntityTable['Transform'][entity4].x).to.equal(10);
            expect(entityManager.componentEntityTable['Transform'][entity4].y).to.equal(15);
            expect(entityManager.componentEntityTable['Renderable'][entity4].VAO).to.equal(4);
            
            expect(entityManager.componentEntityTable['Transform'][entity5].x).to.equal(10);
            expect(entityManager.componentEntityTable['Transform'][entity5].y).to.equal(15);
            expect(entityManager.componentEntityTable['Renderable'][entity5].VAO).to.equal(4);
        });
        
        it('should be able to register multiple processors at any time', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);
            
            entityManager.registerProcessor(new RenderingProcessor(entityManager), ['Transform', 'Renderable']);
            
            var entity1 = entityManager.createEntity();
            var entity2 = entityManager.createEntity(['Transform']);
            var entity3 = entityManager.createEntity(['Renderable']);
            var entity4 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity5 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            
            entityManager.registerProcessor(new RenderingProcessor(entityManager), ['Transform', 'Renderable']);
            
            expect(entityManager.processors.length).to.equal(2);
            expect(entityManager.processorEntities[0].length).to.equal(2);
            expect(entityManager.processorEntities[1].length).to.equal(2);
        });
    });
    
    describe('unregisterProcessor', function() {
        it('should stop processing entities after the processor has been removed', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            var entity = entityManager.createEntity(['Transform', 'Renderable']);
            
            var processor = new RenderingProcessor(entityManager);
            entityManager.registerProcessor(processor, ['Transform', 'Renderable']);
            entityManager.update();
            
            expect(entityManager.componentEntityTable['Transform'][entity].x).to.equal(10);
            expect(entityManager.componentEntityTable['Transform'][entity].y).to.equal(15);
            expect(entityManager.componentEntityTable['Renderable'][entity].VAO).to.equal(4);
            
            entityManager.unregisterProcessor(processor);
            entityManager.update();
            
            expect(entityManager.componentEntityTable['Transform'][entity].x).to.equal(10);
            expect(entityManager.componentEntityTable['Transform'][entity].y).to.equal(15);
            expect(entityManager.componentEntityTable['Renderable'][entity].VAO).to.equal(4);
        });
    });
    
    describe('unregisterComponent', function() {
        it('should add entities now matching aspect', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            
            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity2 = entityManager.createEntity(['Transform']);
            
            var processor = new PhysicsProcessor(entityManager);
            entityManager.registerProcessor(processor, ['Transform', 'Renderable']);
            entityManager.update();
            
            expect(entityManager.componentEntityTable['Transform'][entity1].x).to.equal(10);
            expect(entityManager.componentEntityTable['Transform'][entity1].y).to.equal(15);
            
            expect(entityManager.componentEntityTable['Transform'][entity2].x).to.equal(0);
            expect(entityManager.componentEntityTable['Transform'][entity2].y).to.equal(0);
            
            entityManager.unregisterComponent('Renderable');
            entityManager.update();
            
            expect(entityManager.componentEntityTable['Transform'][entity1].x).to.equal(20);
            expect(entityManager.componentEntityTable['Transform'][entity1].y).to.equal(30);
            
            expect(entityManager.componentEntityTable['Transform'][entity2].x).to.equal(10);
            expect(entityManager.componentEntityTable['Transform'][entity2].y).to.equal(15);
        });
        
        it('should remove all entities if the remaining aspect is empty', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            
            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform']);
            
            var processor = new PhysicsProcessor(entityManager);
            entityManager.registerProcessor(processor, ['Transform']);
            
            expect(entityManager.processorEntities[0].length).to.equal(2);
            
            entityManager.unregisterComponent('Transform');
            
            expect(entityManager.processorEntities[0].length).to.equal(0);
        });
        
        it('should still have all entities unless the resulting aspect is empty', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);
            
            var entity1 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            
            var processor = new PhysicsProcessor(entityManager);
            entityManager.registerProcessor(processor, ['Transform', 'Renderable']);
            
            expect(entityManager.processorEntities[0].length).to.equal(3);
            
            entityManager.unregisterComponent('Renderable');
            
            expect(entityManager.processorEntities[0].length).to.equal(3);
        });
    });
    
    describe('createEntity', function() {
        it('should add entities with matching aspect to processors', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);
            
            var processor = new PhysicsProcessor(entityManager);
            entityManager.registerProcessor(processor, ['Transform', 'Renderable']);
            
            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            
            expect(entityManager.processorEntities[0].length).to.equal(2);
        });
    });
    
    describe('removeEntity', function() {
        it('should remove the entities from the processors', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);
            
            var processor = new PhysicsProcessor(entityManager);
            entityManager.registerProcessor(processor, ['Transform', 'Renderable']);
            
            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            
            expect(entityManager.processorEntities[0].length).to.equal(2);
            
            entityManager.removeEntity(entity1);
            entityManager.removeEntity(entity2);
            
            expect(entityManager.processorEntities[0].length).to.equal(1);
        });
    });
    
    describe('addComponent', function() {
        it('should add entities now matching aspect to processors', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);
            
            var processor1 = new PhysicsProcessor(entityManager);
            entityManager.registerProcessor(processor1, ['Transform']);
            
            var processor2 = new RenderingProcessor(entityManager);
            entityManager.registerProcessor(processor2, ['Transform', 'Renderable']);
            
            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            
            expect(entityManager.processorEntities[0].length).to.equal(3);
            expect(entityManager.processorEntities[1].length).to.equal(2);
            
            entityManager.addComponent(entity1, 'Renderable');
            
            expect(entityManager.processorEntities[0].length).to.equal(3);
            expect(entityManager.processorEntities[1].length).to.equal(3);
        });
    });
    
    describe('removeComponent', function() {
        it('should remove entities no longer matching the aspect', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            entityManager.registerComponent('Renderable', Renderable);
            entityManager.registerComponent('Route', Route);
            
            var processor1 = new PhysicsProcessor(entityManager);
            entityManager.registerProcessor(processor1, ['Transform']);
            
            var processor2 = new RenderingProcessor(entityManager);
            entityManager.registerProcessor(processor2, ['Transform', 'Renderable']);
            
            var entity1 = entityManager.createEntity(['Transform']);
            var entity2 = entityManager.createEntity(['Transform', 'Renderable']);
            var entity3 = entityManager.createEntity(['Transform', 'Renderable', 'Route']);
            
            expect(entityManager.processorEntities[0].length).to.equal(3);
            expect(entityManager.processorEntities[1].length).to.equal(2);
            
            entityManager.removeComponent(entity2, 'Renderable');
            entityManager.removeComponent(entity3, 'Route');
            
            expect(entityManager.processorEntities[0].length).to.equal(3);
            expect(entityManager.processorEntities[1].length).to.equal(1);
        });
    });
    
    
});