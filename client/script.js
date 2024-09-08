const editableDiv = document.getElementById('editableDiv');
const passcode_container = document.getElementById('passcode_container');
const passcode_input = document.getElementById('input_passcode');
const passcode_msg = document.querySelector('.passcode-msg');

function initialization_UI() {
    let authToken = sessionStorage.getItem('authToken');

    editableDiv.style.display = `${authToken ? "block" : "none"}`;
    passcode_container.style.display = `${authToken ? "none" : "flex"}`

    if (authToken) {
        editableDiv.focus();
        setTimeout(() => {
            handleMoveCursorToEnd();
        }, 500);
    }
    else {
        passcode_input.focus()
    }

}
initialization_UI();


const socket = io('/', {

    // ****devlopment****
    // path: '/socket.io/other'
    
    //  ****production****
    path: '/shell-access/socket.io/other'


});

const verifyPassCode = () => {
    let input = document.getElementById('input_passcode');

    console.log(input.value);
   
    socket.emit("passcode-verify", input.value);

}


// 
let previousCommandsArray = [];
let commandCounter = previousCommandsArray.length;




const editableDivClick = (event) => {

    if (event.key === 'Enter') {
        event.preventDefault();

        currentLine = editableDiv.innerHTML
        currentLine = currentLine.trim()
        // console.log("currentLineArr ")

        // cutting some lines
        currentLineArr = currentLine.split("</span>");
        // console.log(currentLineArr)
        currentLine = currentLineArr[currentLineArr.length - 1]

        // console.log(currentLine)
        if (currentLine[currentLine.length - 1] == '>') {
            currentLine = "";
        }
        // console.log(currentLine)
        sendCommandHandler(currentLine)
        handleMoveCursorToEnd();
    }

    if (event.key == 'ArrowUp') {
        // console.log("arraow up");
        if (commandCounter > 0) {
            commandCounter--;
        }

        if (previousCommandsArray[commandCounter]) {
            let allCommandArr = editableDiv.innerHTML.split('</span>');

            allCommandArr.pop();

            let allCommandStr = allCommandArr.join('</span>') + "</span>";

            let allCommand = `${allCommandStr}${previousCommandsArray[commandCounter]}`;

            editableDiv.innerHTML = allCommand;

        }
        handleMoveCursorToEnd();
    }
    if (event.key == 'ArrowDown') {
        // console.log("arrow down");
        if (commandCounter <= previousCommandsArray.length - 1) {
            commandCounter++;
        }
        // console.log("Command counter "+ commandCounter)      
        // console.log(previousCommandsArray[commandCounter])
        // console.log(previousCommandsArray[commandCounter])
        if (previousCommandsArray[commandCounter]) {
            let allCommandArr = editableDiv.innerHTML.split('</span>');

            allCommandArr.pop();

            let allCommandStr = allCommandArr.join('</span>') + "</span>";

            let allCommand = `${allCommandStr}${previousCommandsArray[commandCounter]}`;

            editableDiv.innerHTML = allCommand;
        }
        else {
            let allCommandArr = editableDiv.innerHTML.split('</span>');

            allCommandArr.pop();

            let allCommandStr = allCommandArr.join('</span>') + "</span>";
            editableDiv.innerHTML = allCommandStr
        }
        handleMoveCursorToEnd();
    }


    setTimeout(() => {
        editableDiv.scrollTop = editableDiv.scrollHeight
    }, 100);
};

const passwordToggle = (event) => {
    let type = passcode_input.type;

    if (type == "password") {
        event.target.innerHTML = "hide";
        passcode_input.type = "text"
    } else {
        event.target.innerHTML = "show";
        passcode_input.type = "password"

    }
}


// console.log(socket)
socket.on('connect', () => {
    // console.log("started")
    // socket.emit('shell-connection', "ha");

    socket.on("passcode-verified", authToken => {
        console.log("AuthToken ", authToken);
        sessionStorage.setItem('authToken', authToken);
        initialization_UI();
    })

    socket.on("passcode-failed", (wrong) => {
        console.log("passcode-failed", wrong);
        passcode_msg.style.display = "block";
        sessionStorage.clear();
        initialization_UI();
    })

    socket.on("start", (dir) => {
        dir += " >"
        editableDiv.innerHTML = `<span class="dir" contenteditable="false">${dir}</span> `
        moveCursorToEnd(editableDiv)
    })
    socket.on("result", (res) => {
        // console.log(res)           
        editableDiv.innerHTML += `<pre>${res}</pre>`

    })

    socket.on("givedir", (dir) => {

        dir += " >"
        editableDiv.innerHTML += '<br/>' + `<span class="dir" contenteditable="false">${dir}</span> `

        editableDiv.scrollTop = editableDiv.scrollHeight
        moveCursorToEnd(editableDiv)
        // setCursorPosition(editableDiv, 135);
    })
});



// send command handler
const sendCommandHandler = (command) => {
    if (!command) return
    // console.log(command)

    command = command.replaceAll('&nbsp;', ' ');

    command = command.trim()
    let sendAbleCommand = validateSentence(command);
    // console.log("Send command " + sendAbleCommand);

    previousCommandsArray.push(sendAbleCommand)
    if (sendAbleCommand == 'clear') { window.location.reload(); return; }

    let result = {
        authToken: sessionStorage.getItem('authToken'),
        command: sendAbleCommand
    }
    socket.emit('sendcommand', result);
    commandCounter = previousCommandsArray.length;



}


// move the cursor to the end
function moveCursorToEnd(element) {
    // Make sure the element is contentEditable
    element.contentEditable = true;

    // Create a new range
    let range = document.createRange();

    // Select the element
    range.selectNodeContents(element);

    // Collapse the range to the end
    range.collapse(false);

    // Get the selection object
    let selection = window.getSelection();

    // Remove any existing selections
    selection.removeAllRanges();

    // Add the new range
    selection.addRange(range);

    // Focus on the element
    element.focus();
}

const handleMoveCursorToEnd = () => {
    setTimeout(() => { moveCursorToEnd(editableDiv) }, 300)

}


// get previous commands



// validate Sentence 

const validateSentence = (sentence) => {
    if (!sentence) return "";

    return sentence.split(' ').map((el) => el.trim()).filter((el) => el !== "").join(' ')

}
