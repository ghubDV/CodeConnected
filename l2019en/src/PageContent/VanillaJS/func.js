//add multiple event listeners
function addListenerMulti(el, s, fn) {
  s.split(' ').forEach(e => el.addEventListener(e, fn, false));
}

//splitting the containers dinamically
function elementResizer()
{
  var page = document.getElementById('page_wrap');
  var pageContent = document.getElementById('page_content');
  var header = document.getElementById('header');
  var sideNav =document.getElementById('vnav_wrap');
  var body = document.getElementById('body');
  var footer = document.getElementById('page_footer');

  //exit function if the elements do not exist
  if((page === null) || (header === null) || (footer === null))
  {
    return;
  }
  
  var pageInfo = page.getBoundingClientRect();
  var headerInfo = header.getBoundingClientRect();
  var footerInfo = footer.getBoundingClientRect();
  
  if(window.screen.width > 980)
  {
      pageContent.classList.remove('darken');
  }

  if(window.screen.width <= 980)
  {
      sideNav.classList.replace('visible','hidden');

      if(sideNav.classList.contains('visible'))
      {
        pageContent.classList.add('darken');
      }
  }

  if(sideNav.classList.contains('hidden'))
  {
      pageContent.style.margin = '0';
  }
  else
  {
      pageContent.style.marginLeft = '260px';
  }

  var bodyHeight = pageInfo.height - headerInfo.height;
  var pageContentHeight = bodyHeight - footerInfo.height;
  body.style.height = bodyHeight + 'px';
  sideNav.style.height = bodyHeight + 'px';
  pageContent.style.minHeight = pageContentHeight + 'px';
}

addListenerMulti(window, 'DOMContentLoaded resize', elementResizer);
window.onload = elementResizer();
/*
function showSide()
{
  console.log("called");
  vnav = document.getElementById('vnav_wrap');
  menuIcon = document.getElementById('menuIcon');
  pageContent = document.getElementById('page_content');

  if(vnav.classList.contains('hidden'))
  {
    vnav.classList.remove('hidden');
    vnav.classList.add('visible');
    
    if(screen.width > 980)
    {
       pageContent.style.marginLeft = '260px';
    }
  }
  else
  {
    vnav.classList.remove('visible');
    vnav.classList.add('hidden');
      
    if(screen.width > 980)
    {
       pageContent.style.marginLeft = '0px';
    }
  }
}*/
