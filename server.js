console.log("satrted");
const { exec } = require('child_process');


// const { Server } = require('socket.io');
// const io = new Server({
//   cors: {
//     origin: "*", // Allow all origins
//     methods: ["GET", "POST"] // Allow GET and POST methods
//   }
// });

const http = require('http');
const fs = require('fs');
const path = require('path');


const port = 8000;


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
    cors: {
        origin: '*',
    }
});


io.on('connection', socket => {

    socket.on("sendcommand", command => {
        // console.log(command);
        exec(`${command}`, (err, stdout, stderr) => {
            if (err) {
                console.log(err)
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }


            socket.emit('result', stdout)
            exec('pwd', (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }

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
        // console.log(`stdout: ${stdout}`);
        socket.emit('start', stdout)
      });
    // exec(`powershell.exe -Command "pwd"`, (err, stdout, stderr) => {
    //     if (err) {
    //         console.log(err)
    //     }
    //     if (stderr) {
    //         console.log(`stderr: ${stderr}`);
    //     }

    //     socket.emit('givedir', stdout)
    // });



})

// const os = require('os');

// const platform = os.platform();

// console.log(`You are using: ${platform}`);





