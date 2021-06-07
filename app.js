/* -------------------------------- HOME -------------------------------- */
$('.profile-sign-out').click(()=> {
    window.location.href='../../index.html'
})

$('#validate-sign-in').click(() => {
    validateSignIn()
})

$('#new-user').click(() => {
    $('#regModal').modal('show')
})

$('#reg-add-account').click(() => {
    registrateAccount();
})

$('#nav-sign-in').click(() => {
    if (JSON.parse(sessionStorage.getItem('loggedIn')) === null){
        $('#loginModal').modal('show')
    }
})
$('#go-to-add-steps').click(()=> {
    window.location.href='../profile/add-steps/index.html'
})

/**
 * checks if there is any user in sessionStorage and
 * changes Sign in button apperance after that
 */
const checkIfLoggedIn = () => {
    const isLoggedIn = JSON.parse(sessionStorage.getItem('loggedIn'))
    
    if(isLoggedIn == null){
        $('#nav-sign-in').text('Sign in');
        
        
    }else {
        window.location.href='./pages/homepage-logged-in/index.html'
    }
}

/**
 * validate input from the user against user information in database
 * if succsess sets loggedin user to sessionstorage
 */
const validateSignIn = () => { 
    const email = $('#sign-in-email')
    const password = $('#sign-in-password')
    
    axios.get(`${validateLogin}login?email=${email.val()}&password=${password.val()}`)
    .then(resp => {
        if(resp.status == 200){
            sessionStorage.setItem('loggedIn', JSON.stringify(resp.data));
            checkIfLoggedIn()
            $('#loginModal').modal('hide')
            email.val('')
            password.val('')
            window.location.replace("./pages/homepage-logged-in/index.html");
            
        }
        if(resp.status == 204){
            swal("Warning", "Could not find any user with matching credentials", "warning");
            email.val('')
            password.val('')
        }
    })
    .catch(() => {
        swal("Warning", "wrong email \nor password!", "warning");
        password.val('')
    })
}

/**
 * remove loggedin user from sessionstorage
 */
const signOut = () => {
    $('#nav-sign-in').text('Sign in');
    sessionStorage.removeItem('loggedIn')
    $('#nav-sign-in').attr('data-bs-target', '#loginModal')
    window.location.replace("../../index.html");
}

/**
 * activate or deactivate navlinks if a user is logged in
 */
 const setNavLinksToActive = () => {
    const profile = $('#navbarDropdown')
    const highscore = $('#nav-highscore')
    const teamHighscore = $('#nav-team-highscore')

    if(JSON.parse(sessionStorage.getItem('loggedIn'))){
        profile.addClass('active')
        highscore.addClass('active')
        teamHighscore.addClass('active')
        profile.removeClass('disabled')
        highscore.removeClass('disabled')
        teamHighscore.removeClass('disabled')
    }else {
        profile.addClass('disabled')
        highscore.addClass('disabled')
        teamHighscore.addClass('disabled')
        profile.removeClass('active')
        highscore.removeClass('active')
        teamHighscore.removeClass('active')
    }
}

const registrateAccount = () => {
    let regFirstName = $('#reg-firstName')
    let regLastName = $('#reg-lastName')
    let regEmail = $('#reg-email')
    let regPassword = $('#reg-password')

    const newAccount = {
        "firstName": regFirstName.val(),
        "lastName": regLastName.val(),
        "password": regPassword.val(),
        "email": regEmail.val()
    }

    axios.post(addAccount, newAccount)
    .then((resp)=> {
        swal("Welcome!", `${resp.data.firstName} you have joined the race`, "success")
        .then(()=> {
            regFirstName.val('')
            regLastName.val('')
            regEmail.val('')
            regPassword.val('')
        })
        .then(() => {
            $('#regModal').modal('hide')
        })
    })
    .catch((err)=> {
        swal("Warning!", `${err.response.data.message}`, "warning")
        .then(()=> {
            regEmail.val('')
            regPassword.val('')
        })
    })
}

/* -------------------------------- PROFILE INFORMATION -------------------------------- */

$('#update').click(() => {
    updateUserInfo();
})


$('#update-password').click(() => {
    updateUserPassword();
})


