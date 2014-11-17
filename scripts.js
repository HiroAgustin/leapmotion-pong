;(function (win, doc, $)
{
  'use strict';

  var SCALE = 1.6;

  function unitVector (v)
  {
    var mag = Math.sqrt( v.x * v.x + v.y * v.y );

    return {
      x: v.x / mag
    , y: v.y / mag
    };
  }

  function localToWorldCoords (pos)
  {
    return pos * SCALE - 100;
  }

  function getHandByType (hands, type)
  {
    return hands.filter(function (hand)
    {
      return hand.type === type;
    })[0];
  }

  function checkOutOfScreen (ball)
  {
    var x = localToWorldCoords(ball.pos.x);

    return x + (ball.size * 2 / SCALE - 10) > win.innerWidth || x < 0;
  }

  function checkBounds (ball)
  {
    return localToWorldCoords(ball.pos.y) < 0 || localToWorldCoords(ball.pos.y) + ball.size > win.innerHeight;
  }

  function aAbBcollide (ball, hand, handCenterOffset)
  {
    var ballSize = ball.size / (2 * SCALE)
      , ballCenterX = localToWorldCoords(ball.pos.x) + ballSize
      , ballCenterY = localToWorldCoords(ball.pos.y) + ballSize

      , handWidth = hand.width / (2 * SCALE)
      , handHeight = hand.height / (2 * SCALE)

      , handCenterX = handCenterOffset + handWidth
      , handCenterY = localToWorldCoords(hand.h) + handHeight;

    return !(Math.abs(ballCenterX - handCenterX) > ballSize + handWidth || Math.abs(ballCenterY - handCenterY) > ballSize + handHeight);
  }

  function checkHandCollision (ball, left, right)
  {
    if (!left || !right)
      return false;

    if (ball.heading.x > 0)
      return aAbBcollide(ball, right, win.innerWidth - (right.width / (2 * SCALE)) * 6);

    else
      return aAbBcollide(ball, left, 0);
  }

  function Hand (h, elem)
  {
    this.h = h;
    this.elem = elem;
    this.width = 20;
    this.height = 100;
  }

  Hand.prototype = {

    setPosition: function (h)
    {
      this.h = h;
    }

  , update: function ()
    {
      this.elem.css({
        top: localToWorldCoords(this.h) + 'px'
      });
    }
  };

  function Ball(pos, elem, heading, speed)
  {
    this.pos = pos;
    this.elem = elem;
    this.heading = heading;
    this.speed = speed;
    this.size = 50;
  }

  Ball.prototype = {

    setPosition: function (x, y)
    {
      this.pos = {
        x: x
      , y: y
      };

      return this;
    }

  , setHeading: function (x, y)
    {
      this.heading = {
        x: x
      , y: y
      };

      return this;
    }

  , setSpeed: function (s)
    {
      this.speed = s;

      return this;
    }

  , randomizeHeading: function ()
    {
      var yShift = Math.random() * 2 - 1

        , newHeading = {
            x: this.heading.x,
            y: this.heading.y + yShift
          }

        , unitHeading = unitVector(newHeading);

      return this.setHeading(unitHeading.x, unitHeading.y);
    }

  , collide: function ()
    {
      var newHeading = {
            x: -this.heading.x
          , y: -this.heading.y
          };

      return this
        .setHeading(newHeading.x, newHeading.y)
        .randomizeHeading()
        .setSpeed(this.speed + 1);
    }

  , wallCollide: function ()
    {
      return this.setHeading(this.heading.x, -this.heading.y);
    }

  , update: function ()
    {
      var pos = this.pos
        , newX = pos.x + this.heading.x * this.speed
        , newY = pos.y + this.heading.y * this.speed;

      this.setPosition(newX, newY);

      this.elem.css({
        left: localToWorldCoords(pos.x) + 'px'
      , top: localToWorldCoords(pos.y) + 'px'
      });
    }
  };

  var leftHand = new Hand(0, $(doc.getElementById('left')))
    , rightHand = new Hand(0, $(doc.getElementById('right')))

    , ball = new Ball({x: 600, y: 70}, $(doc.getElementById('ball')), {x: 1, y: 0}, 3)

    , leapLeftHand = null
    , leapRightHand = null

    , gameStart = false;

  $(win).on('keydown', function ()
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

      if (leapLeftHand)
        leftHand.setPosition(leapLeftHand.screenPosition()[1]);

      if (leapRightHand)
        rightHand.setPosition(leapRightHand.screenPosition()[1]);
    }

    if (checkHandCollision(ball, leftHand, rightHand))
      ball.collide();

    if (checkBounds(ball))
      ball.wallCollide();

    if (!checkOutOfScreen(ball))
    {
      leftHand.update();
      rightHand.update();

      if (gameStart)
        ball.update();
    }

  }).use('screenPosition', {scale: 0.25});

}(window, document, jQuery));
