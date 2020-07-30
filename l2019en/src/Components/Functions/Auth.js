import Cookies from 'universal-cookie';
import axios from 'axios';

let cookies = new Cookies();

const checkAuth = async () =>
{
    let jwt = cookies.get('user');
    let result = {
        isValid: false,
        userdata: {}
    };

    if(jwt === "notLogged")
    {
        result = {
            isValid: false,
            userdata: {}
        };
        
        return result;
    }
    else if(jwt === undefined || jwt === "" || jwt === null)
    {
        logout();
    }
    else
    {
       await axios.post('http://'+ window.location.hostname +':8000/testdecode.php',{ accessToken : jwt })
        .then(
            (response) => {
                console.log("Server Response!");
                console.log(response);
                result = {
                    isValid : response.data.isValid,
                    userdata: response.data.userdata
                }

                if(!result.isValid)
                {
                    logout();
                }
            }
        )
        .catch(
            (error) => {
                console.log("Server response error: " + error);
            }
        )
    }
    return result;
}

const logout = () => {
    cookies.set('user','notLogged',{path : '/'});

    window.location.reload();
}

const handleLogin = (jwt) =>
{
    let expD = new Date();

    expD.setTime(expD.getTime() + (24*60*60*1000));

    cookies.set('user',jwt,{ path : '/',expires : expD,sameSite:'lax' });
}

export { checkAuth , handleLogin , logout };