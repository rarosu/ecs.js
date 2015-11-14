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

            expect(entity in entityManager.componentEntityTable.Transform).to.equal(true);
        });

        it('should be possible to create child entities', function() {
            var entityManager = new ECS.EntityManager();
            var parent = entityManager.createEntity();
            var child = entityManager.createEntity([], parent);

            expect(parent in entityManager.childEntities).to.equal(true);
            expect(entityManager.childEntities[parent].indexOf(child)).to.not.equal(-1);
        });
    });

    describe('removeEntity', function() {
        it('should destroy the entity immediately', function() {
            var entityManager = new ECS.EntityManager();
            var entity = entityManager.createEntity();
            expect(entityManager.isDestroyedEntity(entity)).to.equal(false);
            entityManager.removeEntity(entity);
            expect(entityManager.isDestroyedEntity(entity)).to.equal(true);
        });

        it('should remove tags', function() {
            var entityManager = new ECS.EntityManager();
            var entity = entityManager.createEntity();
            entityManager.addTag(entity, 'Camera');

            expect(entityManager.getEntityByTag('Camera')).to.equal(entity);

            entityManager.removeEntity(entity);

            expect('Camera' in entityManager.entityTags).to.equal(false);
        });

        it('should remove child entities as well', function() {
            var entityManager = new ECS.EntityManager();
            var parent = entityManager.createEntity();
            var child = entityManager.createEntity([], parent);

            entityManager.removeEntity(parent);

            expect(entityManager.isDestroyedEntity(parent)).to.equal(true);
            expect(entityManager.isDestroyedEntity(child)).to.equal(true);
        });
    });

    describe('isActiveEntity', function() {
        it('should be false for non-existing and destroyed entities', function() {
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

    describe('isDestroyedEntity', function() {
        it('should be false for non-existing entities', function() {
            var entityManager = new ECS.EntityManager();

            expect(entityManager.isDestroyedEntity(0)).to.equal(false);

            var uid = entityManager.createEntity();

            expect(entityManager.isDestroyedEntity("wrongtype")).to.equal(false);
            expect(entityManager.isDestroyedEntity(-5)).to.equal(false);
            expect(entityManager.isDestroyedEntity(10)).to.equal(false);
        });

        it('should be false for active entities', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();

            expect(entityManager.isDestroyedEntity(uid)).to.equal(false);
        });

        it('should be true for destroyed entities', function() {
            var entityManager = new ECS.EntityManager();
            var uid = entityManager.createEntity();
            entityManager.removeEntity(uid);

            expect(entityManager.isDestroyedEntity(uid)).to.equal(true);
        });
    });

    describe('addTag', function() {
        it('should be able to access entities by tags', function() {
            var entityManager = new ECS.EntityManager();
            var entity = entityManager.createEntity();

            entityManager.addTag(entity, 'Camera');
            expect(entityManager.getEntityByTag('Camera')).to.equal(entity);
        });
    });

    describe('removeTag', function() {
        it('should not be possible to access the entity by tag after tag is removed', function() {
            var entityManager = new ECS.EntityManager();
            var entity = entityManager.createEntity();

            entityManager.addTag(entity, 'Camera');
            expect(entityManager.getEntityByTag('Camera')).to.equal(entity);

            entityManager.removeTag('Camera');
            expect('Camera' in entityManager.entityTags).to.equal(false);
        });
    });
});
