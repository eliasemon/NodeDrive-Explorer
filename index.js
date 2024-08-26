const express = require("express");
const bodyParser = require("body-parser");
const serveIndex = require("serve-index");
const { getDiskInfo } = require('node-disk-info');
app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const fs = require("fs");

let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Explorer</title>
  <style>
    a {
      text-decoration: none;
    }

    .folder {
      width: 100px;
      height: 70px;
      background-color: #f0c14b;
      border-radius: 4px;
      position: relative;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: bold;
      color: white;
    }

    .folder::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 10px;
      width: 80px;
      height: 30px;
      background-color: #f0c14b;
      border-radius: 4px 4px 0 0;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .file-name {
      text-align: center;
      font-size: 14px;
      color: #333;
    }

    .group {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }

    .heading {
      width: 100%;
      margin: 20px 0;
    }
  </style>
</head>
<body>
`;

const lastHtml = `
</div>
</body>
</html>`;

let driveLetter = "";

folderToStatic = (files) => {
  files.forEach((v) => {
    if (
      v.isDirectory() &&
      v.name !== "node_modules" &&
      v.name !== "$RECYCLE.BIN" &&
      v.name !== "System Volume Information"
    ) {
      const path = `${v.path}\\${v.name}`;
      const routePath = `/${v.path.slice(0, 1)}/${v.name.replaceAll(" ", "_")}`;
      app.use(
        routePath,
        express.static(path),
        serveIndex(path, { icons: true })
      );
      if (v.path !== driveLetter) {
        driveLetter = v.path;
        html += `
                <div class="heading">
                  <h1>Drive:: ${v.path.slice(0, 1)}</h1>
                </div>
                <div class="group">
                `
      }

      html += `
            <a href="${routePath}">  
                <div class="folder" >${driveLetter.slice(0, 1)}</div>
                <p class="file-name" > ${v.name} </p>
            </a>
            `;
    }
  });
};

const folderLoadFn = (path) => {
  fs.readdir(path, { withFileTypes: true }, (err, files) => {
    if (!err) {
      folderToStatic(files);
    }
  });
};

const diskLoadfn = async () => {
  try {
    const disks = await getDiskInfo();
    disks.forEach((disk) => {
      if (disk.mounted !== "C:") {
        folderLoadFn(disk.mounted);
      }
    });

  } catch (e) {
    console.error(e);
  }
};

diskLoadfn().then(() => {
  html += lastHtml;
  app.get("/", (req, res) => {
    res.write(html);
    res.end();
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
