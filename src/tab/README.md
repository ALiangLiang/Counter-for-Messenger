### Thread Object

We can't save all response data in memory(too big) so I defined a thread
object to decrease used of memory.

If need other information, you can add properties what you need. But please
don't save "all message history". It's consume too many resourse.

Thread Object:
```js
{
  id: 'thread id',
  name: 'thread name',
  tooltip: 'other user\'s name',
  type: 'USER' || 'GROUP' || 'FANPAGE',
  messages: [{ // Message Object
    senderId: 'sender\'s id',
    timestamp: 'message timestamp',
    text: 'content, if it\'s a sticker or other media, can be null',
    sticker: 'sticker url if has sticker'
    // TODO: media, e.g. picture, video...
  }],
  participants: [{ // Participant Object
    id: 'participant\'s id',
    name: 'participant\'s name',
    type: 'participant\'s type',
    url: 'participant\'s messenger url',
    messageCount: 'message count of this participant',
    textCount: 'text count of this participant',
    // Is this user still in the thread? true or false. If somebody ever send
    // messages in thread, means he was a participant. And then inGroup is false.
    inGroup: true || false
  }]
  messageCount: 'total message count',
  textCount: 'total text count'
}
```
