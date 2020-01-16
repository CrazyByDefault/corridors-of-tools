const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// const canvasToImage = require('canvas-to-image');
registerFont('arial.ttf', { family: 'Arial' })

class Node {
  constructor(id, subNodes, openSides, symbol=null, corridorLink) {
    this.id = id;
    this.subNodes = subNodes;
    this.openSides = openSides;
    this.symbol = symbol;
    this.corridorLink = corridorLink;
  }
}

class SubNode {
  constructor(code = "") {
    this.code = code;
  }
}

var dataTest = [];
var nodes = [];
const size = 30;
const moveSize = size+2;
const moveY = moveSize * Math.sqrt(3);
const moveX = moveSize + moveSize/2;

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var data = JSON.parse(this.responseText);

    data.feed.entry.forEach(function(sheetData){
      if (sheetData["gs$cell"]["col"] == 2 && sheetData["gs$cell"]["row"] >=2) {
        x = sheetData.content["$t"];
        x = x.replace(/\\""/g, '"');
        try {
          JSON.parse(x);
        } catch(e) {
          return;
        }
        dataTest.push(JSON.parse(x));
      }
    });

    var count = 0;
  
  dataTest.forEach(function(data) {
    var newSubNodes = [];
    try {
      data.nodes.forEach(function(subData){
        if (subData.join('') == "BBBBBBB") {
          var newSubNode = new SubNode();
        } else {
          var newSubNode = new SubNode(subData.join(''));
        }
        newSubNodes.push(newSubNode);
      });
    } catch(e) {
      return;
    }
    
    var newOpenSides = [];
    for(i=0; i<6; i++) {
      if (!data.walls[i]) {
        newOpenSides.push(i+1);
      }
    }

    var newSymbol;
    switch(data.center) {
      case 'T':
        newSymbol = "cauldron";
        break;
      case 'C':
        newSymbol = "clover";
        break;
      case 'H':
        newSymbol = "hex";
        break;
      case 'S':
        newSymbol = "snake";
        break;
      case 'D':
        newSymbol = "diamond";
        break;
      case 'P':
        newSymbol = "plus";
        break;
      case 'B':
        newSymbol = null;
        break;
    }

    var btoa = Buffer.from(JSON.stringify(data)).toString('base64');
    var corridors = "https://tjl.co/corridors-of-time/viewer.html#"+btoa;

    var newNode = new Node(count, newSubNodes, newOpenSides, newSymbol, corridors);
    nodes.push(newNode);
    count++;
  });

  var canvasNum = 1;
  while(nodes.length > 0) {
    // var c = document.getElementById('myCanvas');
    
    var canvas = createCanvas(1000, 1000);
    canvas.id = "canvas-"+canvasNum;
    canvas.width = 1000;
    canvas.height = 1000;
    canvas.style = {};
    canvas.style.border = "1px solid";

    // var body = document.getElementsByTagName("body")[0];
    // body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var head = nodes.shift();
    head.x = 500;
    head.y = 500;

    var preNodeLength = nodes.length;
    drawHexagon(head.x, head.y, head.openSides, head.symbol, ctx, head.id, head.corridorLink);
    drawSolution(head, nodes, ctx);

    var buf = canvas.toBuffer();
    fs.writeFileSync(`matches/canvas-${canvasNum}.png`, buf);

    if (preNodeLength == nodes.length) {
      canvas.style.display = "none";
    }
    canvasNum++;
  }


  }
};
xmlhttp.open("GET", "https://spreadsheets.google.com/feeds/cells/1bYi_-XApwf_avyIuExGULdWa4oxzLr7upelAtRq38TA/1/public/full?alt=json", true);
xmlhttp.send();

