var config = {
    apiKey: "AIzaSyBR04_qqsF_BJCdvTfRE9qY21H23kwC-_0",
    authDomain: "rps-multiplayer-166a8.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-166a8.firebaseio.com",
    projectId: "rps-multiplayer-166a8",
    storageBucket: "rps-multiplayer-166a8.appspot.com",
    messagingSenderId: "851630900178"
};
firebase.initializeApp(config);
const rock = 'rock';
const paper = 'paper';
const scissors = 'scissors';
let db = firebase.database();
var connectedRef = db.ref(".info/connected");
var connectionsRef = db.ref("/connections");
let idRef;
let id;
let rpsPlayers;
let user1;
let user2;
let user1Guess;
let user2Guess;
let name = ' ';
let myMessage = db.ref(`/messages`);
myMessage.set({playerMessage: '', name: 'chat'});
function addConnection(snapshot) {
    if (snapshot.val()) {
        var con = connectionsRef.push({ guess: false });
        id = con.getKey();
        con.onDisconnect().remove();
        myMessage.onDisconnect().set({playerMessage:''});
    }
}
function removeAndInitPlayers(snap) {
    let playersNum = Object.keys(snap.val()).length;
    let players = Object.keys(snap.val())
    idRef = connectionsRef.child(`${players[2]}`)
    idRef.remove()
        .then(function () {
            console.log("Remove succeeded.")
        })
        .catch(function (error) {
            console.log("Remove failed: " + error.message)
        });
    if (playersNum >= 2) {
        $('#systemMessage').hide();
        $('#letsPlay').show();
        $("#players").text(playersNum);
        $('#letsPlay').text('Now choose rock, paper, or scissors');
    } else {
        $('#systemMessage').show();
        $('#letsPlay').hide();
        $("#players").text(playersNum);
        $('#systemMessage').text('Wait for another player to join.');
    }
}
function getUsersGuesses() {
    let player1Ref;
    let player2Ref;
    connectionsRef.on('value', function (snap) {
        rpsPlayers = Object.keys(snap.val());
    });
    player1Ref = db.ref(`/connections/${rpsPlayers[0]}`);
    player1Ref.on('value', function (snap) {
        user1Guess = snap.val().guess;
    });
    player2Ref = db.ref(`/connections/${rpsPlayers[1]}`);
    player2Ref.on('value', function (snap) {
        user2Guess = snap.val().guess;
    });
    compareGuesses();
}
function compareGuesses() {
    let player1ResultRef = db.ref(`/connections/${rpsPlayers[0]}/result`)
    let player2ResultRef = db.ref(`/connections/${rpsPlayers[1]}/result`)
    if (user1Guess === user2Guess) {
        player1ResultRef.set({ result: 'tie' })
        player2ResultRef.set({ result: 'tie' })
    }
    else if (user1Guess === false || user2Guess === false) {
        player1ResultRef.set({ result: 'waiting on player' })
        player2ResultRef.set({ result: 'waiting on player' })
    }
    else if (user1Guess === 'rock' && user2Guess === 'paper' || user1Guess === 'paper' && user2Guess === 'scissors' || user1Guess === 'scissors' && user2Guess === 'rock') {
        player1ResultRef.set({ result: 'You lost' })
        player2ResultRef.set({ result: 'You win' })
    }
    else if (user1Guess === 'rock' && user2Guess === 'scissors' || user1Guess === 'paper' && user2Guess === 'rock' || user1Guess === 'scissors' && user2Guess === 'paper') {
        player1ResultRef.set({ result: 'You win' })
        player2ResultRef.set({ result: 'You lost' })
    }
}
function printResult() {
    let myId = db.ref(`/connections/${id}/result`);
    myId.on('value', function (snap) {
        let value = snap.val().result;
        $('#result').show();
        $('#result').text(value);
    })
}
function playAgain() {
    let pId = db.ref(`/connections/${id}`);
    pId.update({myGuess: 'false'})
    $('.disable').prop('disabled', false);
    $('#result').hide();
}
function init(){
    let init = db.ref(`/connections/${id}`);
    init.set({guess: false})
}
function message(){
    name = $('#name').val()
    let playerMessage = $('#message').val();
    myMessage = db.ref(`/messages`);
    myMessage.set({playerMessage,name});
}
function appendMessage(){
    myMessage = db.ref(`/messages`);
    myMessage.on('value', snap =>{
        let theMessage = snap.val().playerMessage
        let name = snap.val().name
        let p = $('<p>');
        p.addClass('remove');
        p.text(name + ': ' + theMessage);
        $('#messageHere').append(p);
    })
}
$(document).ready(() => {
    $('#restart').hide()
    connectedRef.on("value", addConnection);
    connectionsRef.on("value", removeAndInitPlayers);
    $('#rock').on('click', function () {
        let myId = db.ref(`/connections/${id}`);
        myId.set({
            guess: 'rock',
            myGuess: 'true'
        });
        getUsersGuesses();
        printResult();
        $('.disable').prop('disabled', true);
        $('#restart').show()
    });
    $('#paper').on('click', function () {
        let myId = db.ref(`/connections/${id}`);
        myId.set({
            guess: 'paper',
            myGuess: 'true'
        });
        getUsersGuesses();
        printResult();
        $('.disable').prop('disabled', true);
        $('#restart').show()
    });
    $('#scissors').on('click', function () {
        let myId = db.ref(`/connections/${id}`);
        myId.set({
            guess: 'scissors',
            myGuess: 'true'
        });
        getUsersGuesses();
        printResult();
        $('.disable').prop('disabled', true);
        $('#restart').show()
    });
    $('#restart').on('click', function () {
        playAgain();
        $('#restart').hide()
    })
    $('#message').keypress(event=>{
        if(event.which === 13){
            message();
            $('#message').attr('placeholder', 'Message:');
            $('#message').val('');
        }
    })
    appendMessage();
});

