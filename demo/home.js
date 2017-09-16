// for more demonstration of guar features - see kitchenSink.js, homePage.js, getData.js, getSpecificData.js, submitForm.js

const homeHtml = 
`
<html>
 <head title="guar home">
 <body>
  <h1>Examples</h1>
  
  <p><a href="/json/par">Parallel API calls</a> 
     (output of <a href="https://github.com/jackspaniel/guar/blob/master/demo/json/par/par.js">/demo/json/par/par.js</a>)</p>
  
  <p><a href="/json/seq_par">Sequential API calls</a> 
     (output of <a href="https://github.com/jackspaniel/guar/blob/master/demo/json/seq/seq.js">/demo/json/seq/seq.js</a>)</p>
  
  <p><a href="/json/par_seq">Parallel calls with nested sequential</a> 
     (output of <a href="https://github.com/jackspaniel/guar/blob/master/demo/json/par_seq/par_seq.js">/demo/json/par_seq/par_seq.js</a>)</p>
  
  <p><a href="/json/seq_par">Sequential calls with nested parallel</a> 
     (output of <a href="https://github.com/jackspaniel/guar/blob/master/demo/json/seq_par/seq_par.js">/demo/json/seq_par/seq_par.js</a>)</p>
  
  <p> test form submit
     (output of <a href="https://github.com/jackspaniel/guar/blob/master/demo/json/submitForm.js">/demo/json/submitForm.js</a>)</p>
    <form action='/json/submitForm' method='post'>
      <input type='hidden' name='param1' value='test1'/>
      <input type='hidden' name='param2' value='test2'/>
      <button type='submit'> Submit Form </button>
    </form>
 </body>
</html>
`;

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/', '/home'],
  
    // example of using custom non-standard middleware array 
    middlewares: [
      function(req, res, next) {
        req.nodule.debug('home page called! for ' + req.path);
        res.send(homeHtml);
      }
    ]
  };
};