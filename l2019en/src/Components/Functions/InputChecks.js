const checkEmail = (email) =>
{
    //RFC2822 standard regular expression that checks email validity
    let exp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    
    if(email.search(exp) === -1)
    {
        return false;
    }

    return true;
}

const checkName = (name) =>
{
    let exp = /^[A-Za-z]+$/;
    
    if(name.search(exp) === -1)
    {
        return false;
    }

    return true;
}

export { checkEmail,checkName };