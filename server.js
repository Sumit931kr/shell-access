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


    io.on('connection', socket => {
        console.log("connectionrequest")
        socket.on("sendcommand", command => {
            console.log("command " + command);
            exec(`${command}`, (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }
                console.log(stdout);

                socket.emit('result', stdout)
                exec('pwd', (err, stdout, stderr) => {
                    if (err) {
                        console.log(err)
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                    }
                    console.log("give dir " + stdout)
                    socket.emit('givedir', stdout)
                });


            })

        })

        exec('pwd', (err, stdout, stderr) => {
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


