(function(){
  var page = 0;
  function update(){
    document.getElementById('work-track').style.transform = page === 0 ? 'translateX(0)' : 'translateX(-50%)';
    document.getElementById('dot-0').style.background = page === 0 ? '#71BE43' : '#ddd';
    document.getElementById('dot-1').style.background = page === 1 ? '#71BE43' : '#ddd';
    document.getElementById('btn-prev').style.opacity = page === 0 ? '0.4' : '1';
  }
  window.workNext = function(){ if(page < 1){ page = 1; update(); } };
  window.workPrev = function(){ if(page > 0){ page = 0; update(); } };
  window.workGoTo = function(p){ page = p; update(); };
  update();
})();