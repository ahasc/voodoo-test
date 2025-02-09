const request = require('supertest');
var assert = require('assert');
const app = require('../index');

/**
 * Testing create game endpoint
 */
describe('POST /api/games', function () {
    let data = {
        publisherId: "1234567890",
        name: "Test App",
        platform: "ios",
        storeId: "1234",
        bundleId: "test.bundle.id",
        appVersion: "1.0.0",
        isPublished: true
    }
    it('respond with 200 and an object that matches what we created', function (done) {
        request(app)
            .post('/api/games')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.publisherId, '1234567890');
                assert.strictEqual(result.body.name, 'Test App');
                assert.strictEqual(result.body.platform, 'ios');
                assert.strictEqual(result.body.storeId, '1234');
                assert.strictEqual(result.body.bundleId, 'test.bundle.id');
                assert.strictEqual(result.body.appVersion, '1.0.0');
                assert.strictEqual(result.body.isPublished, true);
                done();
            });
    });
});

/**
 * Testing get all games endpoint
 */
describe('GET /api/games', function () {
    it('respond with json containing a list that includes the game we just created', function (done) {
        request(app)
            .get('/api/games')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body[0].publisherId, '1234567890');
                assert.strictEqual(result.body[0].name, 'Test App');
                assert.strictEqual(result.body[0].platform, 'ios');
                assert.strictEqual(result.body[0].storeId, '1234');
                assert.strictEqual(result.body[0].bundleId, 'test.bundle.id');
                assert.strictEqual(result.body[0].appVersion, '1.0.0');
                assert.strictEqual(result.body[0].isPublished, true);
                done();
            });
    });
});


/**
 * Testing update game endpoint
 */
describe('PUT /api/games/1', function () {
    let data = {
        id : 1,
        publisherId: "999000999",
        name: "Test App Updated",
        platform: "android",
        storeId: "5678",
        bundleId: "test.newBundle.id",
        appVersion: "1.0.1",
        isPublished: false
    }
    it('respond with 200 and an updated object', function (done) {
        request(app)
            .put('/api/games/1')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.publisherId, '999000999');
                assert.strictEqual(result.body.name, 'Test App Updated');
                assert.strictEqual(result.body.platform, 'android');
                assert.strictEqual(result.body.storeId, '5678');
                assert.strictEqual(result.body.bundleId, 'test.newBundle.id');
                assert.strictEqual(result.body.appVersion, '1.0.1');
                assert.strictEqual(result.body.isPublished, false);
                done();
            });
    });
});

/**
 * Testing update game endpoint
 */
describe('DELETE /api/games/1', function () {
    it('respond with 200', function (done) {
        request(app)
            .delete('/api/games/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err) => {
                if (err) return done(err);
                done();
            });
    });
});

/**
 * Testing get all games endpoint
 */
describe('GET /api/games', function () {
    it('respond with json containing no games', function (done) {
        request(app)
            .get('/api/games')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.length, 0);
                done();
            });
    });
});

/**
 * Testing search games endpoint
 */
describe('POST /api/games/search', function () {
    it('should return all games', function (done) {
        request(app)
            .post('/api/games/search')
            .send({ platform: '', name: '' })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.length, 5);
                done();
            });
    });
    it('should return ios games', function (done) {
        request(app)
            .post('/api/games/search')
            .send({ platform: 'ios', name: '' })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.length, 3);
                assert.strictEqual(result.body.every(game => game.platform === 'ios'), true)
                done();
            });
    });
    it('should return android games', function (done) {
        request(app)
            .post('/api/games/search')
            .send({ platform: 'android', name: '' })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                console.log(result.body)
                if (err) return done(err);
                assert.strictEqual(result.body.length, 2);
                assert.strictEqual(result.body.every(game => game.platform === 'android'), true)
                done();
            });
    });

    it("should return games with 'hel' in name", function (done) {
        request(app)
            .post('/api/games/search')
            .send({ platform: '', name: 'hel' })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.length, 2);
                assert.strictEqual(result.body.every(game => game.name === 'Helix Jump'), true)
                done();
            });
    });

    it("should return empty list", function (done) {
        request(app)
            .post('/api/games/search')
            .send({ platform: '', name: 'unknown' })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.length, 0);
                done();
            });
    });
});

describe('POST /api/games/populate', function () {
    it('should update database with top100 games from provided JSON data files', function (done) {
        request(app)
            .post('/api/games/populate')
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.length, 205); // 100 android + 100 ios + 5 already in db
                done();
            });
    });
});