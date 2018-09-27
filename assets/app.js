var config = {
    apiKey: "AIzaSyBR04_qqsF_BJCdvTfRE9qY21H23kwC-_0",
    authDomain: "rps-multiplayer-166a8.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-166a8.firebaseio.com",
    projectId: "rps-multiplayer-166a8",
    storageBucket: "rps-multiplayer-166a8.appspot.com",
    messagingSenderId: "851630900178"
};
firebase.initializeApp(config);
const db = firebase.database();
const connectedRef = db.ref(".info/connected");
const connectionsRef = db.ref("/connections");
const rock = 'rock';
const paper = 'paper';
const scissors = 'scissors';
let idRef;
let id;
let rpsPlayers;
let user1;
let user2;
let user1Guess;
let user2Guess;
let name = ' ';
let answered;
let user1Answered;
let user2Answered;
let dash = '';
let slideUp = {
    distance: '350%',
    origin: 'bottom',
    opacity: null
};
let myMessage = db.ref(`/messages`);
myMessage.set({playerMessage: '', name: ''});
function addConnection(snapshot) {
    if (snapshot.val()) {
        var con = connectionsRef.push({guess: false});
        id = con.getKey();
        answered = db.ref(`/connections/${id}/answered`)
        let result = db.ref(`/connections/${id}/result`)
        result.update({result: ''})
        answered.update({answered: 'no'});
        con.onDisconnect().remove();
        gameProtection();
    }
}
function removeAndInitPlayers(snap) {
    let playersNum = snap.numChildren();
    if (playersNum >= 2) {
        $('#systemMessage').hide();
        $('#letsPlay').show();
        $("#players").text(playersNum);
        $("#becomePlural").text('players');
        $('#letsPlay').text('Now choose rock, paper, or scissors');
        $('#emMessageHere').hide();
        $('.disable').prop('disabled', false);
    } else {
        $('#result').hide();
        $('.disable').prop('disabled', true);
        $('#systemMessage').show();
        $('#letsPlay').hide();
        $("#players").text(playersNum);
        $("#becomePlural").text('player');
        $('#emMessageHere').show();
        $('#emMessageHere').text(`"If you don't want to wait send the URL to someone."`);
        $('#systemMessage').text('Wait for another player to join.');
    }
}
function gameProtection(){
    connectionsRef.on("value", snap=>{
        let players = Object.keys(snap.val())
        idRef = connectionsRef.child(`${players[2]}`)
        idRef.remove()
            .then(function () {
                console.log("Remove succeeded.")
            })
            .catch(function (error) {
                console.log("Remove failed: " + error.message)
            });
    });
}
function getUsersGuesses() {
    let player1Ref;
    let player2Ref;
    connectionsRef.on('value', function (snap) {
        rpsPlayers = Object.keys(snap.val());
    });
    player1Ref = db.ref(`/connections/${rpsPlayers[0]}`);
    let player1Answered = db.ref(`/connections/${rpsPlayers[0]}/answered`)
    player1Ref.on('value', function (snap) {
        user1Guess = snap.val().guess;
    });
    player1Answered.on('value', function (snap) {
        user1Answered = snap.val().answered;
    });
    player2Ref = db.ref(`/connections/${rpsPlayers[1]}`);
    let player2Answered = db.ref(`/connections/${rpsPlayers[1]}/answered`)
    player2Ref.on('value', function (snap) {
        user2Guess = snap.val().guess;
    });
    player2Answered.on('value', function (snap) {
        user2Answered = snap.val().answered;
    });
    checkIfReadyAndCompareGuesses();
}
function checkIfReadyAndCompareGuesses() {
    let player1ResultRef = db.ref(`/connections/${rpsPlayers[0]}/result`)
    let player2ResultRef = db.ref(`/connections/${rpsPlayers[1]}/result`)
    if(user1Answered === 'no' && user2Answered === 'yes' || user1Answered === 'yes' && user2Answered === 'no'){
        player1ResultRef.set({ result: 'waiting' })
        player2ResultRef.set({ result: 'waiting' })
    }else{
        if (user1Guess === user2Guess) {
            player1ResultRef.set({ result: 'tie' })
            player2ResultRef.set({ result: 'tie' })
        }
        else if (user1Guess === 'rock' && user2Guess === 'paper' || user1Guess === 'paper' && user2Guess === 'scissors' || user1Guess === 'scissors' && user2Guess === 'rock') {
            player1ResultRef.set({ result: 'You lost' })
            player2ResultRef.set({ result: 'You win' })
        }
        else if (user1Guess === 'rock' && user2Guess === 'scissors' || user1Guess === 'paper' && user2Guess === 'rock' || user1Guess === 'scissors' && user2Guess === 'paper') {
            player1ResultRef.set({ result: 'You win' })
            player2ResultRef.set({ result: 'You lost' })
        }
        else if (user1Guess === false || user2Guess === false) {
            player1ResultRef.set({ result: 'waiting on player' })
            player2ResultRef.set({ result: 'waiting on player' })
        }
        else if (user1Guess !== 'restart clicked' && user2Guess === ('rock' || 'paper' || 'scissors') || user2Guess !== 'restart clicked' && user1Guess === ('rock' || 'paper' || 'scissors')) {
            player1ResultRef.set({ result: 'waiting on player' })
            player2ResultRef.set({ result: 'waiting on player' })
        }
    }
}
function printResult() {
    let myId = db.ref(`/connections/${id}/result`);
    myId.on('value', function (snap) {
        let value = snap.val().result;
        if(value === 'You win' || value === 'You lost'){
            $('#result').show();
            $('#result').text(value);
            hasAnswered();
        }else{
            $('#result').show();
            $('#result').text(value);
        }
    })
}
function playAgain() {
    let pId = db.ref(`/connections/${id}`);
    answered = db.ref(`/connections/${id}/answered`);
    let result = db.ref(`/connections/${id}/result`);
    result.update({result:''});
    answered.update({answered: 'no'})
    pId.update({guess: false})
    $('#rock').removeClass('not-active');
        $('#paper').removeClass('not-active');
        $('#scissors').removeClass('not-active');
    $('#result').hide();
}
function message(dash){ 
    name = $('#name').text('player')
    name = $('#name').val()
    let playerMessage = $('#message').val();
    myMessage = db.ref(`/messages`);
    myMessage.set({playerMessage,name: name + dash});
}
function appendMessage(){
    myMessage = db.ref(`/messages`);
    myMessage.on('value', snap =>{
        let theMessage = snap.val().playerMessage
        let name = (snap.val().name)
        let p = $('<p>');
        p.addClass('remove scrollUp load-hidden');
        p.text(name + theMessage);
        $('#messageHere').append(p);
        myMessage.onDisconnect().set({playerMessage: '', name: ''});
        ScrollReveal().reveal('.scrollUp', slideUp);
    })
}
function hasAnswered(){
    answered = db.ref(`/connections/${id}/answered`);
    answered.set({answered: 'yes'})
}
$(document).ready(() => {
    $('#restart').hide()
    connectedRef.on("value", addConnection);
    connectionsRef.on("value", removeAndInitPlayers);
    $('#rock').on('click', event=> {
        event.preventDefault();
        let myId = db.ref(`/connections/${id}`);
        myId.update({
            guess: 'rock'
        });
        getUsersGuesses();
        printResult();
        $('#rock').addClass('not-active');
        $('#paper').addClass('not-active');
        $('#scissors').addClass('not-active');
        $('#restart').show()
    });
    $('#paper').on('click', event=> {
        event.preventDefault();
        let myId = db.ref(`/connections/${id}`);
        myId.update({
            guess: 'paper'
        });
        getUsersGuesses();
        printResult();
        $('#rock').addClass('not-active');
        $('#paper').addClass('not-active');
        $('#scissors').addClass('not-active');
        $('#restart').show()
    });
    $('#scissors').on('click', event=> {
        event.preventDefault();
        let myId = db.ref(`/connections/${id}`);
        myId.update({
            guess: 'scissors'
        });
        getUsersGuesses();
        printResult();
        $('#rock').addClass('not-active');
        $('#paper').addClass('not-active');
        $('#scissors').addClass('not-active');
        $('#restart').show()
    });
    $('#restart').on('click', ()=> {
        playAgain();
        $('#restart').hide()
    })
    $('#message').keypress(event=>{
        if(event.which === 13){
            dash = ': ';
            message(dash);
            $('#message').attr('placeholder', 'Message:');
            $('#message').val('');
        }
    })
    appendMessage();
});

