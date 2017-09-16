// simulates API call for testing and demo app

module.exports = function(app) {
  return {
    route : '/api/cms/home2',

    middlewares: [
      function(req, res, next) {
        req.nodule.debug('home page API called');
        res.send({
          msg: 'home page CMS 2 API success!', 
          userId: '987654', 
          myParam:req.query.myParam,
          queryPrams: req.query
        });
      }
    ]     
  };
};