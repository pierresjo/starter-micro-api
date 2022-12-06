'use strict';
let socket = io();

window.addEventListener('load', ()=> {
	
	if (getCookie('nickName') != null) {
		document.querySelector('#rubrik').textContent = decodeURIComponent(getCookie('nickName'));
	}
	else if(getCookie('nickName2') != null) {
		document.querySelector('#rubrik').textContent = decodeURIComponent(getCookie('nickName2'));
	}
	

    document.querySelector('.btn-danger').addEventListener('click', (evt)=>{
        
        evt.preventDefault();
        let msg = document.querySelector('#msg').value;
        //console.log(msg);
        try {
            if (msg.length < 5) throw 'Skriv ärende...';

            let que = document.querySelectorAll('li');

            let grp = decodeURI(getCookie('nickName'));
            console.log(grp);
            que.forEach((element)=> {
                console.log(element.textContent);
                if(element.textContent === grp) throw 'Du väntar redan på hjälp';
            });

            socket.emit('addGroup', { "msg": msg });

            document.querySelector('#msg').value='';

        }
        catch(ex) {
            alert(ex);
        }
        
    });

});

socket.on('updateList', (data) => {

    let listholder = document.querySelector('#list');
    listholder.innerHTML = null;
    listholder.style = 'margin-left: 38px; list-style-type: decimal; font-weight: bold; font-size: 1.2rem;';

    data.forEach(element => {
        let li = document.createElement('li');
        li.textContent = element.grupp;
        //li.classList.add('list-group-item');       
        listholder.appendChild(li);
    });

	if(data.length<1) {
		document.querySelector('#tom').textContent = 'Det är för närvande ingen i kön';
	}
	else {
		document.querySelector('#tom').textContent = '';
	}
});


//Hämtad från w3schoools
//https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//Hämtad från stackoverflow
//https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}