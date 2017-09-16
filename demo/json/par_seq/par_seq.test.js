// FEATURES TESTED:

// parallel API calls with nested sequential calls
// custom namespaces and auto-generated namespaces
// adding nested calls at run time, and conditionally after first sequential call

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('Parallel APIs with nested sequential', function() {
    
    it('Should call all parallel calls, and add api params at init and request time', function(done) {
      request(app)
        .get('/json/par_seq')
        .query({myParam: 'test1'})
        .end(function(err, res) {
          expect(res.text).toContain('"cms1":{"msg":"home page CMS API success!","userId":"123456"', 'res.text='+res.text);
          expect(res.text).toContain('home page CMS 2 API success!","userId":"987654","queryPrams":{"userIdFromFirstCall":"123456"}', 'res.text='+res.text);
          expect(res.text).toContain('get data success! id=kitchensink","queryPrams":{"staticParam":"test1","myParam":"test2', 'res.text='+res.text);
          expect(res.text).toContain('"myCustomNamespace":{"statusCode":200,"systemMsg":"RESPONSE FROM /api/getdata/somecall', 'res.text='+res.text);
          expect(res.text).toContain('"rufus":{"statusCode":200,"systemMsg":"RESPONSE FROM /api/getdata/someothercall', 'res.text='+res.text);
          done();
        });
    });

    it('Should add custom API headers per nodule and at the system level', function(done) {
      request(app)
        .get('/json/par_seq')
        .end(function(err, res) {
          expect(res.text).toContain('"x-test":"success","x-device-type":"web', 'res.text='+res.text);
          done();
        });
    });
  });
};