function drawSolution(head, targetNodes, ctx) {
  for (var i=0; i<nodes.length; i++) {
    nodeTested = nodes[i];
    newX = head.x;
    newY = head.y;
    var foundMatch = false;
    if (!head.subNodes[0].linkedNode && (head.subNodes[0].code || nodeTested.subNodes[3].code) && head.subNodes[0].code == nodeTested.subNodes[3].code) {
      head.subNodes[0].linkedNode = nodes.splice(i,1);
      nodeTested.subNodes[3].linkedNode = head;
      foundMatch = true;
      newY = newY - moveY;
    } else if (!head.subNodes[1].linkedNode && (head.subNodes[1].code || nodeTested.subNodes[4].code)  && head.subNodes[1].code == nodeTested.subNodes[4].code) {
      head.subNodes[1].linkedNode = nodes.splice(i,1);
      nodeTested.subNodes[4].linkedNode = head;
      foundMatch = true;
      newX = newX + moveX;
      newY = newY - (moveY/2);
    } else if (!head.subNodes[2].linkedNode && (head.subNodes[2].code || nodeTested.subNodes[5].code)  && head.subNodes[2].code == nodeTested.subNodes[5].code) {
      head.subNodes[2].linkedNode = nodes.splice(i,1);
      nodeTested.subNodes[5].linkedNode = head;
      foundMatch = true;
      newX = newX + moveX;
      newY = newY + (moveY/2);
    } else if (!head.subNodes[3].linkedNode && (head.subNodes[3].code || nodeTested.subNodes[0].code)  && head.subNodes[3].code == nodeTested.subNodes[0].code) {
      head.subNodes[3].linkedNode = nodes.splice(i,1);
      nodeTested.subNodes[0].linkedNode = head;
      foundMatch = true;
      newY = newY + moveY;
    } else if (!head.subNodes[4].linkedNode && (head.subNodes[4].code || nodeTested.subNodes[1].code)  && head.subNodes[4].code == nodeTested.subNodes[1].code) {
      head.subNodes[4].linkedNode = nodes.splice(i,1);
      nodeTested.subNodes[1].linkedNode = head;
      foundMatch = true;
      newX = newX - moveX;
      newY = newY + (moveY/2);
    } else if (!head.subNodes[5].linkedNode && (head.subNodes[5].code || nodeTested.subNodes[2].code)  && head.subNodes[5].code == nodeTested.subNodes[2].code) {
      head.subNodes[5].linkedNode = nodes.splice(i,1);
      nodeTested.subNodes[2].linkedNode = head;
      foundMatch = true;
      newX = newX - moveX;
      newY = newY - (moveY/2);
    }

    if (foundMatch) {
      nodeTested.x = newX;
      nodeTested.y = newY;
      drawHexagon(nodeTested.x, nodeTested.y, nodeTested.openSides, nodeTested.symbol, ctx, nodeTested.id, nodeTested.corridorLink);
      drawSolution(nodeTested, targetNodes);
    }
  }


}

// hexagon
function drawHexagon(x, y, omittedSides, symbol, ctx, id, link) {
  var numberOfSides = 6,
      Xcenter = x,
      Ycenter = y;
  if (symbol) {
        // var img = new Image();
        // img.src = `https://light.cryptarch.wiki/corridors/${symbol}.png`;
        var imgSize = 30;
        var savectx = ctx;
        console.log("fetching png", symbol);

        const img = new Image()
        img.onload = () => savectx.drawImage(img, x-imgSize/2, y-imgSize/2, imgSize, imgSize);
        img.onerror = err => {
          console.log("IMG ERROR");
          throw err;
        }
        img.src = `images/${symbol}.png`;

        // img.onload = () => {
        //   try {
        //     savectx.drawImage(img, x-imgSize/2, y-imgSize/2, imgSize, imgSize);
        //   } catch(e) {
        //     console.log("error drawing image", e);
        //     return;
        //   }
        // }
  }

  try {
    ctx.font = "12px Arial";
    ctx.fillText(id+2, x-10, y-12);
  } catch(e) {
    return;
  }

  var currentX = Xcenter +  size * Math.cos(0);
  var currentY = Ycenter +  size *  Math.sin(0);
  for (var i = 1; i <= numberOfSides; i+=1) {
      ctx.beginPath();
      ctx.moveTo (currentX, currentY);
      var nextX = Xcenter + size * Math.cos(-i * 2 * Math.PI / numberOfSides);
      var nextY = Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides);
      ctx.lineTo (nextX, nextY);
      currentX = nextX;
      currentY = nextY;
      ctx.strokeStyle = "#000000";

      ctx.lineWidth = 1;
      if ( omittedSides.includes(((i+7) % 6) + 1) ) {
        ctx.strokeStyle = "#ffffff";
      }
      ctx.stroke();
  }
}
