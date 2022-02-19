console.log('sample1 loaded')

module.exports = {
  aaa: (req, res, state) => {
    console.log('the aaa.')
    if(state['aaa']){
      state['aaa'] ++;
    }else{
      state['aaa'] = 1;
    }
    console.log('value of the aaa = ' + state['aaa']);
  }
};