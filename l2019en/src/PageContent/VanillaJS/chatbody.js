//add multiple event listeners
function addListenerMulti(el, s, fn) {
    s.split(' ').forEach(e => el.addEventListener(e, fn, false));
}

function chatResizer()
{
    if(document.getElementById('chatBody') !== null)
    {   
        var chatBody = document.getElementById('chatBody');

        chatBody.style.height = window.innerHeight - 275 + 'px';
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

if(document.getElementById('chatBody') !== null)
{
    addListenerMulti(window, 'resize', chatResizer);
}