import { primitiveChannel } from './primitive.js'
import { simpleReadStream, simpleWriteStream, simpleChannel } from './simple.js'
import { promisedReadStream, promisedWriteStream, promisedChannel } from './promised.js'
import { emptyReadStream, emptyWriteStream, emptyStreamable } from './empty.js'

export var createChannel = promisedChannel

export {
  primitiveChannel,
  simpleReadStream, simpleWriteStream, simpleChannel,
  promisedReadStream, promisedWriteStream, promisedChannel,
  emptyReadStream, emptyWriteStream, emptyStreamable,
}