$('#delete-user').click(() => {
    swal({
        title: "Warning!",
        text: "Are you sure you wanna delete your account?",
        icon: "warning",
        buttons: ["No, I wanna keep racing", "Yes" ],
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            swal({
                text: 'Please enter your password',
                content: "input",
                button: {
                  text: "Done",
                  closeModel: false,
                },
              })
              .then(input => {
                deleteAccount(input)
              })
        } else {
          swal("Good! Keep on walking!");
        }
      });
})



/**
 * deletes a user from the database if email and password matches user
 * then remove user from sessionStorage and sends user to homescreen
 * @param {String} password 
 */
 const deleteAccount = (password) => {
    const userEmail = JSON.parse(sessionStorage.getItem('loggedIn')).email
    

    axios.get(`${deleteUser}?email=${userEmail}&password=${password}`)
    .then(resp => {
        swal("Your account has been deleted. We are sad to see you go, but we will be here and waiting for you when you wanna get back into it!", {
        icon: "success",
        })
        .then(()=> {
            sessionStorage.removeItem('loggedIn')
            window.location.href = "../../../";
        })
    })
    .catch(err => {
        swal("Wrong password, please try again", {
            icon: "error",
          })
    })
}

/**
 * fills inputfields with user information from sessionStorage
 */
const fillUserInfo = () => {
    const user = JSON.parse(sessionStorage.getItem('loggedIn'))
    $('#firstname').val(user.firstName)
    $('#lastname').val(user.lastName)
    $('#email').val(user.email)
}

/**
 * updates user information
 */
const updateUserInfo = () => {
    axios.post(updateUser, {
        "firstName": $('#firstname').val(),
        "lastName": $('#lastname').val(),
        "email": $('#email').val()
    })
    .then(resp => {
        sessionStorage.setItem('loggedIn', JSON.stringify(resp.data))
        swal("Account updated.", {
            icon: "success",
        })
    })
    .catch(() => {
        swal("Something went wrong, try again.", {
            icon: "warning",
        })
    })
}


const updateUserPassword = () => {
    const user = JSON.parse(sessionStorage.getItem('loggedIn'))
    const newPassword = $('#new-Password')
    const confirmPassword = $('#confirm-Password')

    if(newPassword.val() === confirmPassword.val()){
        axios.get(`${updatePassword}?email=${user.email}&password=${newPassword.val()}`)
        .then(() => {
            newPassword.val('')
            confirmPassword.val('')
            swal("Password updated", {
                icon: "success",
            })
        })
        .catch(() => {
            swal("Something went wrong, try again.", {
                icon: "warning",
            })
        })
    }else{
        swal("Password doesn't match, try again.", {
            icon: "warning",
        })
        confirmPassword.val('')
    }
}



/* -------------------------------- PROFILE SCORE -------------------------------- */



const clearFields = () => {
    $('#score-date-select').text('')
    $('#score-show-total-step-at-date').text('')
}
 

/* -------------------------------- HIGHSCORE -------------------------------- */

let sizaOfHighscoreList = 10

$('#btn-10').click(()=> {
    sizaOfHighscoreList = 10
    $('#filter-btn').html('Top 10')
    fillHighScoreList()
})

$('#btn-20').click(()=> {
    sizaOfHighscoreList = 20
    $('#filter-btn').html('Top 20')
    fillHighScoreList()
})

$('#btn-all').click(()=> {
    sizaOfHighscoreList = 1000000
    $('#filter-btn').html('Top All')
    fillHighScoreList()
})

// TODO: DENNA MÅSTE FIXAS MED TOLAT SCORE ISTÄLLET FÖR STEPS
const fillHighScoreList = () => {
    $('#highscore-container').html('')

    let highScoreList = []

    axios.get(`${getAllUsers}`)
    .then(resp => {
        resp.data.forEach((user,index) => {
            let totalsteps = getTotalStepScore(user)
            highScoreList.push({
                "name": user.firstName + ' ' + user.lastName,
                "steps": totalsteps
            })
        })
        
    })
    .then(() => {
        sortUserDecending(highScoreList)
        .slice(0,sizaOfHighscoreList)
        .forEach((user,index) => {
            $('#highscore-container').append(`
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${user.name}</td>
                <td>${user.steps.toLocaleString(
                    "sv-SE",
                    {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    }
                )}</td>
          </tr>
            `)
        })
    })   
}

const sortUserDecending = (list) => { return list.sort((a, b) => parseFloat(b.steps) - parseFloat(a.steps))}


