function initialization() {

    console.log("started");
    const { exec } = require('child_process');;


    const http = require('http');
    const fs = require('fs');
    const path = require('path');


    const port = 8765;


    const server = http.createServer((req, res) => {
        // Serve the .html file
        const filePath = path.join(__dirname, 'index.html'); // Replace 'index.html' with your file name

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Internal Server Error');
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);
            }
        });
    });

    const io = require("socket.io")(server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    }), {
        path: '/socket.io/other',
        cors: {
            origin: '*',
        }
    });


    let directoryControl = ""

    io.on('connection', socket => {

        socket.on("sendcommand", command => {
            console.log("command " + command);

            let isError = false;

            if(command == 'cd /'){
                console.log("cd / ----  found");
                directoryControl = ""
            }

            // execute commands
            execuetCommand = execuetCommand.replaceAll('&nbsp;', ' ');
            let execuetCommand = directoryControl ? `cd  ${directoryControl} && ${command}` : command
            exec(execuetCommand, (err, stdout, stderr) => {
                if (err) {
                    console.log("erro " + err)
                    console.log(err)
                    socket.emit('result', stderr);
                    isError = true;
                    
                }
                else if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    socket.emit('result', stderr);
                    isError = true;

                }

                console.log("dir  " + directoryControl)

                if ( !isError && command.search('cd ') == 0) {
                    console.log("cd found");


                    let dir = command.split(' ');
                    let dotdir = dir[1];
                    console.log(dotdir);
                    let addCmd = dotdir + (dotdir[dotdir.length-1] == '/' ? "" : "/")
                    console.log(addCmd)
                    directoryControl += addCmd;
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
            console.log(`stdout: ${stdout}`);
            socket.emit('start', stdout)
        });



    })

    // const os = require('os');

    // const platform = os.platform();

    // console.log(`You are using: ${platform}`);


}

// initialization();

module.exports = initialization;


