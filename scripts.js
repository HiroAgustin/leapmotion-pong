;(function (doc)
{
  'use strict';

  var $left = $('#left'),
      $right = $('#right'),
      $ball = $('#ball'),
      SCALE = 1.6;

  function unitVector(v) {
    var mag = Math.sqrt( v.x * v.x + v.y * v.y );
    return { x: v.x / mag, y: v.y / mag };
  }

  function localToWorldCoords(pos) {
    return pos * SCALE - 100;
  }

  function getHandByType (hands, type)
  {
    return hands.filter(function (hand)
    {
      return hand.type === type;
    })[0];
  }

  function checkOutOfScreen(ball) {
    var x = localToWorldCoords(ball.pos.x);
    return x + (ball.size * 2 / SCALE - 10) > window.innerWidth || x < 0;
  }

  function checkBounds(ball) {
    if(localToWorldCoords(ball.pos.y) < 0) {
      return true;
    }
    if(localToWorldCoords(ball.pos.y) + (ball.size) > window.innerHeight) {
      return true;
    }
  }

  function AABBcollide(ball, hand, handCenterOffset) {
    var ballSize = ball.size / (2 * SCALE),
        ballCenterX = localToWorldCoords(ball.pos.x) + ballSize,
        ballCenterY = localToWorldCoords(ball.pos.y) + ballSize,

        handWidth = hand.width / (2 * SCALE),
        handHeight = hand.height / (2 * SCALE),

        handCenterX = (handCenterOffset) + handWidth,
        handCenterY = localToWorldCoords(hand.h) + handHeight;

    if (Math.abs(ballCenterX - handCenterX) > (ballSize + handWidth)) { return false; }
    if (Math.abs(ballCenterY - handCenterY) > (ballSize + handHeight)) { return false; }
    return true;
  }

  function checkHandCollision(ball, left, right) {

    if (!left || !right) {
      return false;
    }

    if (ball.heading.x > 0)
    {
      var rightWidth = right.width / (2 * SCALE);
      return AABBcollide(ball, right, window.innerWidth - rightWidth * 6);
    } else {
      return AABBcollide(ball, left, 0);
    }
  }

  function Hand(h, elem) {
    this.h = h;
    this.elem = elem;
    this.width = 20;
    this.height = 100;
  }

  Hand.prototype = {
    setPosition: function(h) {
      this.h = h;
    },

    update: function() {
      this.elem.css({
        top: localToWorldCoords(this.h) + "px"
      });
    }
  };

  function Ball(pos, elem, heading, speed) {
    this.pos = pos;
    this.elem = elem;
    this.heading = heading;
    this.speed = speed;
    this.size = 50;
  };

  Ball.prototype = {
    setPosition: function(x, y) {
      this.pos = { x: x, y: y };
    },

    setHeading: function(x, y) {
      this.heading = { x: x, y: y };
    },

    setSpeed: function(s) {
      this.speed = s;
    },

    randomizeHeading: function() {
      var yShift = Math.random() * 2 - 1,
          newHeading = { x: this.heading.x, y: this.heading.y + yShift },
          unitHeading = unitVector(newHeading);

      this.setHeading(unitHeading.x, unitHeading.y);
    },

    collide: function() {
      var newHeading = { x: -this.heading.x, y: -this.heading.y };
      this.setHeading(newHeading.x, newHeading.y);
      this.randomizeHeading();
      this.setSpeed(this.speed + 1);
    },

    wallCollide: function() {
      this.setHeading(this.heading.x, -this.heading.y);
    },

    update: function() {
      var newX = this.pos.x + this.heading.x * this.speed,
          newY = this.pos.y + this.heading.y * this.speed;

      this.setPosition(newX, newY);

      this.elem.css({
        left: localToWorldCoords(this.pos.x) + 'px',
        top: localToWorldCoords(this.pos.y) + 'px'
      });
    }
  }

  var leftHand = new Hand(0, $left),
      rightHand = new Hand(0, $right),
      ball = new Ball({x: 600, y: 70}, $ball, {x: 1, y: 0}, 3),
      leapLeftHand, leapRightHand,

      gameStart = false;

  $(window).on('keydown', function ()
  {
    ball.elem.show();
    gameStart = true;
  });

  Leap.loop(function (frame)
  {
    if (frame.hands.length)
    {
      leapLeftHand = getHandByType(frame.hands, 'right');
      leapRightHand = getHandByType(frame.hands, 'left');

      leapLeftHand && leftHand.setPosition(leapLeftHand.screenPosition()[1]);
      leapRightHand && rightHand.setPosition(leapRightHand.screenPosition()[1]);
    }

    if (checkHandCollision(ball, leftHand, rightHand)) {
      ball.collide();
    };
    if (checkBounds(ball)) {
      ball.wallCollide();
    }
    if (checkOutOfScreen(ball)) {
    } else {
      leftHand.update();
      rightHand.update();

      if (gameStart)
        ball.update();
    }

  }).use('screenPosition', {scale: 0.25});

}(document, undefined));
