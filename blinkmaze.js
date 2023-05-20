// https://unpkg.com/handsfree@4.0.3/dist/handsfree.js
var myHandsfree;
var element = document.getElementById('handsfree-cursor');

function setup() {
  canvas = createCanvas(windowWidth, windowHeight/2);
  var myConfig = {
    weboji: true,
    debugger: true,
    hideCursor: false,
    pose: true
  };
  myHandsfree = new Handsfree(myConfig);
  myHandsfree.start();
  
$(document).on('mouseover', '#maze td, div.handsfree-cursor', function(event) {
  var cellId = $(this).attr('id');
  var borderPosition = getBorderPosition(cellId, event.pageX, event.pageY);
  
  if (borderPosition !== null) {
    var borderStyle;
    switch (borderPosition) {
      case 'top':
        borderStyle = 'border-top-color';
        break;
      case 'right':
        borderStyle = 'border-right-color';
        break;
      case 'bottom':
        borderStyle = 'border-bottom-color';
        break;
      case 'left':
        borderStyle = 'border-left-color';
        break;
    }
      
    $(this).css(borderStyle, 'red');
    if (isLosingBorder(cellId, borderPosition)) {
      showLosePopup("Sorry, try again.");
      myHandsfree.stop();
      $('div.handsfree-cursor').on('mouseout', function() {
        $(this).parent().css('border-color', 'black');
    });
    }
  }
});

$(document).on('mouseover', 'handsfree-cursor', function(event) {
  var cellId = $(this).parent().attr('id');
  var borderPosition = getBorderPosition(cellId, event.pageX, event.pageY);
  
  if (borderPosition !== null) {
    var borderStyle;
    switch (borderPosition) {
      case 'top':
        borderStyle = 'border-top-color';
        break;
      case 'right':
        borderStyle = 'border-right-color';
        break;
      case 'bottom':
        borderStyle = 'border-bottom-color';
        break;
      case 'left':
        borderStyle = 'border-left-color';
        break;
    }
      
    $(this).parent().css(borderStyle, 'red');

    if (isLosingBorder(cellId, borderPosition)) {
      showPopup("Sorry, try again");
      $('div.handsfree-cursor').on('mouseout', function() {
        $(this).parent().css('border-color', 'black');
    });
    }
    
  }
});

function isLosingBorder(cellId, borderPosition) {
  var coordinates = cellId.split('-');
  var row = parseInt(coordinates[0]);
  var col = parseInt(coordinates[1]);

  switch (borderPosition) {
      case 'top':
          if (row === 0 || disp[row][col][0] === 0) {
              return true;
          }
          break;
      case 'right':
          if (col === disp[row].length - 1 || disp[row][col][1] === 0) {
              return true;
          }
          break;
      case 'bottom':
          if (row === disp.length - 1 || disp[row][col][2] === 0) {
              return true;
          }
          break;
      case 'left':
          if (col === 0 || disp[row][col][3] === 0) {
              return true;
          }
          break;
  }
  
  return false;
}

function showLosePopup(message) {
  var popup = document.createElement('div');
  popup.className = 'popup';
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(function() {
    popup.parentNode.removeChild(popup);
  }, 3000);
} 
function getBorderPosition(cellId, cursorX, cursorY) {
  var coordinates = cellId.split('-');
  var row = parseInt(coordinates[0]);
  var col = parseInt(coordinates[1]);

  var cellRect = document.getElementById(cellId).getBoundingClientRect();
  var relativeX = cursorX - cellRect.left;
  var relativeY = cursorY - cellRect.top;

  if (relativeY <= 2 && disp[row][col][0] === 0) {
      return 'top';
  } else if (relativeX >= cellRect.width - 2 && disp[row][col][1] === 0) {
      return 'right';
  } else if (relativeY >= cellRect.height - 2 && disp[row][col][2] === 0) {
      return 'bottom';
  } else if (relativeX <= 2 && disp[row][col][3] === 0) {
      return 'left';
  }
  return null;
}

}

function draw() {
  background(0, 0, 0);

  if (myHandsfree.isTracking) {
    if (myHandsfree.pose.length > 0) {
      var face1 = myHandsfree.pose[0].face;
      var nPoints = face1.vertices.length;

      fill(255, 100, 0);
      for (var i = 64; i < nPoints; i += 2) {
        var x = face1.vertices[i + 0];
        var y = face1.vertices[i + 1];
        text((i / 2).toString(), x, y);
      }
      var rx = face1.rotationX *-1; // pitch
      var ry = face1.rotationY *-1; // yaw
      var rz = face1.rotationZ *-1; // roll

      if (detectBlinks(face1)) {
        console.log("blink!");
      }
    }
  }
}

function detectBlinks(face1) {
  for (var j = 36; j <= 47; j++) {
    //compare point location to surrounding points
    var curX = face1.vertices[j + 0];
    var curY = face1.vertices[j + 2];
    for (var k = 36; k <= 47; k++) {
      if (k == j) {
        continue;
      }
      var checkX = face1.vertices[k + 0];
      var checkY = face1.vertices[k + 2];
      if (checkX == curX && checkY == curY) {
        return true;
      }
    }
  }
  return false;
}

function newMaze(x, y) {

    // Establish variables and starting grid
    var totalCells = x*y;
    var cells = new Array();
    var unvis = new Array();
    for (var i = 0; i < y; i++) {
        cells[i] = new Array();
        unvis[i] = new Array();
        for (var j = 0; j < x; j++) {
            cells[i][j] = [0,0,0,0];
            unvis[i][j] = true;
        }
    }
    
    var currentCell = [Math.floor(Math.random()*y), Math.floor(Math.random()*x)];
    var path = [currentCell];
    unvis[currentCell[0]][currentCell[1]] = false;
    var visited = 1;

    while (visited < totalCells) {
        var pot = [[currentCell[0]-1, currentCell[1], 0, 2],
                [currentCell[0], currentCell[1]+1, 1, 3],
                [currentCell[0]+1, currentCell[1], 2, 0],
                [currentCell[0], currentCell[1]-1, 3, 1]];
        var neighbors = new Array();
        
        for (var l = 0; l < 4; l++) {
            if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
        }

        if (neighbors.length) {
            next = neighbors[Math.floor(Math.random()*neighbors.length)];
            
            cells[currentCell[0]][currentCell[1]][next[2]] = 1;
            cells[next[0]][next[1]][next[3]] = 1;
            
            unvis[next[0]][next[1]] = false;
            visited++;
            currentCell = [next[0], next[1]];
            path.push(currentCell);
        }
        else {
            currentCell = path.pop();
        }
    }
    //just checking for DOM element
    if (element !== null) {
      console.log('Element exists');
    } else {
   
      console.log('Element does not exist');
    }
    return cells;

}
