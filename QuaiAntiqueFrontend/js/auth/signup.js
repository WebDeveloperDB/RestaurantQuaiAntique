const inputNom = document.getElementById("NomInput");
const inputPreNom = document.getElementById("PrenomInput");
const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidationPassword = document.getElementById("ValidatePasswordInput");
const btnValidation = document.getElementById("btn-validation-inscription");
const formInscription = document.getElementById("formulaireInscription");
const apiUrl = ("https://ton-backend.up.railway.app/api/registration");


inputNom.addEventListener("keyup", validateForm); 
inputPreNom.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputValidationPassword.addEventListener("keyup", validateForm);

btnValidation.addEventListener("click", InscrireUtilisateur);

function validateForm(){
    const nomOk = validateRequired(inputNom);
    const prenomOk = validateRequired(inputPreNom);
    const mailOk = validateMail(inputMail);
    const passwordOk = validatePassword(inputPassword); 
    const passwordConfirmOk = validateConfirmationPassword(inputPassword, inputValidationPassword)

    if (nomOk && prenomOk && mailOk && passwordOk && passwordConfirmOk) {
        btnValidation.disabled = false;
    } else {
        btnValidation.disabled = true;
    }
}

function validateConfirmationPassword(inputPwd, inputConfirmPwd) {
    if(inputPwd.value == inputConfirmPwd.value){
        inputConfirmPwd.classList.add("is-valid");
        inputConfirmPwd.classList.remove("is-invalid");
        return true;
    } else{
        inputConfirmPwd.classList.add("is-invalid");
        inputConfirmPwd.classList.remove("is-valid");
        return false;
    }
}

function validatePassword(input){
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const passwordUser = input.value;
    if(passwordUser.match(passwordRegex)){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}


function validateMail(input){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = input.value;
    if(mailUser.match(emailRegex)){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function validateRequired(input){
    if(input.value != ''){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false; 
    }
}

function InscrireUtilisateur() {
    let dataForm = new FormData(formInscription);

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
        "firstName": dataForm.get("nom"),
        "lastName": dataForm.get("prenom"),
        "email": dataForm.get("email"),
        "password": dataForm.get("mdp")
    });

    let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(apiUrl, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .then(result => {
            alert("Bravo " + dataForm.get("prenom") + ", vous êtes maintenant inscrit, vous pouvez vous connecter.");
            document.location.href = "/QuaiAntique/QuaiAntiqueFrontend/signin";
        })
        .catch(error => {
            alert("Erreur lors de l'inscription: " + error.message);
        });
}

