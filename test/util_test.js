var expect = chai.expect;

describe('Util', function() {
	describe('clone', function() {
		var clone = ECS.clone;
		
		it('should immediately return numbers, strings and booleans', function() {
			var number = 42;
			var string = 'Hello';
			var bool = true;
			
			expect(clone(number)).to.equal(number);
			expect(clone(string)).to.equal(string);
			expect(clone(bool)).to.equal(bool);
		});
		
		it('should immediately return null and undefined', function() {
			expect(clone(null)).to.equal(null);
			expect(clone(undefined)).to.equal(undefined);
		});
		
		it('should immediately return a function instance', function() {
			var func = function() {};
			
			var copy = clone(func);
			
			expect(copy instanceof Function).to.equal(true);
			expect(copy).to.equal(func);
		});
		
		it('should create a new object instance', function() {
			var object = {};
			
			var copy = clone(object);
			
			expect(copy instanceof Object).to.equal(true);
			expect(copy).to.not.equal(object);
		});
		
		it('should create a new array instance', function() {
			var array = [];
			
			var copy = clone(array);
			
			expect(copy instanceof Array).to.equal(true);
			expect(copy).to.not.equal(array);
		});
		
		it('should clone array elements', function() {
			var array = [{}, 3];
			
			var copy = clone(array);
			
			expect(copy.length).to.equal(2);
			expect(copy[0] instanceof Object);
			expect(copy[0]).to.not.equal(array[0]);
			expect(copy[1]).to.equal(3);
		});
		
		it('should clone object properties', function() {
			var object = {a: [], b: 3};
			
			var copy = clone(object);
			
			expect(copy.a instanceof Array).to.equal(true);
			expect(copy.a).to.not.equal(object.a);
			expect(copy.b).to.equal(3);
		});
		
		it('should copy the prototype of objects', function() {
			var parent = {a: 5};
			var object = Object.create(parent);
			
			var copy = clone(object);
			
			expect(copy.a).to.equal(5);
			expect(copy.__proto__).to.equal(parent);
		});
	});
});