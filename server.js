

let userDirectories = new Map();

const getUserDirectory = (socketId) => {
    return userDirectories.get(socketId) || '';
}

const setUserDirectory = (socketId, directory) => {
    userDirectories.set(socketId, directory);
}

const removeUserDirectory = (socketId) => {
    userDirectories.delete(socketId);
}



function initialization(passCode) {

    // console.log("started");
    const { exec } = require('child_process');;


    const http = require('http');
    const fs = require('fs');
    const path = require('path');


    const port = 8765;

    // const passCode = passCode;


    const server = http.createServer((req, res) => {
        // Get the file path from the URL
        let filePath = path.join(__dirname, 'client', req.url === '/' ? 'index.html' : req.url);

        // Get the file extension
        const extname = path.extname(filePath);

        // Set the content type based on the file extension
        let contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
        }

        // Read the file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // File not found
                    fs.readFile(path.join(__dirname, 'client', '404.html'), (err, content) => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    });
                } else {
                    // Server error
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                // Success
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });


    const io = require("socket.io")(server.listen(port, () => {
        // console.log(`Server running at http://localhost:${port}/`);
    }), {
        path: '/socket.io/other',
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        }
    });

    // console.log(io)


    
    io.on('connect', socket => {
        let directoryControl = getUserDirectory(socket.id)
        // console.log(socket.id)

        socket.on("passcode-verify", passcode => {
            // console.log("passcode")
            // console.log(passcode);
            if (passcode == passCode) {
                socket.emit('passcode-verified', encrypt(passCode));
            }
            else {
                // console.log("passcode not matched")
                socket.emit('passcode-failed', "wrong")
            }
        })

        socket.on("sendcommand", ({authToken,command}) => {

            let decryptText = decrypt(authToken);
            // console.log(decryptText)
            if(decryptText !== passCode) {
                socket.emit('passcode-failed', "wrong")
            }

            let isError = false;

            if (command == 'cd /') {
                // console.log("cd / ----  found");
                setUserDirectory(socket.id, "")
            }

            // execute commands
            let execuetCommand = directoryControl ? `cd  ${directoryControl} && ${command}` : command
            // console.log("execu command " + execuetCommand);
            execuetCommand = execuetCommand.replaceAll('&nbsp;', ' ');
            exec(execuetCommand, (err, stdout, stderr) => {
                if (err) {
                    // console.log("erro " + err)
                    console.log(err)
                    // socket.emit('result', stderr);
                    isError = true;

                }
                else if (stderr) {
                    // console.log(`stderr: ${stderr}`);
                    socket.emit('result', stderr);
                    isError = true;

                }

                if (!isError && command.search('cd ') == 0) {
                    // console.log("cd found");


                    let dir = command.split(' ');
                    let dotdir = dir[1];
                    // console.log(dotdir);
                    let addCmd = dotdir + (dotdir[dotdir.length - 1] == '/' ? "" : "/")
                    // console.log(addCmd)
                    directoryControl += addCmd;
                    setUserDirectory(socket.id, directoryControl)
                }

                socket.emit('result', stdout)

                // give back the current directory
                let dirCommand = directoryControl ? `cd ${directoryControl} && pwd` : "pwd"
                exec(dirCommand, (err, stdout, stderr) => {
                    if (err) {
                        console.log(err)
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                    }
                    // console.log("give dir " + stdout)
                    socket.emit('givedir', stdout)
                });

            })
        })


        // give back the current directory
        let dirCommand = directoryControl ? `cd ${directoryControl} && pwd` : "pwd"
        exec(dirCommand, (err, stdout, stderr) => {
            if (err) {
                console.log(err)
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            // the *entire* stdout and stderr (buffered)
            socket.emit('start', stdout)
            // console.log("adfter")
            // console.log(`stdout: ${stdout}`);
        });



    })
}

function encrypt(text, shift) {
    if (!shift) shift = 3;
    return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 65 : 97;
            return String.fromCharCode(((code - base + shift) % 26) + base);
        }
        return char;
    }).join('');
}

function decrypt(text, shift) {
    if (!shift) shift = 3;
    return encrypt(text, 26 - shift);
}


module.exports = initialization;


