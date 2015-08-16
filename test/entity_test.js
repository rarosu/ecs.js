var expect = chai.expect;

describe('Entity', function() {
    describe('createEntity', function() {
        it('should return increasing IDs', function() {
            var entityManager = new ECS.EntityManager();
            expect(entityManager.createEntity()).to.equal(0);
            expect(entityManager.createEntity()).to.equal(1);
            expect(entityManager.createEntity()).to.equal(2);
        });
        
        it('should store the entities', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.createEntity();
            entityManager.createEntity();
            expect(entityManager.entities).to.have.length(2);
            expect(entityManager.entities[0]).to.equal(0);
            expect(entityManager.entities[1]).to.equal(1);
        });
        
        it('should be able to add components', function() {
            var entityManager = new ECS.EntityManager();
            entityManager.registerComponent('Transform', Transform);
            
            var entity = entityManager.createEntity(['Transform']);
            
            expect(entity in entityManager.componentEntityTable['Transform']).to.equal(true);
        });
    });
    
    describe('removeEntity', function() {
        it('should defer deletion until cleanup', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();
            entityManager.removeEntity(uid);
            
            expect(entityManager.entities).to.have.length(0);
            expect(entityManager.removedEntities).to.have.length(1);
        });
    });
    
    describe('isActiveEntity', function() {
        it('should be false for non-existing and removed entities', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();
            entityManager.removeEntity(uid);
            
            expect(entityManager.isActiveEntity("wrongtype")).to.equal(false);
            expect(entityManager.isActiveEntity(-5)).to.equal(false);
            expect(entityManager.isActiveEntity(10)).to.equal(false);
            expect(entityManager.isActiveEntity(uid)).to.equal(false);
        });
        
        it('should be true for existing entities', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();
            expect(entityManager.isActiveEntity(uid)).to.equal(true);
        });
    });
    
    describe('isRemovedEntity', function() {
        it('should be false for non-existing and active entities', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();
            
            expect(entityManager.isRemovedEntity("wrongtype")).to.equal(false);
            expect(entityManager.isRemovedEntity(-5)).to.equal(false);
            expect(entityManager.isRemovedEntity(10)).to.equal(false);
            expect(entityManager.isRemovedEntity(uid)).to.equal(false);
        });
        
        it('should be true for removed but not destroyed entities', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();
            entityManager.removeEntity(uid);
            
            expect(entityManager.isRemovedEntity(uid)).to.equal(true);
            
            entityManager._destroyRemovedEntities();
            
            expect(entityManager.isRemovedEntity(uid)).to.equal(false);
        });
    });
    
    describe('isDestroyedEntity', function() {
        it('should be false for non-existing entities', function() {
            var entityManager = new ECS.EntityManager();
            
            expect(entityManager.isDestroyedEntity(0)).to.equal(false);
            
            var uid = entityManager.createEntity();
            
            expect(entityManager.isDestroyedEntity("wrongtype")).to.equal(false);
            expect(entityManager.isDestroyedEntity(-5)).to.equal(false);
            expect(entityManager.isDestroyedEntity(10)).to.equal(false);
        });
        
        it('should be false for active and removed entities', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();
            
            expect(entityManager.isDestroyedEntity(uid)).to.equal(false);
            
            entityManager.removeEntity(uid);
            
            expect(entityManager.isDestroyedEntity(uid)).to.equal(false);
        });
        
        it('should be true for destroyed entities', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();
            entityManager.removeEntity(uid);
            entityManager._destroyRemovedEntities();
            
            expect(entityManager.isDestroyedEntity(uid)).to.equal(true);
        });
    });
});