// FEATURES TESTED:

// sequential calls with nested parallel

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('Sequential Calls (seq_par.js)', function() {
    
    it('should make sequential calls with some nested parallel calls', function(done) {
      request(app)
        .get('/json/seq_par')
        .end(function(err, res) {
          expect(res.text).toContain('"showHandler":"this should be in the first parallel call"},"cms2"', 'res.text='+res.text);
          expect(res.text).toContain(',"showHandler":"this should be in the second parallel call"},"data2"', 'res.text='+res.text);
          expect(res.text).toContain('id=kitchensink","queryPrams":{"userId":"987654"}', 'res.text='+res.text);
          done();
        });
    });

  });
};