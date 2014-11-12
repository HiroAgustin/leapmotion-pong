;(function (doc)
{
  'use strict';

  var output = doc.getElementById('output');

  Leap.loop(function (frame)
  {
    output.innerHTML = 'Hands: ' + frame.hands.length;
  });

}(document, undefined));
