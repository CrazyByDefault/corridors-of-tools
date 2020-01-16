const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// const canvasToImage = require('canvas-to-image');
registerFont('arial.ttf', { family: 'Arial' });

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

    if (preNodeLength == nodes.length) {
      canvas.style.display = "none";
    } else {
      var buf = canvas.toBuffer();
      fs.writeFileSync(`matches/canvas-${canvasNum}.png`, buf);
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

function getSymbolUri(symbol) {
  let uri;
  switch(symbol) {
      case 'cauldron':
        uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABcWlDQ1BpY2MAACiRdZE9S8NQFIbftkrFViooIuKQoYpDC0VBHKWCXapDW8GqS3KbtEKShpsUKa6Ci0PBQXTxa/Af6Cq4KgiCIog4+Av8WqTEc5tCi7Qn3JyH9573cO+5gD+tM8PuSQCG6fBMKimt5tek4Dt8iCCEEQzKzLaWsos5dI2fR6qmeIiLXt3rOkaooNoM8PURzzKLO8TzxOktxxK8RzzMSnKB+IQ4xumAxLdCVzx+E1z0+Eswz2UWAL/oKRXbWGljVuIG8RRx1NArrHkecZOwaq5kKY/RGoeNDFJIQoKCCjahw0Gcskkz6+xLNHzLKJOH0d9CFZwcRZTIGyO1Ql1VyhrpKn06qmLu/+dpazPTXvdwEuh9dd3PCSC4D9Rrrvt76rr1MyDwAlybLX+Z5jT3TXqtpUWPgcgOcHnT0pQD4GoXGH22ZC43pAAtv6YBHxfAQB4Yugf6171ZNfdx/gTktumJ7oDDI2CS6iMbf7FZZ+b4x1eOAAAACXBIWXMAAAsSAAALEgHS3X78AAADiUlEQVRoBe2Zu2sVQRTGE42iQdBK/E8EowiKNj7BQjFGoqDYWNja2NoJIooP0BBBbcTKxkctCGJjaScIvkDx/f5+YWeZe3buzOzmrrnIHvgyM2e+OXvOmbOzuzcjI510Gegy0GVgITOwuMHFl2jNn4x14+IsF35k8FeJs1L4msEVpZkQ7FLhubBVGBX6Cc4/FQgUbixROP+s4O5US4JakUeyikMOE5GrPPZ48NdHuE8Md0OEW5laVNH0V1AKufLNEAmin3wxE7/NODoci872Tv7UEOME/V2IOfVJ8x8EBN6vuV74z1upXwnwQJ1EiV5P7otOdtfWW9ax+2YgdJKgc2Ch41hdSA+fEgtxnc61lIvr92ux5+YoM3tvMV+Rh9K4ehymdlPFUylCp1CtUyBktCXdatldZm2HArCcYRnfkCMbrTM2gHsibLakIRpXjmP7HKB8XAlR/4jfpvqOjw3LZeyDm9Mfh/rOnpvjXen/ErJgxZWVm/Nbnsa8mAFf7/rYog98O07nt2TVH4f6olQ4HKf29QPenNzVX7ddoZYn8J0EJ7RukLodc54Wf1yWnM7VvxuH2lbfVUIXNLqeG9kGQKZiwjbnBBmzMd85fCilSQCpIEvjLXWiAaSyS8ApTkt+l2Z7vu7q7gCfe9RgTx2WptvvcAJ9jl3mtiZTJ8Y6cWYzeCk7Tea3WOdDO5CqcZ7ePA8WYhdWpALYIwK7EJM1mjwk3BL+dRA24SP2XQjHUzuA49xIkwV3XzFW06q8lnW+tZNyUwxOmlSNHigszajl4Zbiz3d+e3G9rIYgci5I9pFrAvdFzpomnDeyvU2oSKiEILEDoFJzTHrCesppWsCxKYHxIIWfXfYKD+oandUCbtJUxrihndNX1P8oDLKkdsteY7mulakAmCcIf7cuazyIIMj+LqGx5AZAEIcFP4iLGr8X3K94OYmwnMbOj+rClEWdALj4kWKdmlLOq9c0iONaO15ayuzgvHWcEwYnck6ao+KNCb6c04AfpWyGQ+N34nHeu7lp9WvJjNgs5gbGYWp5UkAuCTlBcE9YOSsFH+XOMdtSbi+FCeGUwEsbnBMC/yjJkqti4TiY6rOC2saR2E16TPO8uVo5I0UoCH7JtvV+WroXAkGcFCrvQdLNSy5oNR/XZIotd+AYRX9QCAlB8FrAw4mWV2TrvFSlEAic/aWm63QZ6DLQZWBoMvAX7LD+FLGovP0AAAAASUVORK5CYII=";
        break;
      case 'clover':
        uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABcWlDQ1BpY2MAACiRdZE9S8NQFIbftkrFViooIuKQoYpDC0VBHKWCXapDW8GqS3KbtEKShpsUKa6Ci0PBQXTxa/Af6Cq4KgiCIog4+Av8WqTEc5tCi7Qn3JyH9573cO+5gD+tM8PuSQCG6fBMKimt5tek4Dt8iCCEEQzKzLaWsos5dI2fR6qmeIiLXt3rOkaooNoM8PURzzKLO8TzxOktxxK8RzzMSnKB+IQ4xumAxLdCVzx+E1z0+Eswz2UWAL/oKRXbWGljVuIG8RRx1NArrHkecZOwaq5kKY/RGoeNDFJIQoKCCjahw0Gcskkz6+xLNHzLKJOH0d9CFZwcRZTIGyO1Ql1VyhrpKn06qmLu/+dpazPTXvdwEuh9dd3PCSC4D9Rrrvt76rr1MyDwAlybLX+Z5jT3TXqtpUWPgcgOcHnT0pQD4GoXGH22ZC43pAAtv6YBHxfAQB4Yugf6171ZNfdx/gTktumJ7oDDI2CS6iMbf7FZZ+b4x1eOAAAACXBIWXMAAAsSAAALEgHS3X78AAACu0lEQVRoBe2XwVLEMAxDF4b//2VYd+tUURxHbntiupc6tvTklGUGXq/n87yBS2/gS3D/LjQKY4HYxrOclJ8O39gZlBdacViP50sZWbAK9mUylmv4eTljFloF+2Izns/xeUtGFIhgnGMfF+EaPTzzc5XF+pbx7cQbnxzG6NWc9XZuC/MwGmQBps/myGe26kOG1VFmY7did2UhFa0H79jtkbFRhzmZZ9NVvkIZDBeIatWLy0ecoccXqABU7dnlJR9fYLghNRg6u8SsT7jtaFrWcw77mr56AQMxvME4RThHXuanmOgCEZQhHDLzsA45kSfTo7fVEcSGKoj97uN+C0wK9yaSbdSxuwM5TwGJoR5PZ2UXsHAFzAzzeC/y+0zlm84+6Pt0Zs02/RTREiRpcEVrXl+mqufcV/RLzCIP4/4dZ2Ov+On8R9zCIOrbEpGdjJf0LO53JjuoFzBt9RIc7ksZCz/eRz3WqB1q5SuEJhmMpqT25U1iNZ4T2zGqXsCcdom7L3JsVLyE+hXyN4OLY40L3FFbnsRXRL58tBj7My363bfSuw69Xb36Cq0CbL7SdIHFw5KdXWBpDpZZvrG3BzVYB7itle4xA6QmSpoxSNaOxmaPkseeDRj9BBSYbxNCfRg8K2y2h95ogVBItKrP9cj2nqNx5r3o2fn4J6BAOsCeoPh4GfZEXPYMZ77AIKBGFMKLkGX4vuOcvREf9UNduUAE5wWGAKHBjCgHMZ1evQBDDdKBMAFq9GV6nqEPcGOpXgCdHIazK/UpbvVvocqC8lsEqF3CfPJlOISNPuc+ZIal+3hY4SADfdiX/qXkJVbnLoDE2Yyk2jEC4m01yqGKeMf0qNQM46F24A+NPQNNR2xezVgz1y0ZWagakDFmy3tfzTB9mBM2nb4/sxDFT7jhmPFNfEfGEPo0njfwX97AH4DAaUjd5lKMAAAAAElFTkSuQmCC";
        break;
      case 'hex':
        uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABcWlDQ1BpY2MAACiRdZE9S8NQFIbftkrFViooIuKQoYpDC0VBHKWCXapDW8GqS3KbtEKShpsUKa6Ci0PBQXTxa/Af6Cq4KgiCIog4+Av8WqTEc5tCi7Qn3JyH9573cO+5gD+tM8PuSQCG6fBMKimt5tek4Dt8iCCEEQzKzLaWsos5dI2fR6qmeIiLXt3rOkaooNoM8PURzzKLO8TzxOktxxK8RzzMSnKB+IQ4xumAxLdCVzx+E1z0+Eswz2UWAL/oKRXbWGljVuIG8RRx1NArrHkecZOwaq5kKY/RGoeNDFJIQoKCCjahw0Gcskkz6+xLNHzLKJOH0d9CFZwcRZTIGyO1Ql1VyhrpKn06qmLu/+dpazPTXvdwEuh9dd3PCSC4D9Rrrvt76rr1MyDwAlybLX+Z5jT3TXqtpUWPgcgOcHnT0pQD4GoXGH22ZC43pAAtv6YBHxfAQB4Yugf6171ZNfdx/gTktumJ7oDDI2CS6iMbf7FZZ+b4x1eOAAAACXBIWXMAAAsSAAALEgHS3X78AAAB7klEQVRoBe1Wi07DMAwciP//ZYgFtq5ufHazpWFSKqHmcS/HW9jjMef5brLyN/35mOTgw8/yeXxOKuA22V3AbUcdGO0O/B3MyJfWc4Iz5svP3g69EF5TMLhW4fDUsIvCsJwOeyGQFOkyXsRB3dN4hMRCeAPVH+F4re5cDbqbbvFKCEcdmpayVUBZcNTIsFrJFQ5ilW9vutlQLFDEZRwxHuFFnCGxKEQWXHj49EJlGieOX7gs0BJlHAzdG/sMgsk0jWODhIQ4DMGMPOcKVj1Szpcig7cPEcAOyxFH11mog1CbpBz2W0jJXpTNK5wKxnuEHFaAF/mX813A6rbsDizqgH2p8Rq1xUWhMttuvrf/CGEH/D+YbsXZMU3cx3yW7V07YMW8awHW6F2AHcWiAeuAfc4uZKtwKhhvGXJYASISEr0DzBmH7YHEYUg5dh01CgW2fcSiA+Mpp4JBTRmXOGqAZEYU3AgH9XE8onXgHCao3MYzC+n5jvh1T9PVQQt5VRAWvudhGemmoWrdYCFAyobinXHSfCnA7H4HmaGDD0/LucpAF6VSiNce4Tjb89SbnBHxCgvEdCMe44QphkhODQOhnq7jmlJ1T+a9fcWl76fIiTqGFOgUr+ynRJJx/fYuYHUPdgdWd+AOf7mN/I30Mt8fb0JFSj/QRUIAAAAASUVORK5CYII=";
        break;
      case 'snake':
        uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABcWlDQ1BpY2MAACiRdZE9S8NQFIbftkrFViooIuKQoYpDC0VBHKWCXapDW8GqS3KbtEKShpsUKa6Ci0PBQXTxa/Af6Cq4KgiCIog4+Av8WqTEc5tCi7Qn3JyH9573cO+5gD+tM8PuSQCG6fBMKimt5tek4Dt8iCCEEQzKzLaWsos5dI2fR6qmeIiLXt3rOkaooNoM8PURzzKLO8TzxOktxxK8RzzMSnKB+IQ4xumAxLdCVzx+E1z0+Eswz2UWAL/oKRXbWGljVuIG8RRx1NArrHkecZOwaq5kKY/RGoeNDFJIQoKCCjahw0Gcskkz6+xLNHzLKJOH0d9CFZwcRZTIGyO1Ql1VyhrpKn06qmLu/+dpazPTXvdwEuh9dd3PCSC4D9Rrrvt76rr1MyDwAlybLX+Z5jT3TXqtpUWPgcgOcHnT0pQD4GoXGH22ZC43pAAtv6YBHxfAQB4Yugf6171ZNfdx/gTktumJ7oDDI2CS6iMbf7FZZ+b4x1eOAAAACXBIWXMAAAsSAAALEgHS3X78AAACAUlEQVRoBe1YiY4CMQjVzf7/L+8OdaiUwvTR6RzGmmgL5R3QMSY+HvM1JzAn8HUT+Fs6pvctXk/ABWoW4QLkYiVSVBqlvIwjrJIzguuq1WK9pi1xzW3V7M797GbwCUYOw1WxpjRa2NJwDUUPjryBqJeu+o9v4LerbRyEPj7ysUUxyQV6AyHStT8UI80TVMcrnb1oEQtMNVbeZnxlNa9Xu8ULcbRu4Crz1PBWc3kguksJutJ8NrhutM987t3AncyTWTnYbJ42XmcuoEC/A4/nXfHaRXk1vtKpEgsiKmJxaGGKo7wWB+UKvSLoENF4T3SUeebPut53gAu31kyyVbScjTZPcplTmsjJhiE6lrit8gjnFo939uy5gSPNEzfKn5qSxci0ZL03FcojXBqvuSEOBiHFXKuFdYxwaYzH3eTqeYS0uIybgrJ43XvmjdI6hTaAiJxuntpBG6hbLzOXmI800GOwbLGMkBstEU4UuQGrCcpZeUcupdl8C9c6L8gogAAJ1f/hmec8M8NeJBAGsUpwZa2ROsUvMQsEfUHlzD3SfBI++l8JEiHzw40n98uH/hLzpPj8zmvy6hkeMTHNPYKTB5q584ZPxLpH0OPdw8nWCu4i4Aqx9ggewcmWKu4qwZXG2momwkX0LT5pweV2DyT6hL3XzF38nTCCKTEnMCfwmRP4B/1EQTTO0WhfAAAAAElFTkSuQmCC";
        break;
      case 'diamond':
        uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABcWlDQ1BpY2MAACiRdZE9S8NQFIbftkrFViooIuKQoYpDC0VBHKWCXapDW8GqS3KbtEKShpsUKa6Ci0PBQXTxa/Af6Cq4KgiCIog4+Av8WqTEc5tCi7Qn3JyH9573cO+5gD+tM8PuSQCG6fBMKimt5tek4Dt8iCCEEQzKzLaWsos5dI2fR6qmeIiLXt3rOkaooNoM8PURzzKLO8TzxOktxxK8RzzMSnKB+IQ4xumAxLdCVzx+E1z0+Eswz2UWAL/oKRXbWGljVuIG8RRx1NArrHkecZOwaq5kKY/RGoeNDFJIQoKCCjahw0Gcskkz6+xLNHzLKJOH0d9CFZwcRZTIGyO1Ql1VyhrpKn06qmLu/+dpazPTXvdwEuh9dd3PCSC4D9Rrrvt76rr1MyDwAlybLX+Z5jT3TXqtpUWPgcgOcHnT0pQD4GoXGH22ZC43pAAtv6YBHxfAQB4Yugf6171ZNfdx/gTktumJ7oDDI2CS6iMbf7FZZ+b4x1eOAAAACXBIWXMAAAsSAAALEgHS3X78AAACOUlEQVRoBe1U2W6EMAzcVv3/P+6BkQYNxlcSo/KwSFVC7Lkctq/X+3lP4NET+N3cyd9tz8dtzFfjt2jdQroNxZt6u147YWAel92q2UpWMN8eojOA99nAtF5btFtIBibfHqIjwOjkW0OsBlg1jzDTPqaBC58NTOt1yssUKDGfcUa3lmF16NcwIDA/yuUFGeIZam40z5O0gpR9fTJTsreEBFIWS/i57Glxz76vBigTXhTmD0qalelViCo8VpRl7ky4IgBjGRf6sLZwR6JaQPfquhjTPTCr1wpW95jc3m+gBNautneNM1pKPYITw2za5OYGiHGjVUefrNzL5x7O6xesh5Ea4059+gbcRmEZeJgHMOsMtWxl0yceDnAqZIyFuvBBOONGX4F2bzn4OEAV/Kg+DqCncKSccPy9YX4mcB5Eezm8fimEFLiZ9wdIYaxXHoxVr56xPjAnHzqANOkQAILsRIBi4wodi/Ki7U3q0khsIhCJUOvwNuI1PXkBRNkEKEtRz2jQYfPiJQog9cyg9FiP4DJu4CIN6QnrFZGQIBOAy2T1pp9pt00p8eeWI4NR7SCs3ACaLUJvcsBUVovD0jK5RgIIgUfsnZuiyeEQ12iAKETi61K2jFpnFyAfzAQQPAtZnwBrVPfMWcWUf8QWoRbU7xZGnyH8DHbnmr0BGJkVZhzvwVteVwOI0IqBFewesiMAT2vZEJNV9t0BKpqtPf8RoPWW7ggQGYxqrTfTQYZ/kcLF+w7uN8djJvAHgaZFUzOgIzcAAAAASUVORK5CYII=";
        break;
      case 'plus':
        uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABcWlDQ1BpY2MAACiRdZE9S8NQFIbftkrFViooIuKQoYpDC0VBHKWCXapDW8GqS3KbtEKShpsUKa6Ci0PBQXTxa/Af6Cq4KgiCIog4+Av8WqTEc5tCi7Qn3JyH9573cO+5gD+tM8PuSQCG6fBMKimt5tek4Dt8iCCEEQzKzLaWsos5dI2fR6qmeIiLXt3rOkaooNoM8PURzzKLO8TzxOktxxK8RzzMSnKB+IQ4xumAxLdCVzx+E1z0+Eswz2UWAL/oKRXbWGljVuIG8RRx1NArrHkecZOwaq5kKY/RGoeNDFJIQoKCCjahw0Gcskkz6+xLNHzLKJOH0d9CFZwcRZTIGyO1Ql1VyhrpKn06qmLu/+dpazPTXvdwEuh9dd3PCSC4D9Rrrvt76rr1MyDwAlybLX+Z5jT3TXqtpUWPgcgOcHnT0pQD4GoXGH22ZC43pAAtv6YBHxfAQB4Yugf6171ZNfdx/gTktumJ7oDDI2CS6iMbf7FZZ+b4x1eOAAAACXBIWXMAAAsSAAALEgHS3X78AAABd0lEQVRoBe1Y2w7CMAidly8w8cH4Df7/n/lgvI2aJoyU2VJo14Qlc5OVA+cA1Wya/OirwE4p/AfhwP1+Pt/IBrdgw+vAVh3/CCjKR0wqXiP8Nd5oXkGVVsfTIlBLAufRCdxHJ/CwIEAHTRojtbvk2qQxg1/LGahKlHO22EZjLK3qRrzktWUFTGKZgCalmqYDY68yW7UQHeCqJNecW1ZgLQ/xMycglk7JEW91zfpWM3dvISU1xTDDVwDPQIkK/+aFw5X6sbnhHzJtcIrHkeKSo/50XcAbvoVKCJyoBFv4jlvoNSeUIgSlhFck9DXJFvIXv5fJ6s8EQ6lfAupnwoP1D5wF6fQg5I5bSEIAC9CFBybQPRmJAqmhleD08LlBUC3VJe2nEn/kCoSqO4EgQ8cPvAtppsHNlnRW2Ny8hVhpGj2wqsBlzh/+/EHLxNOEEterpcFobwNurq001mK9VQUWQSy/OAFLdXOwvQI5KlmuGb4CluI4do4CX+k+ItLqDydOAAAAAElFTkSuQmCC";
        break;
  }
  return uri;
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
        img.onload = () => {
          try {
            console.log("DRAWING", symbol, x-imgSize/2, y-imgSize/2, imgSize, imgSize);
            savectx.drawImage(img, x-imgSize/2, y-imgSize/2, imgSize, imgSize);
          } catch (e) {
            console.log("error drawing image", e);
            return;
          }
        }
        img.onerror = err => {
          console.log("IMG ERROR");
          throw err;
        }
        img.src = getSymbolUri(symbol);
        // img.src = `http://light.cryptarch.wiki/corridors/${symbol}.png`;

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
