// FEATURES TESTED:

// modifying API path at request time

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('Sequential Calls (sequential.js)', function() {
    
    it('should make sequential calls', function(done) {
      request(app)
        .get('/json/seq')
        .end(function(err, res) {
          expect(res.text).toContain('"testSequential":"xxx"', 'res.text='+res.text);
          expect(res.text).toContain('"testSequential2":"yyyy"', 'res.text='+res.text);
          expect(res.text).toContain('RESPONSE FROM /api/getdata/somecall?userId2=zzzzz', 'res.text='+res.text);
          done();
        });
    });

  });
};